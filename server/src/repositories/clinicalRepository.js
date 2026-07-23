/**
 * Data Access Layer for Clinical Exams and Postmortems
 */

const createClinicalExam = async (conn, examData) => {
  const { case_id, jmo_id, consent_status, history_given } = examData;
  const [result] = await conn.query(
    'INSERT INTO clinical_exams (case_id, jmo_id, consent_status, history_given) VALUES (?, ?, ?, ?)',
    [case_id, jmo_id, consent_status, history_given]
  );
  return result.insertId;
};

const getClinicalExamsByJmo = async (conn, jmoId) => {
  // Scoped to specific JMO at the query level
  const [rows] = await conn.query(
    'SELECT * FROM clinical_exams WHERE jmo_id = ? ORDER BY created_at DESC',
    [jmoId]
  );
  return rows;
};

const createPostmortem = async (conn, pmData) => {
  const { case_id, jmo_id, death_category, pm_date } = pmData;
  const [result] = await conn.query(
    'INSERT INTO postmortems (case_id, jmo_id, death_category, pm_date) VALUES (?, ?, ?, ?)',
    [case_id, jmo_id, death_category, pm_date]
  );
  return result.insertId;
};

const getPostmortemsByJmo = async (conn, jmoId) => {
  const [rows] = await conn.query(
    'SELECT * FROM postmortems WHERE jmo_id = ? ORDER BY pm_date DESC',
    [jmoId]
  );
  return rows;
};

const recordCauseOfDeath = async (conn, pmId, codData) => {
  const { immediate_cause, antecedent_cause, contributory } = codData;
  
  // Call stored procedure
  await conn.query(
    'CALL sp_record_cause_of_death(?, ?, ?, ?)',
    [pmId, immediate_cause, antecedent_cause, contributory]
  );
};

module.exports = {
  createClinicalExam,
  getClinicalExamsByJmo,
  createPostmortem,
  getPostmortemsByJmo,
  recordCauseOfDeath
};
