const request = require('supertest');
const app = require('../src/app');

// We mock the repositories to avoid needing a live MySQL database during tests,
// as we are testing the Express layer, middleware, RBAC, and input validation.
jest.mock('../src/repositories/authRepository', () => ({
  getUserByUsername: jest.fn().mockImplementation(async (conn, username) => {
    if (username === 'demo_jmo') {
      return { user_id: 1, username: 'demo_jmo', role_name: 'jmo_role', password_hash: '$2b$10$dummyHash...', status: 'active' };
    }
    if (username === 'demo_police') {
      return { user_id: 2, username: 'demo_police', role_name: 'police_officer_role', password_hash: '$2b$10$dummyHash...', status: 'active' };
    }
    return null;
  }),
  updateUserStatus: jest.fn(),
  createSession: jest.fn()
}));

jest.mock('../src/repositories/clinicalRepository', () => ({
  getClinicalExamsByJmo: jest.fn().mockResolvedValue([{ exam_id: 1, case_id: 1, jmo_id: 1 }])
}));

jest.mock('../db/pool', () => {
  const mockConn = { query: jest.fn().mockResolvedValue([[]]), release: jest.fn() };
  return {
    adminPool: { getConnection: jest.fn().mockResolvedValue(mockConn) },
    getPoolForRole: jest.fn().mockReturnValue({ getConnection: jest.fn().mockResolvedValue(mockConn) })
  };
});

const { generateAccessToken } = require('../src/utils/jwt');

describe('LexMed Backend API Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Authentication Lockout', () => {
    it('should lock account after 5 failed login attempts', async () => {
      // Mock bcrypt to always fail for this test
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const payload = { username: 'demo_jmo', password: 'wrongpassword' };
      
      // Send 4 failed requests
      for (let i = 0; i < 4; i++) {
        await request(app).post('/auth/login').send(payload);
      }
      
      // The 5th request should fail and lock
      const res5 = await request(app).post('/auth/login').send(payload);
      expect(res5.status).toBe(401);
      
      // The 6th request should return 403 locked
      const res6 = await request(app).post('/auth/login').send(payload);
      expect(res6.status).toBe(403);
      expect(res6.body.error).toMatch(/locked/i);
    });
  });

  describe('2. RBAC Enforcement', () => {
    it('should deny police_officer access to /clinical/postmortems with clean 403', async () => {
      const policeToken = generateAccessToken({ user_id: 2, role_name: 'police_officer_role' });
      
      const res = await request(app)
        .get('/clinical/postmortems')
        .set('Authorization', `Bearer ${policeToken}`);
        
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Forbidden/i);
    });
  });

  describe('3. Validation & SQL Injection Prevention', () => {
    it('should reject SQL-injection payloads on evidence creation endpoint', async () => {
      const clerkToken = generateAccessToken({ user_id: 3, role_name: 'department_clerk_role' });
      
      const maliciousPayload = {
        case_id: 1,
        item_type: 'Weapon',
        description: 'Knife',
        current_status: "Available'; DROP TABLE evidence_items; --" // Not in enum
      };
      
      const res = await request(app)
        .post('/evidence')
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(maliciousPayload);
        
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      // Zod rejects the invalid enum value before it ever hits SQL
    });
  });
});
