import { AuthService } from '../services/authService.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      // For now, just return a new token
      // In production, you'd validate the refresh token
      const tokens = generateTokens(req.user.id);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }
}
