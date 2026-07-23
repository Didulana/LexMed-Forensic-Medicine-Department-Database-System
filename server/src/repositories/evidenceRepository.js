/**
 * Data Access Layer for Evidence and Chain of Custody
 */

const getEvidenceByCase = async (conn, caseId) => {
  const [rows] = await conn.query(
    'SELECT * FROM evidence_items WHERE case_id = ? ORDER BY item_id ASC',
    [caseId]
  );
  return rows;
};

const createEvidenceItem = async (conn, evidenceData) => {
  const { case_id, item_type, description, current_status } = evidenceData;
  const [result] = await conn.query(
    'INSERT INTO evidence_items (case_id, item_type, description, current_status) VALUES (?, ?, ?, ?)',
    [case_id, item_type, description, current_status]
  );
  return result.insertId;
};

const getChainOfCustody = async (conn, itemId) => {
  const [rows] = await conn.query(
    `SELECT c.*, u.username as released_by_username 
     FROM chain_of_custody c
     LEFT JOIN users u ON c.released_by_user = u.user_id
     WHERE c.item_id = ? 
     ORDER BY c.transfer_time ASC`,
    [itemId]
  );
  return rows;
};

const addCustodyTransfer = async (conn, transferData) => {
  const { item_id, released_by_user, received_by_name, new_status } = transferData;
  
  // Call stored procedure
  await conn.query(
    'CALL sp_add_custody_transfer(?, ?, ?, ?)',
    [item_id, released_by_user, received_by_name, new_status]
  );
};

module.exports = {
  getEvidenceByCase,
  createEvidenceItem,
  getChainOfCustody,
  addCustodyTransfer
};
