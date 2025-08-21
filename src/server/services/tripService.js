import { getDb } from '../infra/db.js';
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
      return trips;
    } catch (error) {
      const duration = Date.now() - startTime;
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
      return trip;
    } catch (error) {
      const duration = Date.now() - startTime;
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
      return booking;
    } catch (error) {
      const duration = Date.now() - startTime;
      throw error;
    }
  }

  static async createTrip(tripData) {
    const startTime = Date.now();
    const db = await getDb();

    try {
      const { title, description, location, start_date, end_date, difficulty, price, seats_total } = tripData;

      const result = await db.run(`
        INSERT INTO trips (title, description, location, start_date, end_date, difficulty, price, seats_total, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [title, description, location, start_date, end_date, difficulty, price, seats_total]);

      const trip = await db.get(`
        SELECT * FROM trips WHERE id = ?
      `, [result.lastID]);

      const duration = Date.now() - startTime;
      return trip;
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error('Failed to create trip');
    }
  }

  static async updateTrip(id, tripData) {
    const startTime = Date.now();
    const db = await getDb();

    try {
      const { title, description, location, start_date, end_date, difficulty, price, seats_total } = tripData;

      await db.run(`
        UPDATE trips 
        SET title = ?, description = ?, location = ?, start_date = ?, end_date = ?, 
            difficulty = ?, price = ?, seats_total = ?
        WHERE id = ?
      `, [title, description, location, start_date, end_date, difficulty, price, seats_total, id]);

      const trip = await db.get(`
        SELECT * FROM trips WHERE id = ?
      `, [id]);

      if (!trip) {
        throw new Error('Trip not found');
      }

      const duration = Date.now() - startTime;
      return trip;
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error('Failed to update trip');
    }
  }

  static async deleteTrip(id) {
    const startTime = Date.now();
    const db = await getDb();

    try {
      // Check if trip exists
      const trip = await db.get(`
        SELECT id FROM trips WHERE id = ?
      `, [id]);

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Soft delete by setting active = 0
      await db.run(`
        UPDATE trips SET active = 0 WHERE id = ?
      `, [id]);

      const duration = Date.now() - startTime;
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error('Failed to delete trip');
    }
  }
}
