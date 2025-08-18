import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

const router = express.Router();

// Validation middleware
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors[0].message });
  }
};

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.getMe);
router.post('/refresh', authenticateToken, AuthController.refresh);

export default router;
