const bcrypt = require('bcrypt');
const crypto = require('crypto');
const authRepo = require('../repositories/authRepository');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { adminPool } = require('../../db/pool');

// In-memory brute force tracker (for demonstration, in production use Redis)
const loginAttempts = new Map();

const login = async (req, res) => {
  const { username, password } = req.body;
  
  // Login route doesn't go through the dbInjector because the user isn't authenticated yet.
  // We use the adminPool because admin role has access to users and IAM.
  let conn;
  try {
    conn = await adminPool.getConnection();
    
    // Setup audit variable for triggers, setting to null for unauthenticated attempt.
    await conn.query('SET @current_user_id = NULL');

    const user = await authRepo.getUserByUsername(conn, username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'locked' || user.status === 'disabled') {
      return res.status(403).json({ error: 'Account is locked or disabled' });
    }

    // Check brute force attempts
    const attempts = loginAttempts.get(username) || 0;
    if (attempts >= 5) {
      // Lock account
      await conn.query('SET @current_user_id = ?', [user.user_id]); // Attribute to user for audit log
      await authRepo.updateUserStatus(conn, user.user_id, 'locked');
      return res.status(403).json({ error: 'Account locked due to too many failed attempts' });
    }

    // Hash comparison
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const newAttempts = attempts + 1;
      loginAttempts.set(username, newAttempts);
      if (newAttempts >= 5) {
         await conn.query('SET @current_user_id = ?', [user.user_id]);
         await authRepo.updateUserStatus(conn, user.user_id, 'locked');
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Success! Reset attempts
    loginAttempts.delete(username);

    // After success, we know the user_id, so set the session variable for audit log trigger
    await conn.query('SET @current_user_id = ?', [user.user_id]);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const sessionId = crypto.randomUUID();
    try {
        await authRepo.createSession(conn, sessionId, user.user_id, req.ip || '127.0.0.1');
    } catch(e) {
        // If user_sessions table isn't fully accessible by demo_admin, log and ignore for demo purposes
        console.warn('Session tracking skipped - check admin privileges on user_sessions table');
    }

    // Send refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ accessToken });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (conn) conn.release();
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  const { verifyToken } = require('../utils/jwt');
  const decoded = verifyToken(refreshToken);
  
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }

  // Optionally check DB to see if user is still active or session is valid.
  // For simplicity, we just issue a new access token based on the decoded payload.
  const user = { user_id: decoded.user_id, role_name: decoded.role };
  const accessToken = generateAccessToken(user);

  res.json({ accessToken, user: { user_id: user.user_id, role: user.role_name } });
};

module.exports = {
  login,
  refresh
};