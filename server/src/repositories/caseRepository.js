/**
 * Data Access Layer for Forensic Cases
 */

const createCase = async (conn, caseData) => {
  const { case_number, patient_nic_encrypted, patient_nic_hash, patient_name_encrypted, case_type } = caseData;
  
  // Call the stored procedure. We use a parameterized CALL.
  // Note: we can't directly use OUT parameters with mysql2 easily in a single CALL without a wrapper,
  // but we can set a user variable and select it in the next statement.
  
  await conn.query(
    'CALL sp_create_forensic_case(?, ?, ?, ?, ?, @out_case_id)',
    [case_number, patient_nic_encrypted, patient_nic_hash, patient_name_encrypted, case_type]
  );
  
  const [rows] = await conn.query('SELECT @out_case_id AS case_id');
  return rows[0].case_id;
};

const getCaseById = async (conn, caseId) => {
  // Use the full view since this will be protected by appropriate route roles
  const [rows] = await conn.query(
    'SELECT * FROM v_case_full WHERE case_id = ?',
    [caseId]
  );
  return rows[0];
};

const getAllCases = async (conn) => {
  // Use public view for listing
  const [rows] = await conn.query('SELECT * FROM v_case_public ORDER BY created_at DESC');
  return rows;
};

const getCaseTimeline = async (conn, caseId) => {
  const [exams] = await conn.query('SELECT * FROM clinical_exams WHERE case_id = ? ORDER BY created_at ASC', [caseId]);
  const [postmortems] = await conn.query('SELECT * FROM postmortems WHERE case_id = ? ORDER BY pm_date ASC', [caseId]);
  const [evidence] = await conn.query('SELECT * FROM evidence_items WHERE case_id = ?', [caseId]);
  const [reports] = await conn.query('SELECT * FROM court_reports WHERE case_id = ?', [caseId]);

  return { exams, postmortems, evidence, reports };
};

module.exports = {
  createCase,
  getCaseById,
  getAllCases,
  getCaseTimeline
};
