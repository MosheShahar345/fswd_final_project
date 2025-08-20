import bcrypt from 'bcryptjs';
import { getDb } from '../infra/db.js';
import { generateTokens } from '../middlewares/auth.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../middlewares/error.js';

export class AuthService {
  static async register(userData) {
    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [userData.email]);
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    // Hash password
    const hash = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const result = await db.run(
      'INSERT INTO users (name, email, hash, role) VALUES (?, ?, ?, ?)',
      [userData.name, userData.email, hash, userData.role]
    );

    const userId = result.lastID;
    const tokens = generateTokens(userId);
    
    return {
      user: { id: userId, name: userData.name, email: userData.email, role: userData.role },
      ...tokens
    };
  }

  static async login(email, password) {
    const db = await getDb();
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.status !== 'active') {
      if (user.status === 'suspended') {
        throw new AuthenticationError('Your account has been suspended. Please contact support for assistance.');
      } else if (user.status === 'inactive') {
        throw new AuthenticationError('Your account is inactive. Please contact support to reactivate your account.');
      } else {
        throw new AuthenticationError('Your account is not active. Please contact support for assistance.');
      }
    }

    const tokens = generateTokens(user.id);
    
    return {
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profilePicture: user.profile_picture 
      },
      ...tokens
    };
  }

  static async getMe(userId) {
    const db = await getDb();
    
    const user = await db.get(
      'SELECT id, name, email, role, status, created_at, profile_picture FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get user summaries for dashboard
    const [orderCount, bookingCount] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId]),
      db.get('SELECT COUNT(*) as count FROM trip_bookings WHERE user_id = ?', [userId])
    ]);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      profilePicture: user.profile_picture,
      summaries: {
        orders: orderCount.count,
        bookings: bookingCount.count
      }
    };
  }
}
