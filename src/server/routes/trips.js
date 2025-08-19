import express from 'express';
import { TripController } from '../controllers/tripController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', TripController.getAllTrips);
router.get('/:id', TripController.getTripById);

// Protected routes
router.post('/:id/book', authenticateToken, TripController.bookTrip);

export default router;
