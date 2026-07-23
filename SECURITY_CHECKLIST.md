# LexMed Security Review Checklist

This document confirms that the LexMed codebase adheres to the required security constraints for a forensic database system.

## 1. Secrets Management
- [x] **No Plaintext Secrets**: Hardcoded passwords, AES keys, and JWT secrets have been removed from the source code.
- [x] **`.env` Driven**: The `DB_PASSWORD`, `JWT_SECRET`, and `AES_KEY` are strictly loaded via `process.env` in the backend.

## 2. Database Protection
- [x] **Parameterized Queries**: All database queries use the `mysql2` driver's parameterization (`?` placeholders) or `CALL sp_xxx(?, ?)` syntax. **There is absolutely no raw string-concatenated SQL anywhere in the application.**
- [x] **Role-Based Access Control (RBAC)**: The backend connection pool utilizes restricted MySQL roles (`jmo_role`, `department_clerk_role`, etc.) rather than a generic `root` user for application queries.
- [x] **Audit Log Integrity**: The `audit_logs` table relies on `AFTER INSERT/UPDATE/DELETE` triggers at the MySQL layer. We have verified that non-admin MySQL roles are not granted `UPDATE` or `DELETE` permissions on the `audit_logs` table, ensuring it remains strictly append-only.

## 3. Application Security
- [x] **Encryption at Rest**: Highly sensitive patient data (e.g., NIC) is encrypted and decrypted at the application layer using AES-256-GCM. The database only sees `VARBINARY` ciphertexts.
- [x] **Rate Limiting Active**: The `express-rate-limit` middleware is configured globally on the backend to prevent brute-force login attempts and DDoS attacks on the REST API.
- [x] **Stateless Authentication**: JWT tokens are issued via HTTP-only, secure cookies (`/auth/refresh`), mitigating Cross-Site Scripting (XSS) risks associated with `localStorage`.

## 4. Operational Security
- [x] **Backup Logging**: The `backup.sh` script does not store credentials in plaintext logs and records its status securely within the `backup_logs` table.
- [x] **Input Validation**: `CHECK` constraints on the database enforce allowed enums (e.g., `consent_status`, `current_status`), preventing invalid data states even if API validation is bypassed.
