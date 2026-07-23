-- ==============================================================================
-- 04_procedures.sql
-- LexMed Forensic Medicine Department Database System
-- Encapsulated Business Logic and Multi-step Operations
-- ==============================================================================

DELIMITER //

-- ------------------------------------------------------------------------------
-- 1. Create Forensic Case
-- Inserts the base case and related patient details atomically.
-- ------------------------------------------------------------------------------
CREATE PROCEDURE sp_create_forensic_case(
    IN p_case_number VARCHAR(100),
    IN p_patient_nic_encrypted VARBINARY(255),
    IN p_patient_nic_hash VARCHAR(64),
    IN p_patient_name_encrypted VARBINARY(255),
    IN p_case_type VARCHAR(50),
    OUT p_case_id INT
)
BEGIN
    INSERT INTO forensic_cases (
        case_number, patient_nic_encrypted, patient_nic_hash, patient_name_encrypted, case_type
    ) VALUES (
        p_case_number, p_patient_nic_encrypted, p_patient_nic_hash, p_patient_name_encrypted, p_case_type
    );
    
    SET p_case_id = LAST_INSERT_ID();
END //

-- ------------------------------------------------------------------------------
-- 2. Add Custody Transfer
-- Appends a new chain_of_custody row and updates evidence_items.current_status.
-- Never allows updating a past entry, only inserting the next one.
-- ------------------------------------------------------------------------------
CREATE PROCEDURE sp_add_custody_transfer(
    IN p_item_id INT,
    IN p_released_by_user INT,
    IN p_received_by_name VARCHAR(255),
    IN p_new_status VARCHAR(100)
)
BEGIN
    -- Declare SQL exception handler to rollback transaction on error
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Ensure new status is valid
    IF p_new_status NOT IN ('Available', 'In Transit', 'At Court', 'Disposed') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid evidence status.';
    END IF;

    -- Update evidence status
    UPDATE evidence_items 
    SET current_status = p_new_status 
    WHERE item_id = p_item_id;
    
    -- The BEFORE INSERT trigger on chain_of_custody requires evidence to be 'Available' or 'In Transit'.
    -- However, we just updated the status. The trigger runs on chain_of_custody insert.
    -- Wait, if p_new_status is 'Disposed' or 'At Court', the trigger on chain_of_custody will fail because the evidence status is no longer 'Available'/'In Transit' if we update first.
    -- So we must insert chain_of_custody BEFORE we update the evidence_items status, 
    -- since the trigger checks if the current_status of evidence_items is 'Available' or 'In Transit'.

    -- Actually, let's reverse the order.
    ROLLBACK;
    START TRANSACTION;
    
    -- Insert custody transfer first (Trigger checks if evidence is currently Available/In Transit)
    INSERT INTO chain_of_custody (item_id, released_by_user, received_by_name)
    VALUES (p_item_id, p_released_by_user, p_received_by_name);
    
    -- Then update the evidence status
    UPDATE evidence_items 
    SET current_status = p_new_status 
    WHERE item_id = p_item_id;

    COMMIT;
END //

-- ------------------------------------------------------------------------------
-- 3. Record Cause of Death
-- Inserts the COD row, enforcing the 1:1 relationship with postmortems.
-- ------------------------------------------------------------------------------
CREATE PROCEDURE sp_record_cause_of_death(
    IN p_pm_id INT,
    IN p_immediate_cause TEXT,
    IN p_antecedent_cause TEXT,
    IN p_contributory TEXT
)
BEGIN
    DECLARE v_count INT;
    
    -- Enforce 1:1 relationship (though the UNIQUE constraint will also enforce this)
    SELECT COUNT(*) INTO v_count FROM causes_of_death WHERE pm_id = p_pm_id;
    
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cause of death already recorded for this postmortem.';
    END IF;
    
    INSERT INTO causes_of_death (pm_id, immediate_cause, antecedent_cause, contributory)
    VALUES (p_pm_id, p_immediate_cause, p_antecedent_cause, p_contributory);
END //

-- ------------------------------------------------------------------------------
-- 4. Deactivate User
-- Removes all active user_sessions and sets account status to disabled in one transaction.
-- ------------------------------------------------------------------------------
CREATE PROCEDURE sp_deactivate_user(
    IN p_user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Remove all active sessions for this user
    DELETE FROM user_sessions WHERE user_id = p_user_id;
    
    -- Set user status to disabled
    UPDATE users SET status = 'disabled' WHERE user_id = p_user_id;
    
    COMMIT;
END //

DELIMITER ;

-- ------------------------------------------------------------------------------
-- Grant EXECUTE privileges
-- ------------------------------------------------------------------------------
GRANT EXECUTE ON PROCEDURE LexMed.sp_create_forensic_case TO 'department_clerk_role', 'jmo_role', 'police_officer_role';
GRANT EXECUTE ON PROCEDURE LexMed.sp_add_custody_transfer TO 'department_clerk_role';
GRANT EXECUTE ON PROCEDURE LexMed.sp_record_cause_of_death TO 'jmo_role';
GRANT EXECUTE ON PROCEDURE LexMed.sp_deactivate_user TO 'db_admin_role';
