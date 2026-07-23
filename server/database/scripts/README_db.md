# LexMed Database Architecture

This directory contains the robust, secure, and highly documented relational database schema designed for the LexMed Forensic Medicine Department Database System. The architecture strictly enforces data integrity constraints, Role-Based Access Control (RBAC), auditing, and sensitive data protection, mapping perfectly to the legal and operational requirements of forensic medical records.

## How to Run the Scripts

The initialization of the database is broken down into modular scripts that must be executed in order. Please run these against a fresh MySQL database (e.g. `LexMed`):

1. **`01_schema.sql`**: Creates the full Data Definition Language (DDL) base tables, explicitly refactoring to ON DELETE RESTRICT for historical legal data preservation, and defining explicit domain CHECK constraints and optimized indexes.
2. **`02_roles_and_grants.sql`**: Initializes the MySQL IAM infrastructure. It creates specialized roles (e.g., `jmo_role`, `police_officer_role`), limits privileges via the Principle of Least Privilege, and provisions demonstration users.
3. **`03_triggers.sql`**: Installs crucial triggers, including rigorous `AFTER` triggers for exhaustive, tamper-evident audit logging, and `BEFORE` triggers safeguarding logical state machines (like Chain of Custody availability).
4. **`04_procedures.sql`**: Defines stored procedures encapsulating complex, multi-step transactions, abstracting them away from the application layer to guarantee atomicity and enforce business rules.
5. **`05_views.sql`**: Implements views (`v_case_public` and `v_case_full`) that mask or expose identifying column payloads depending on statistical vs. clinical necessity.
6. **`06_seed_data.sql`**: Populates the database with realistic interconnected sample records, allowing you to trace complete data lifecycles from Ward Admission and Clinical Exams to Evidence collection, Chain of Custody transfers, and Cause of Death attribution.

---

## Security Measures and LexMed Objectives

LexMed manages sensitive medico-legal data, and this schema defends it in depth:

*   **Principle of Least Privilege (PoLP):** Roles only have access to exactly what they need. JMOs cannot delete cases; Police can only insert legal documents and view high-level summaries; Auditors can solely monitor logs. This thwarts unauthorized structural alterations or data tampering.
*   **Immutable Historical Records:** `ON DELETE CASCADE` has been systematically replaced with `ON DELETE RESTRICT`. A forensic case that holds an associated postmortem report or evidence items *cannot* be silently erased by destroying the parent case. Historical legal integrity is permanently preserved at the database engine level.
*   **Application-Layer Encryption Strategy:** `users` only ever stores hashed passwords (bcrypt is expected). Sensitive patient identifying details (NIC, Names) are stored in `VARBINARY` encrypted blobs instead of relying on `AES_ENCRYPT()` inside MySQL memory space. Deterministic HMAC-SHA256 columns enable quick lookups without exposing plain-text keys to the DB Admin.
*   **Tamper-Evident Audit Trails:** Generic auditing triggers automatically intercept `INSERT`, `UPDATE`, and `DELETE` events across critical tables and log them append-only. Only the `db_admin_role` has rights to modify the log architecture, creating a powerful non-repudiation mechanism for legal challenges.

---

## Architecture Design Decisions

### Indexes Justification

Indexes were added *only* where explicitly justified by frequent query patterns to avoid unnecessary B-Tree write-amplification:

*   **`idx_ward_admissions_case_ward` on `ward_admissions (case_id, ward_id)`**: A composite index optimized to rapidly track specific patient location transitions tied to forensic cases.
*   **`idx_audit_logs_user_time` on `audit_logs (user_id, timestamp)`**: Highly performant composite index, given that audit reviews overwhelmingly filter by specific actors during specific timeframes.
*   **`idx_court_summons_date` on `court_summons (appearance_date)`**: Single-column index accelerating the UI dashboard when generating "upcoming weekly court schedules" for JMOs.
*   **`idx_evidence_items_case` on `evidence_items (case_id)`**: Crucial for swiftly loading all related evidence when examining a case's overarching chain of custody timeline.

### Data Integrity Triggers

*   **`trg_chain_of_custody_before_insert`**: Aborts any attempted chain of custody transfer if the physical `evidence_items` state is not logically ready (must be 'Available' or 'In Transit').
*   **`trg_clinical_referrals_before_insert / update`**: MySQL natively forbids cross-table `CHECK` constraints. Thus, these triggers enforce the temporal logic that a clinical referral cannot pre-date the overarching clinical exam's creation date.

### Stored Procedures Justification

*   **`sp_add_custody_transfer`**: Enforces a strict order of operations for chain of custody. It inserts the custody link *before* mutating the evidence item state to satisfy trigger requirements, wrapped safely within a transaction block.
*   **`sp_deactivate_user`**: Atomic execution that immediately nullifies live sessions and marks an account disabled, drastically reducing the threat window during compromised account lockdowns.
