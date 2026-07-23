-- ==============================================================================
-- 02_roles_and_grants.sql
-- LexMed Forensic Medicine Department Database System
-- Roles, Privileges, and Demo Users
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create Roles
-- ------------------------------------------------------------------------------
CREATE ROLE IF NOT EXISTS 'jmo_role',
                          'police_officer_role',
                          'department_clerk_role',
                          'db_admin_role',
                          'auditor_role';

-- ------------------------------------------------------------------------------
-- 2. Grant Privileges to Roles (Principle of Least Privilege)
-- ------------------------------------------------------------------------------

-- jmo_role: SELECT/INSERT/UPDATE on medical records. No DELETE.
GRANT SELECT, INSERT, UPDATE ON LexMed.clinical_exams TO 'jmo_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.injury_records TO 'jmo_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.postmortems TO 'jmo_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.causes_of_death TO 'jmo_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.histology_samples TO 'jmo_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.radiology_scans TO 'jmo_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.toxicology_tests TO 'jmo_role';

-- jmo_role needs to see forensic_cases to know which case they're working on
GRANT SELECT ON LexMed.forensic_cases TO 'jmo_role';

-- police_officer_role: SELECT/INSERT on legal_documents; SELECT only on forensic_cases and court_reports.
GRANT SELECT, INSERT ON LexMed.legal_documents TO 'police_officer_role';
GRANT SELECT ON LexMed.forensic_cases TO 'police_officer_role';
GRANT SELECT ON LexMed.court_reports TO 'police_officer_role';

-- department_clerk_role: SELECT/INSERT/UPDATE on evidence and court matters.
GRANT SELECT, INSERT, UPDATE ON LexMed.evidence_items TO 'department_clerk_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.chain_of_custody TO 'department_clerk_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.court_summons TO 'department_clerk_role';
GRANT SELECT, INSERT, UPDATE ON LexMed.court_reports TO 'department_clerk_role';

-- db_admin_role: ALL PRIVILEGES on IAM tables.
GRANT ALL PRIVILEGES ON LexMed.users TO 'db_admin_role';
GRANT ALL PRIVILEGES ON LexMed.roles TO 'db_admin_role';
GRANT ALL PRIVILEGES ON LexMed.permissions TO 'db_admin_role';
GRANT ALL PRIVILEGES ON LexMed.role_permissions TO 'db_admin_role';

-- Also db_admin_role needs some privileges on audit_logs, wait, prompt says:
-- "Do not GRANT UPDATE or DELETE on audit_logs to any role except db_admin_role, so the audit trail is append-only in practice."
GRANT SELECT, UPDATE, DELETE ON LexMed.audit_logs TO 'db_admin_role';

-- auditor_role: SELECT only on audit_logs.
GRANT SELECT ON LexMed.audit_logs TO 'auditor_role';


-- ------------------------------------------------------------------------------
-- 3. Create Demo Users
-- ------------------------------------------------------------------------------

CREATE USER IF NOT EXISTS 'demo_jmo'@'localhost' IDENTIFIED BY 'password123';
CREATE USER IF NOT EXISTS 'demo_police'@'localhost' IDENTIFIED BY 'password123';
CREATE USER IF NOT EXISTS 'demo_clerk'@'localhost' IDENTIFIED BY 'password123';
CREATE USER IF NOT EXISTS 'demo_admin'@'localhost' IDENTIFIED BY 'password123';
CREATE USER IF NOT EXISTS 'demo_auditor'@'localhost' IDENTIFIED BY 'password123';

-- ------------------------------------------------------------------------------
-- 4. Assign Roles to Demo Users
-- ------------------------------------------------------------------------------

GRANT 'jmo_role' TO 'demo_jmo'@'localhost';
GRANT 'police_officer_role' TO 'demo_police'@'localhost';
GRANT 'department_clerk_role' TO 'demo_clerk'@'localhost';
GRANT 'db_admin_role' TO 'demo_admin'@'localhost';
GRANT 'auditor_role' TO 'demo_auditor'@'localhost';

-- ------------------------------------------------------------------------------
-- 5. Set Default Roles
-- ------------------------------------------------------------------------------

SET DEFAULT ROLE 'jmo_role' TO 'demo_jmo'@'localhost';
SET DEFAULT ROLE 'police_officer_role' TO 'demo_police'@'localhost';
SET DEFAULT ROLE 'department_clerk_role' TO 'demo_clerk'@'localhost';
SET DEFAULT ROLE 'db_admin_role' TO 'demo_admin'@'localhost';
SET DEFAULT ROLE 'auditor_role' TO 'demo_auditor'@'localhost';

FLUSH PRIVILEGES;
