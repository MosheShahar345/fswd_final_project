import { getDb } from '../infra/db.js';
import { logger } from '../utils/logger.js';

export class TripService {
  static async getAllTrips() {
    const startTime = Date.now();
    const db = await getDb();

    try {
      const trips = await db.all(`
        SELECT 
          t.*,
          COUNT(tb.id) as seats_taken
        FROM trips t
        LEFT JOIN trip_bookings tb ON t.id = tb.trip_id AND tb.status = 'confirmed'
        WHERE t.active = 1
        GROUP BY t.id
        ORDER BY t.start_date ASC
      `);

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'all_trips', duration, true);

      return trips;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'all_trips', duration, false, error);
      throw new Error('Failed to fetch trips');
    }
  }

  static async getTripById(id) {
    const startTime = Date.now();
    const db = await getDb();

    try {
      const trip = await db.get(`
        SELECT 
          t.*,
          COUNT(tb.id) as seats_taken
        FROM trips t
        LEFT JOIN trip_bookings tb ON t.id = tb.trip_id AND tb.status = 'confirmed'
        WHERE t.id = ? AND t.active = 1
        GROUP BY t.id
      `, [id]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'trip_by_id', duration, true);

      return trip;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'trip_by_id', duration, false, error);
      throw new Error('Failed to fetch trip');
    }
  }

  static async bookTrip(tripId, userId) {
    const startTime = Date.now();
    const db = await getDb();

    try {
      // Check if trip exists and has available seats
      const trip = await db.get(`
        SELECT 
          t.*,
          COUNT(tb.id) as seats_taken
        FROM trips t
        LEFT JOIN trip_bookings tb ON t.id = tb.trip_id AND tb.status = 'confirmed'
        WHERE t.id = ? AND t.active = 1
        GROUP BY t.id
      `, [tripId]);

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (trip.seats_taken >= trip.seats_total) {
        throw new Error('Trip is full');
      }

      // Check if user already booked this trip
      const existingBooking = await db.get(`
        SELECT id FROM trip_bookings 
        WHERE trip_id = ? AND user_id = ? AND status = 'confirmed'
      `, [tripId, userId]);

      if (existingBooking) {
        throw new Error('Already booked this trip');
      }

      // Create booking
      const result = await db.run(`
        INSERT INTO trip_bookings (trip_id, user_id, status, paid_amount, created_at)
        VALUES (?, ?, 'confirmed', ?, datetime('now'))
      `, [tripId, userId, trip.price]);

      // Note: seats_taken is calculated dynamically from trip_bookings table
      // No need to update the trips table

      const booking = await db.get(`
        SELECT 
          tb.*,
          t.title as trip_title,
          t.location,
          t.start_date,
          t.end_date,
          t.price
        FROM trip_bookings tb
        JOIN trips t ON tb.trip_id = t.id
        WHERE tb.id = ?
      `, [result.lastID]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('INSERT', 'trip_booking', duration, true);

      return booking;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('INSERT', 'trip_booking', duration, false, error);
      throw error;
    }
  }
}
