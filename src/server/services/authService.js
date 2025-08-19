import bcrypt from 'bcryptjs';
import { getDb } from '../infra/db.js';
import { generateTokens } from '../middlewares/auth.js';

export class AuthService {
  static async register(userData) {
    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [userData.email]);
    if (existingUser) {
      throw new Error('User already exists with this email');
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
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
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
      throw new Error('User not found');
    }

    // Get user summaries for dashboard
    const [orderCount, bookingCount, messageCount] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId]),
      db.get('SELECT COUNT(*) as count FROM trip_bookings WHERE user_id = ?', [userId]),
      db.get('SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND read_at IS NULL', [userId])
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
        bookings: bookingCount.count,
        unreadMessages: messageCount.count
      }
    };
  }
}
