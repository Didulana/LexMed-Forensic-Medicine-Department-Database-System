# LexMed Node.js Express Backend

This robust REST API securely exposes the LexMed forensic database, enforcing strict Role-Based Access Control (RBAC), multi-layer database permissions, and parameter-driven SQL queries. ORMs have been entirely avoided in favor of raw `mysql2` prepared statements to guarantee complete visibility and prevent abstraction leaks.

## Security & Architecture Highlights

1.  **Multi-Pool Database Design (`src/db/pool.js`)**: Instead of connecting to MySQL with a single omnipotent root user, the server instantiates 5 distinct connection pools matching the Phase 1 MySQL roles (`jmoPool`, `policePool`, `clerkPool`, `adminPool`, `auditorPool`). 
2.  **Role-Injected Connections (`src/middleware/dbInjector.js`)**: Upon authenticating a JWT, the server dynamically checks out a connection from the pool corresponding to the user's encoded role. MySQL natively rejects queries the user lacks permissions for.
3.  **Audit Triggers Compatibility**: The `dbInjector` middleware executes `SET @current_user_id = ?` on the checked-out connection before yielding to the route controller, ensuring all Phase 1 MySQL audit triggers log accurately. The connection is automatically released on the `res.on('finish')` event.
4.  **Anti-Injection (SQL & XSS)**: All repository queries use strict `?` parameterization. Complex object parameters are validated through `Zod` schemas in the routing layer, and text inputs meant for human consumption are sanitized via the `xss` library to prevent stored Cross-Site Scripting.

---

## Endpoints & RBAC Matrix

| Endpoint | Method | Required App Role | Database Pool Invoked | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/login` | POST | *None* | `adminPool` | Authenticates user; locks after 5 fails; sets Secure SameSite Cookie. |
| `/cases` | GET | JMO, Clerk, Police, Auditor | `[User's Pool]` | Returns a list of cases via `v_case_public` or `v_case_full`. |
| `/cases` | POST | JMO, Clerk | `[User's Pool]` | Creates a base forensic case securely. |
| `/clinical/clinical-exams` | GET, POST | JMO | `jmoPool` | Manages clinical exams. JMO logic ensures they only see their own cases. |
| `/clinical/postmortems` | GET, POST | JMO | `jmoPool` | Scoped PMR creation and retrieval. |
| `/clinical/postmortems/:id/cause-of-death`| POST | JMO | `jmoPool` | Records official COD. |
| `/evidence` | POST | Clerk | `clerkPool` | Logs new physical evidence attached to a case. |
| `/evidence/:id/transfer` | POST | Clerk | `clerkPool` | Appends a chain of custody record and modifies current availability. |
| `/admin/users/:id/deactivate` | POST | Admin | `adminPool` | Drops active sessions and locks user account. |
| `/admin/audit-log` | GET | Admin, Auditor | `[User's Pool]` | Fetches tamper-evident logs for system review. |

---

## Appendix: Sample SQL Queries

Because no ORM is utilized, the SQL executed by this application is 100% transparent. Here is a representative sample of queries executed from within the `/src/repositories/` layer:

**1. Authenticating a User (AuthRepo)**
```sql
SELECT u.user_id, u.username, u.password_hash, u.status, r.role_name 
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.username = ?
```

**2. Scoped JMO Exams (ClinicalRepo)**
```sql
SELECT * FROM clinical_exams 
WHERE jmo_id = ? 
ORDER BY created_at DESC
```

**3. Generating a Forensic Case (CaseRepo)**
```sql
CALL sp_create_forensic_case(?, ?, ?, ?, ?, @out_case_id);
SELECT @out_case_id AS case_id;
```

**4. Locking an Account after brute-force (AuthRepo)**
```sql
UPDATE users SET status = ? WHERE user_id = ?
```

**5. Fetching Chain of Custody with Joins (EvidenceRepo)**
```sql
SELECT c.*, u.username as released_by_username 
FROM chain_of_custody c
LEFT JOIN users u ON c.released_by_user = u.user_id
WHERE c.item_id = ? 
ORDER BY c.transfer_time ASC
```

**6. Deactivating a User (AdminRepo)**
```sql
CALL sp_deactivate_user(?)
```
