# LexMed: Forensic Medicine Department Database System (FMDDS)

LexMed is a comprehensive, role-based, and highly secure web application designed to manage forensic medical cases, postmortems, chain of custody for legal evidence, and advanced clinical investigations.

## Project Overview

This project was built in four distinct phases to ensure strict adherence to database design principles, secure backend routing, responsive frontend workflows, and rigorous operational safety.

### 1. Database Architecture
The foundation of LexMed is a heavily constrained, normalized MySQL database:
- **Role-Based Access Control (RBAC)**: Dedicated MySQL roles (`jmo_role`, `department_clerk_role`, `auditor_role`) are mapped directly to backend connection pools.
- **Data Integrity**: Enforced via `ON DELETE RESTRICT` for medico-legal historical records, and explicit `CHECK` constraints on valid status enums.
- **Append-Only Auditing**: `AFTER INSERT/UPDATE/DELETE` triggers automatically log all actions to an `audit_logs` table that is protected against `UPDATE`/`DELETE` from application-level users.
- *Docs*: [Database README](server/database/scripts/README_db.md)

### 2. Node.js + Express API
The backend acts as a secure intermediary using the `mysql2` driver:
- **Stateless Auth**: Issues short-lived in-memory JWTs and secure `httpOnly` refresh cookies.
- **Parameterized Queries**: Zero ORMs are used. All SQL queries are strictly parameterized or utilize Stored Procedures (`CALL sp_xxx(...)`) to prevent SQL Injection.
- **AES-256 Encryption**: Highly sensitive identifiers (e.g., Patient NIC) are encrypted at the application layer before resting in the database.
- *Docs*: [Backend API Documentation](server/README_backend.md)

### 3. Vanilla JavaScript Frontend
The frontend leverages HTML5 and Bootstrap 5 without heavy bundlers:
- **Dynamic Workflows**: A unified case timeline displaying MLEFs, PMRs, and Evidence sequentially.
- **Role-Aware UI**: The interface dynamically hides buttons and modules based on the active JWT role.
- **Interactive Analytics**: Utilizes **Chart.js** to present visually rich reporting dashboards for JMO caseloads and monthly statistics.
- *Docs*: [Frontend Implementation Docs](client/public/README_frontend.md)

### 4. Operations & Security
- **Automated Backups**: Shell scripts (`backup.sh`) and restore verification tests (`restore_test.sh`) ensure data resilience.
- **Reporting Views**: Complex SQL views aggregate data to provide insights into Turnaround Times and Evidence Anomalies.
- *Docs*: [Security Checklist](SECURITY_CHECKLIST.md) | [Backup Strategy](server/database/scripts/README_backup.md)

---

## Running the Application

### Prerequisites
- Node.js (v16+)
- MySQL Server (v8+)

### Step 1: Database Setup
Execute the initialization scripts located in `server/database/scripts/` in order:
1. `01_schema.sql` (Tables and relationships)
2. `02_triggers.sql` (Audit logging triggers)
3. `03_procedures.sql` (Stored procedures for complex transactions)
4. `04_seed.sql` (Demo data and users)
5. `05_reports.sql` (Analytical views)

### Step 2: Backend Setup
1. Navigate to the `server/` directory.
2. Install dependencies: `npm install`.
3. Create a `.env` file referencing your MySQL credentials, `JWT_SECRET`, and a 32-byte `AES_KEY`.
4. Start the server: `npm start`.

### Step 3: Frontend Setup
1. Navigate to the `client/public/` directory.
2. Serve the static files using a local HTTP server:
   ```bash
   npx http-server
   ```
3. Open `http://127.0.0.1:8080/index.html` in your browser.

---

## Demonstration
To explore the system's features and test the role-based workflows, please follow the [15-Minute Demo Script](DEMO_SCRIPT.md).
