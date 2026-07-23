-- ==============================================================================
-- 03_triggers.sql
-- LexMed Forensic Medicine Department Database System
-- Data Integrity & Audit Triggers
-- ==============================================================================

DELIMITER //

-- ------------------------------------------------------------------------------
-- 1. Data Integrity Triggers
-- ------------------------------------------------------------------------------

-- Prevent chain of custody transfer if item is not Available or In Transit
CREATE TRIGGER trg_chain_of_custody_before_insert
BEFORE INSERT ON chain_of_custody
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(100);
    SELECT current_status INTO v_status FROM evidence_items WHERE item_id = NEW.item_id;
    
    IF v_status NOT IN ('Available', 'In Transit') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot transfer evidence: Item is not Available or In Transit.';
    END IF;
END //

-- Ensure clinical referral date is not before the exam creation date (INSERT)
CREATE TRIGGER trg_clinical_referrals_before_insert
BEFORE INSERT ON clinical_referrals
FOR EACH ROW
BEGIN
    DECLARE v_exam_date TIMESTAMP;
    SELECT created_at INTO v_exam_date FROM clinical_exams WHERE exam_id = NEW.exam_id;
    
    IF DATE(NEW.referral_date) < DATE(v_exam_date) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Referral date cannot be earlier than the exam creation date.';
    END IF;
END //

-- Ensure clinical referral date is not before the exam creation date (UPDATE)
CREATE TRIGGER trg_clinical_referrals_before_update
BEFORE UPDATE ON clinical_referrals
FOR EACH ROW
BEGIN
    DECLARE v_exam_date TIMESTAMP;
    SELECT created_at INTO v_exam_date FROM clinical_exams WHERE exam_id = NEW.exam_id;
    
    IF DATE(NEW.referral_date) < DATE(v_exam_date) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Referral date cannot be earlier than the exam creation date.';
    END IF;
END //

-- ------------------------------------------------------------------------------
-- 2. Audit Triggers
-- Application must SET @current_user_id = ? before transactions.
-- ------------------------------------------------------------------------------

-- CLINICAL EXAMS
CREATE TRIGGER trg_clinical_exams_after_insert
AFTER INSERT ON clinical_exams
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'INSERT', 'clinical_exams', NEW.exam_id);
END //

CREATE TRIGGER trg_clinical_exams_after_update
AFTER UPDATE ON clinical_exams
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'UPDATE', 'clinical_exams', NEW.exam_id);
END //

CREATE TRIGGER trg_clinical_exams_after_delete
AFTER DELETE ON clinical_exams
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'DELETE', 'clinical_exams', OLD.exam_id);
END //

-- POSTMORTEMS
CREATE TRIGGER trg_postmortems_after_insert
AFTER INSERT ON postmortems
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'INSERT', 'postmortems', NEW.pm_id);
END //

CREATE TRIGGER trg_postmortems_after_update
AFTER UPDATE ON postmortems
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'UPDATE', 'postmortems', NEW.pm_id);
END //

CREATE TRIGGER trg_postmortems_after_delete
AFTER DELETE ON postmortems
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'DELETE', 'postmortems', OLD.pm_id);
END //

-- EVIDENCE ITEMS
CREATE TRIGGER trg_evidence_items_after_insert
AFTER INSERT ON evidence_items
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'INSERT', 'evidence_items', NEW.item_id);
END //

CREATE TRIGGER trg_evidence_items_after_update
AFTER UPDATE ON evidence_items
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'UPDATE', 'evidence_items', NEW.item_id);
END //

CREATE TRIGGER trg_evidence_items_after_delete
AFTER DELETE ON evidence_items
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'DELETE', 'evidence_items', OLD.item_id);
END //

-- CHAIN OF CUSTODY
CREATE TRIGGER trg_chain_of_custody_after_insert
AFTER INSERT ON chain_of_custody
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'INSERT', 'chain_of_custody', NEW.transfer_id);
END //

CREATE TRIGGER trg_chain_of_custody_after_update
AFTER UPDATE ON chain_of_custody
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'UPDATE', 'chain_of_custody', NEW.transfer_id);
END //

CREATE TRIGGER trg_chain_of_custody_after_delete
AFTER DELETE ON chain_of_custody
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'DELETE', 'chain_of_custody', OLD.transfer_id);
END //

-- USERS
CREATE TRIGGER trg_users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'INSERT', 'users', NEW.user_id);
END //

CREATE TRIGGER trg_users_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'UPDATE', 'users', NEW.user_id);
END //

CREATE TRIGGER trg_users_after_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id)
    VALUES (@current_user_id, 'DELETE', 'users', OLD.user_id);
END //

DELIMITER ;
