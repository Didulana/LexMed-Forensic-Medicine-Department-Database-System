-- ==============================================================================
-- 06_seed_data.sql
-- LexMed Forensic Medicine Department Database System
-- Sample Data
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Base Lookup Data (Roles, Permissions, Wards)
-- ------------------------------------------------------------------------------
INSERT INTO roles (role_name) VALUES 
('jmo_role'),
('police_officer_role'),
('department_clerk_role'),
('db_admin_role'),
('auditor_role');

INSERT INTO permissions (permission_name, description) VALUES 
('VIEW_AUTOPSY', 'Can view PMR data'),
('SIGN_MLEF', 'Can sign and submit MLEF'),
('MANAGE_EVIDENCE', 'Can log chain of custody');

-- Assume role IDs 1-5 map to the roles inserted above
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), -- JMO gets PMR and MLEF
(3, 3);         -- Clerk gets Evidence

INSERT INTO hospital_wards (ward_name) VALUES 
('Ward 15 - Trauma'), 
('Ward 16 - ICU'), 
('OPD');

INSERT INTO legal_authorities (name, designation, jurisdiction) VALUES
('Kandy Magistrate Court', 'Magistrate', 'Kandy District'),
('Peradeniya Police Station', 'OIC', 'Peradeniya'),
('Colombo High Court', 'Judge', 'Western Province');


-- ------------------------------------------------------------------------------
-- 2. Users (3 JMOs, 2 Police Officers, 2 Clerks, 1 Admin, 1 Auditor)
-- ------------------------------------------------------------------------------
-- Using a dummy bcrypt hash for 'password123' 
-- $2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO
INSERT INTO users (role_id, username, password_hash) VALUES 
(1, 'jmo_smith', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(1, 'jmo_jones', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(1, 'jmo_dias', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(2, 'officer_bandara', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(2, 'officer_silva', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(3, 'clerk_anne', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(3, 'clerk_kamal', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(4, 'admin_system', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO'),
(5, 'auditor_ext', '$2a$12$N9X02vO83E/92/YI3J8fV.lJ1o9.j.iZ.a/q5V74lT3n29J2V/0yO');


-- ------------------------------------------------------------------------------
-- 3. Cases (5 Cases)
-- Note: Patient details are encrypted blobs. We'll use dummy binary data for seed.
-- ------------------------------------------------------------------------------
INSERT INTO forensic_cases (case_number, patient_nic_encrypted, patient_nic_hash, patient_name_encrypted, case_type) VALUES
('CASE-2026-001', 0xDEADBEEF, 'hash1', 0xDEADBEEF, 'Clinical'),
('CASE-2026-002', 0xDEADBEEF, 'hash2', 0xDEADBEEF, 'Postmortem'),
('CASE-2026-003', 0xDEADBEEF, 'hash3', 0xDEADBEEF, 'Mixed'),
('CASE-2026-004', 0xDEADBEEF, 'hash4', 0xDEADBEEF, 'Clinical'),
('CASE-2026-005', 0xDEADBEEF, 'hash5', 0xDEADBEEF, 'Postmortem');


-- ------------------------------------------------------------------------------
-- 4. Case Data: Clinical Exams & Ward Admissions
-- ------------------------------------------------------------------------------
INSERT INTO ward_admissions (case_id, ward_id, bht_number) VALUES
(1, 1, 'BHT-1001'),
(3, 2, 'BHT-1002'),
(4, 3, 'BHT-1003');

INSERT INTO clinical_exams (case_id, jmo_id, consent_status, history_given, created_at) VALUES
(1, 1, 'Given', 'Assaulted by unknown persons', '2026-07-01 10:00:00'),
(3, 2, 'Pending', 'Road traffic accident', '2026-07-05 14:30:00'),
(4, 3, 'Not Required', 'Child abuse allegation', '2026-07-10 09:15:00');

INSERT INTO injury_records (exam_id, injury_type, weapon, body_part, hurt_category) VALUES
(1, 'Laceration', 'Blunt object', 'Head', 'Grievous'),
(1, 'Contusion', 'Blunt object', 'Left Arm', 'Non-Grievous'),
(2, 'Abrasion', 'Road surface', 'Right Leg', 'Non-Grievous');

-- Clinical referrals date should be >= exam created_at
INSERT INTO clinical_referrals (exam_id, department, referral_date, findings) VALUES
(1, 'Neurology', '2026-07-02', 'Mild concussion, observation required.');


-- ------------------------------------------------------------------------------
-- 5. Case Data: Postmortems & Cause of Death
-- ------------------------------------------------------------------------------
INSERT INTO postmortems (case_id, jmo_id, death_category, pm_date) VALUES
(2, 1, 'Homicide', '2026-07-03 08:00:00'),
(3, 2, 'Accident', '2026-07-06 09:00:00'),
(5, 3, 'Suicide', '2026-07-12 10:00:00');

INSERT INTO causes_of_death (pm_id, immediate_cause, antecedent_cause, contributory) VALUES
(1, 'Hemorrhagic Shock', 'Stab wound to the chest', 'None'),
(2, 'Traumatic Brain Injury', 'Motor vehicle collision', 'Hypertension'),
(3, 'Asphyxia', 'Hanging', 'Depression');

INSERT INTO histology_samples (pm_id, tissue_type, analysis_result) VALUES
(1, 'Liver', 'Normal'),
(3, 'Lung', 'Congested');


-- ------------------------------------------------------------------------------
-- 6. Case Data: Advanced Investigations
-- ------------------------------------------------------------------------------
INSERT INTO radiology_scans (case_id, modality, body_region, findings) VALUES
(1, 'X-Ray', 'Skull', 'No fractures seen.'),
(3, 'CT Scan', 'Head', 'Subdural hematoma present.');

INSERT INTO toxicology_tests (case_id, sample_material, substance_tested, result) VALUES
(5, 'Blood', 'Alcohol', 'Positive (0.15 BAC)'),
(5, 'Blood', 'Poisons', 'Negative');


-- ------------------------------------------------------------------------------
-- 7. Law, Evidence & The Full Chain of Custody
-- ------------------------------------------------------------------------------
INSERT INTO legal_documents (case_id, authority_id, doc_type, reference_no) VALUES
(2, 2, 'Police Request', 'PR-2026-99'),
(3, 1, 'Magistrate Order', 'MO-2026-105');

-- Evidence Items
-- Case 2: Homicide weapon
INSERT INTO evidence_items (case_id, item_type, description, current_status) VALUES
(2, 'Weapon', 'Bloody knife found at scene', 'Available'),
(3, 'Clothing', 'Torn shirt', 'Disposed');

-- Chain of Custody (Requires setting user_id session var to bypass trigger if it was active, but for seed we assume it works or we set it)
SET @current_user_id = 1; -- JMO Smith

-- To bypass the BEFORE INSERT chain of custody trigger easily without errors, we make sure evidence is Available.
-- Item 1 is 'Available'.
-- We use the stored procedure to safely add transfers and update status
CALL sp_add_custody_transfer(1, 1, 'Officer Bandara', 'In Transit');
CALL sp_add_custody_transfer(1, 4, 'Court Clerk', 'At Court');

-- Court Reports and Summons
INSERT INTO court_reports (case_id, report_type, trial_date, receipt_status) VALUES
(2, 'Postmortem Report', '2026-08-15', TRUE),
(3, 'Clinical Report', '2026-08-20', FALSE);

INSERT INTO court_summons (jmo_id, case_id, appearance_date, status) VALUES
(1, 2, '2026-08-15', 'Issued'),
(2, 3, '2026-08-20', 'Served');
