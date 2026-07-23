-- ==============================================================================
-- 05_reports.sql
-- LexMed Forensic Medicine Department Database System
-- Analytical Views and Operational Tables
-- ==============================================================================

USE lexmed_db;

-- ------------------------------------------------------------------------------
-- 1. Backup Operations Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backup_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    backup_file VARCHAR(255) NOT NULL,
    status ENUM('SUCCESS', 'FAILED') NOT NULL,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. Analytical Reporting Views
-- ------------------------------------------------------------------------------

-- Report 1: Pending/Open Forensic Cases
-- Cases created but missing either a clinical exam or postmortem record.
CREATE OR REPLACE VIEW v_report_pending_cases AS
SELECT 
    fc.case_id,
    fc.case_type,
    fc.incident_time AS created_at,
    DATEDIFF(CURRENT_DATE, fc.incident_time) AS days_open
FROM forensic_cases fc
LEFT JOIN clinical_exams ce ON fc.case_id = ce.case_id
LEFT JOIN postmortems pm ON fc.case_id = pm.case_id
WHERE ce.exam_id IS NULL AND pm.pm_id IS NULL;


-- Report 2: Monthly Case Statistics
-- Aggregates cases by month and type.
CREATE OR REPLACE VIEW v_report_monthly_stats AS
SELECT 
    DATE_FORMAT(incident_time, '%Y-%m') AS report_month,
    case_type,
    COUNT(case_id) AS total_cases
FROM forensic_cases
GROUP BY DATE_FORMAT(incident_time, '%Y-%m'), case_type
ORDER BY report_month DESC;


-- Report 3: Evidence Anomaly Check
-- Identifies evidence items logged > 7 days ago but with NO chain of custody transfers.
CREATE OR REPLACE VIEW v_report_evidence_anomalies AS
SELECT 
    ei.item_id,
    ei.case_id,
    ei.item_type,
    ei.description,
    ei.current_status,
    fc.incident_time AS case_created_at
FROM evidence_items ei
JOIN forensic_cases fc ON ei.case_id = fc.case_id
LEFT JOIN chain_of_custody coc ON ei.item_id = coc.item_id
WHERE coc.transfer_id IS NULL 
  AND DATEDIFF(CURRENT_DATE, fc.incident_time) > 7;


-- Report 4: JMO Caseload Overview
-- Counts total clinical exams and postmortems handled per JMO.
CREATE OR REPLACE VIEW v_report_jmo_caseload AS
SELECT 
    u.user_id AS jmo_id,
    u.username AS jmo_name,
    COUNT(DISTINCT ce.exam_id) AS total_clinical_exams,
    COUNT(DISTINCT pm.pm_id) AS total_postmortems,
    (COUNT(DISTINCT ce.exam_id) + COUNT(DISTINCT pm.pm_id)) AS total_caseload
FROM users u
LEFT JOIN clinical_exams ce ON u.user_id = ce.jmo_id
LEFT JOIN postmortems pm ON u.user_id = pm.jmo_id
WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'jmo_role')
GROUP BY u.user_id, u.username;


-- Report 5: Investigation Turnaround Time
-- Calculates the time diff between case creation and advanced investigation results (toxicology/radiology).
CREATE OR REPLACE VIEW v_report_turnaround_time AS
SELECT 
    fc.case_id,
    fc.incident_time AS case_opened_at,
    MIN(COALESCE(tt.tox_id, rs.scan_id)) AS has_investigations,
    CASE 
        WHEN tt.tox_id IS NOT NULL OR rs.scan_id IS NOT NULL THEN 'Completed'
        ELSE 'Pending'
    END AS investigation_status
FROM forensic_cases fc
LEFT JOIN toxicology_tests tt ON fc.case_id = tt.case_id
LEFT JOIN radiology_scans rs ON fc.case_id = rs.case_id
GROUP BY fc.case_id, fc.incident_time;


