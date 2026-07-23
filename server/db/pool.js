const mysql = require('mysql2/promise');
require('dotenv').config();

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'LexMed',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create separate connection pools for each role
const jmoPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_USER_JMO || 'demo_jmo',
  password: process.env.DB_PASS_JMO || 'password123'
});

const policePool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_USER_POLICE || 'demo_police',
  password: process.env.DB_PASS_POLICE || 'password123'
});

const clerkPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_USER_CLERK || 'demo_clerk',
  password: process.env.DB_PASS_CLERK || 'password123'
});

const adminPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_USER_ADMIN || 'demo_admin',
  password: process.env.DB_PASS_ADMIN || 'password123'
});

const auditorPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_USER_AUDITOR || 'demo_auditor',
  password: process.env.DB_PASS_AUDITOR || 'password123'
});

// Helper function to get the correct pool based on role name
function getPoolForRole(roleName) {
  switch (roleName) {
    case 'jmo_role':
      return jmoPool;
    case 'police_officer_role':
      return policePool;
    case 'department_clerk_role':
      return clerkPool;
    case 'db_admin_role':
      return adminPool;
    case 'auditor_role':
      return auditorPool;
    default:
      throw new Error(`Unknown role for DB pool: ${roleName}`);
  }
}

module.exports = {
  jmoPool,
  policePool,
  clerkPool,
  adminPool,
  auditorPool,
  getPoolForRole
};
