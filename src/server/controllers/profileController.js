import { ProfileService } from '../services/profileService.js';
import { asyncHandler } from '../middlewares/error.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${extension}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const requestId = req.id;
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    // Delete old profile picture if exists
    const oldPicture = await ProfileService.getProfilePicture(userId);
    if (oldPicture) {
      const oldFilePath = path.join(process.cwd(), 'public', 'uploads', 'profiles', oldPicture);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.warn('Could not delete old profile picture:', error.message);
      }
    }

    // Update database with new filename
    const result = await ProfileService.updateProfilePicture(userId, req.file.filename);
    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      filename: req.file.filename,
      url: `/uploads/profiles/${req.file.filename}`
    });
  } catch (error) {
    // Delete uploaded file if database update fails
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (deleteError) {
      console.warn('Could not delete uploaded file after error:', deleteError.message);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
});

export const getProfilePicture = asyncHandler(async (req, res) => {
  const requestId = req.id;
  const userId = req.user.id;

  try {
    const filename = await ProfileService.getProfilePicture(userId);

    res.status(200).json({
      success: true,
      filename,
      url: filename ? `/uploads/profiles/${filename}` : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile picture'
    });
  }
});

export const deleteProfilePicture = asyncHandler(async (req, res) => {
  const requestId = req.id;
  const userId = req.user.id;

  try {
    await ProfileService.deleteProfilePicture(userId);
    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile picture'
    });
  }
});
