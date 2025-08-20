import express from 'express';
import { TripController } from '../controllers/tripController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { validateTrip } from '../validators/trips.js';

const router = express.Router();

// Public routes
router.get('/', TripController.getAllTrips);
router.get('/:id', TripController.getTripById);

// Protected routes
router.post('/:id/book', authenticateToken, TripController.bookTrip);

// Admin routes
router.post('/', authenticateToken, requireRole(['admin']), validateTrip, TripController.createTrip);
router.patch('/:id', authenticateToken, requireRole(['admin']), validateTrip, TripController.updateTrip);
router.delete('/:id', authenticateToken, requireRole(['admin']), TripController.deleteTrip);

export default router;
