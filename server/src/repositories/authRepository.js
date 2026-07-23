/**
 * Data Access Layer for Authentication and Users
 */

const getUserByUsername = async (conn, username) => {
  const [rows] = await conn.query(
    `SELECT u.user_id, u.username, u.password_hash, u.status, r.role_name 
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0];
};

const updateUserStatus = async (conn, userId, status) => {
  await conn.query(
    'UPDATE users SET status = ? WHERE user_id = ?',
    [status, userId]
  );
};

const createSession = async (conn, sessionId, userId, ipAddress) => {
  await conn.query(
    'INSERT INTO user_sessions (session_id, user_id, ip_address) VALUES (?, ?, ?)',
    [sessionId, userId, ipAddress]
  );
};

const deactivateSession = async (conn, sessionId) => {
  await conn.query(
    'UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?',
    [sessionId]
  );
};

module.exports = {
  getUserByUsername,
  updateUserStatus,
  createSession,
  deactivateSession
};
