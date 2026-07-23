/**
 * Data Access Layer for Admin and Audit Logs
 */

const deactivateUser = async (conn, userId) => {
  // Call stored procedure
  await conn.query('CALL sp_deactivate_user(?)', [userId]);
};

const getAuditLogs = async (conn, { userId, startDate, endDate, limit = 50, offset = 0 }) => {
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];

  if (userId) {
    query += ' AND user_id = ?';
    params.push(userId);
  }

  if (startDate) {
    query += ' AND timestamp >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND timestamp <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  // Note: limit and offset need to be numbers, otherwise mysql2 might quote them as strings 
  // depending on configuration, causing syntax errors. We ensure they are numbers in the controller.
  params.push(Number(limit), Number(offset));

  const [rows] = await conn.query(query, params);
  
  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
  const countParams = params.slice(0, params.length - 2); // remove limit and offset
  
  if (userId) countQuery += ' AND user_id = ?';
  if (startDate) countQuery += ' AND timestamp >= ?';
  if (endDate) countQuery += ' AND timestamp <= ?';
  
  const [countRows] = await conn.query(countQuery, countParams);
  
  return {
    logs: rows,
    total: countRows[0].total
  };
};

module.exports = {
  deactivateUser,
  getAuditLogs
};
