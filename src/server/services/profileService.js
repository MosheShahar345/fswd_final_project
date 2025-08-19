import { getDb } from '../infra/db.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export class ProfileService {
  static async updateProfilePicture(userId, filename) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      // Update user's profile picture
      await db.run(`
        UPDATE users 
        SET profile_picture = ? 
        WHERE id = ?
      `, [filename, userId]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATE', 'user_profile_picture', duration, true);
      
      return { success: true, filename };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATE', 'user_profile_picture', duration, false, error);
      throw new Error('Failed to update profile picture');
    }
  }

  static async getProfilePicture(userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      const user = await db.get(`
        SELECT profile_picture 
        FROM users 
        WHERE id = ?
      `, [userId]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_profile_picture', duration, true);
      
      return user?.profile_picture || null;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_profile_picture', duration, false, error);
      throw new Error('Failed to get profile picture');
    }
  }

  static async deleteProfilePicture(userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      // Get current profile picture to delete file
      const currentPicture = await this.getProfilePicture(userId);
      
      // Update database to remove profile picture
      await db.run(`
        UPDATE users 
        SET profile_picture = NULL 
        WHERE id = ?
      `, [userId]);

      // Delete file if it exists
      if (currentPicture) {
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'profiles', currentPicture);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.warn('Could not delete profile picture file:', fileError.message);
        }
      }

      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATE', 'user_profile_picture_delete', duration, true);
      
      return { success: true };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATE', 'user_profile_picture_delete', duration, false, error);
      throw new Error('Failed to delete profile picture');
    }
  }
}
