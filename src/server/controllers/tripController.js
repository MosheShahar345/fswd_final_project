import { TripService } from '../services/tripService.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError } from '../middlewares/error.js';
export class TripController {
  static getAllTrips = asyncHandler(async (req, res) => {
    const startTime = Date.now();

    try {
      const trips = await TripService.getAllTrips();

      const responseTime = Date.now() - startTime;
      res.json({
        success: true,
        data: trips,
        count: trips.length
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw error;
    }
  });

  static getTripById = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      const trip = await TripService.getTripById(id);

      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const responseTime = Date.now() - startTime;
      res.json({
        success: true,
        data: trip
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw error;
    }
  });

  static bookTrip = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const booking = await TripService.bookTrip(id, userId);

      const responseTime = Date.now() - startTime;
      res.status(201).json({
        success: true,
        data: booking,
        message: 'Trip booked successfully'
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw error;
    }
  });

  static createTrip = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const tripData = req.body;

    try {
      const trip = await TripService.createTrip(tripData);

      const responseTime = Date.now() - startTime;
      res.status(201).json({
        success: true,
        data: trip,
        message: 'Trip created successfully'
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw error;
    }
  });

  static updateTrip = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;
    const tripData = req.body;

    try {
      const trip = await TripService.updateTrip(id, tripData);

      const responseTime = Date.now() - startTime;
      res.json({
        success: true,
        data: trip,
        message: 'Trip updated successfully'
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw error;
    }
  });

  static deleteTrip = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      await TripService.deleteTrip(id);

      const responseTime = Date.now() - startTime;
      res.json({
        success: true,
        message: 'Trip deleted successfully'
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw error;
    }
  });
}
