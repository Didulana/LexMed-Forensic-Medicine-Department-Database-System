-- ==============================================================================
-- 05_views.sql
-- LexMed Forensic Medicine Department Database System
-- Data Masking and Case Views
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Public Case View (Statistical/Reporting)
-- Exposes only non-identifying columns.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_case_public AS
SELECT 
    fc.case_id,
    fc.case_number,
    fc.case_type,
    fc.created_at,
    pm.death_category,
    wa.ward_id
FROM forensic_cases fc
LEFT JOIN postmortems pm ON fc.case_id = pm.case_id
LEFT JOIN ward_admissions wa ON fc.case_id = wa.case_id;


-- ------------------------------------------------------------------------------
-- 2. Full Case View (Authorized Roles Only)
-- Exposes all columns including encrypted data blocks.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_case_full AS
SELECT 
    fc.case_id,
    fc.case_number,
    fc.patient_nic_encrypted,
    fc.patient_nic_hash,
    fc.patient_name_encrypted,
    fc.case_type,
    fc.created_at,
    pm.death_category,
    pm.pm_date,
    wa.ward_id,
    wa.bht_number
FROM forensic_cases fc
LEFT JOIN postmortems pm ON fc.case_id = pm.case_id
LEFT JOIN ward_admissions wa ON fc.case_id = wa.case_id;

-- ------------------------------------------------------------------------------
-- 3. Grant View Privileges
-- ------------------------------------------------------------------------------
-- Department clerks and auditors can view public statistical data
GRANT SELECT ON LexMed.v_case_public TO 'department_clerk_role', 'auditor_role';

-- JMOs and Police officers get access to full case details (though Police is restricted by other logic/grants)
GRANT SELECT ON LexMed.v_case_full TO 'jmo_role', 'police_officer_role';
