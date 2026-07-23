const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6)
  }),
  query: z.object({}),
  params: z.object({})
});

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.get('/refresh', authController.refresh);

module.exports = router;