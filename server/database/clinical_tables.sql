-- Step 1: Lookup Tables and IAM
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    record_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS legal_authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    jurisdiction VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS hospital_wards (
    ward_id INT AUTO_INCREMENT PRIMARY KEY,
    ward_name VARCHAR(255) NOT NULL UNIQUE
);

-- Core Medical Entities
CREATE TABLE IF NOT EXISTS ward_admissions (
    admission_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    ward_id INT NOT NULL,
    bht_number VARCHAR(255) NOT NULL,
    admit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (ward_id) REFERENCES hospital_wards(ward_id)
);

-- Module 4: Clinical Forensic Medicine
CREATE TABLE IF NOT EXISTS clinical_exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    jmo_id INT NOT NULL,
    consent_status VARCHAR(50) NOT NULL,
    history_given TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (jmo_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS injury_records (
    injury_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    injury_type VARCHAR(100) NOT NULL,
    weapon VARCHAR(255),
    body_part VARCHAR(255),
    hurt_category VARCHAR(100),
    FOREIGN KEY (exam_id) REFERENCES clinical_exams(exam_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clinical_referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    department VARCHAR(255) NOT NULL,
    referral_date DATE NOT NULL,
    findings TEXT,
    FOREIGN KEY (exam_id) REFERENCES clinical_exams(exam_id) ON DELETE CASCADE
);

-- Module 5: Postmortem
CREATE TABLE IF NOT EXISTS postmortems (
    pm_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    jmo_id INT NOT NULL,
    death_category VARCHAR(100),
    pm_date TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (jmo_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS causes_of_death (
    cod_id INT AUTO_INCREMENT PRIMARY KEY,
    pm_id INT NOT NULL UNIQUE,
    immediate_cause TEXT,
    antecedent_cause TEXT,
    contributory TEXT,
    FOREIGN KEY (pm_id) REFERENCES postmortems(pm_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS histology_samples (
    histology_id INT AUTO_INCREMENT PRIMARY KEY,
    pm_id INT NOT NULL,
    tissue_type VARCHAR(255) NOT NULL,
    analysis_result TEXT,
    FOREIGN KEY (pm_id) REFERENCES postmortems(pm_id) ON DELETE CASCADE
);

-- Module 6: Advanced Investigations
CREATE TABLE IF NOT EXISTS radiology_scans (
    scan_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    modality VARCHAR(100) NOT NULL,
    body_region VARCHAR(255),
    findings TEXT,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS toxicology_tests (
    tox_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    sample_material VARCHAR(255) NOT NULL,
    substance_tested VARCHAR(255),
    result TEXT,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE
);

-- Module 7: Law & Evidence
CREATE TABLE IF NOT EXISTS legal_documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    authority_id INT,
    doc_type VARCHAR(100) NOT NULL,
    reference_no VARCHAR(255),
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (authority_id) REFERENCES legal_authorities(authority_id)
);

CREATE TABLE IF NOT EXISTS evidence_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    item_type VARCHAR(100) NOT NULL,
    description TEXT,
    current_status VARCHAR(100),
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chain_of_custody (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    released_by_user INT,
    received_by_name VARCHAR(255) NOT NULL,
    transfer_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES evidence_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (released_by_user) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS court_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    trial_date DATE,
    receipt_status BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS court_summons (
    summon_id INT AUTO_INCREMENT PRIMARY KEY,
    jmo_id INT NOT NULL,
    case_id INT NOT NULL,
    appearance_date DATE NOT NULL,
    status VARCHAR(50),
    FOREIGN KEY (jmo_id) REFERENCES users(user_id),
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS digital_media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    encrypted_url TEXT NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(case_id) ON DELETE CASCADE
);

-- Insert sample lookup data
INSERT IGNORE INTO hospital_wards (ward_name) VALUES ('Ward 15 - Trauma'), ('Ward 16 - ICU'), ('OPD');
INSERT IGNORE INTO permissions (permission_name, description) VALUES 
('VIEW_AUTOPSY', 'Can view PMR data'),
('SIGN_MLEF', 'Can sign and submit MLEF'),
('MANAGE_EVIDENCE', 'Can log chain of custody');
