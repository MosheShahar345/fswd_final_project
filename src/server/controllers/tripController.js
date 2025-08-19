import { TripService } from '../services/tripService.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError } from '../middlewares/error.js';

export class TripController {
  static getAllTrips = asyncHandler(async (req, res) => {
    const startTime = Date.now();

    try {
      logger.info('Fetching all trips', {
        requestId: req.id,
        ip: req.ip
      });

      const trips = await TripService.getAllTrips();

      const responseTime = Date.now() - startTime;
      logger.info('Trips fetched successfully', {
        requestId: req.id,
        responseTime: `${responseTime}ms`,
        tripCount: trips.length
      });

      res.json({
        success: true,
        data: trips,
        count: trips.length
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch trips', {
        requestId: req.id,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static getTripById = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      logger.info('Fetching trip by ID', {
        requestId: req.id,
        tripId: id,
        ip: req.ip
      });

      const trip = await TripService.getTripById(id);

      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const responseTime = Date.now() - startTime;
      logger.info('Trip fetched successfully', {
        requestId: req.id,
        tripId: id,
        responseTime: `${responseTime}ms`
      });

      res.json({
        success: true,
        data: trip
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch trip', {
        requestId: req.id,
        tripId: id,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static bookTrip = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;
    const userId = req.user.id;

    try {
      logger.info('Booking trip', {
        requestId: req.id,
        tripId: id,
        userId,
        ip: req.ip
      });

      const booking = await TripService.bookTrip(id, userId);

      const responseTime = Date.now() - startTime;
      logger.info('Trip booked successfully', {
        requestId: req.id,
        tripId: id,
        userId,
        bookingId: booking.id,
        responseTime: `${responseTime}ms`
      });

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Trip booked successfully'
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to book trip', {
        requestId: req.id,
        tripId: id,
        userId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });
}
