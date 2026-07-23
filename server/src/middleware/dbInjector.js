const { getPoolForRole } = require('../../db/pool');

/**
 * Injects a role-specific database connection into the request object.
 * Also sets the session variable @current_user_id for audit logging triggers.
 */
const injectDbConnection = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user context found' });
  }

  const { role, user_id } = req.user;
  
  try {
    const pool = getPoolForRole(role);
    const connection = await pool.getConnection();
    
    // Set the audit logging session variable
    await connection.query('SET @current_user_id = ?', [user_id]);
    
    // Attach connection to request
    req.dbConn = connection;
    
    // Ensure the connection is released when the response finishes or closes unexpectedly
    const releaseConnection = () => {
      if (req.dbConn) {
        req.dbConn.release();
        req.dbConn = null;
      }
    };

    res.on('finish', releaseConnection);
    res.on('close', releaseConnection);
    
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
};

module.exports = {
  injectDbConnection
};
