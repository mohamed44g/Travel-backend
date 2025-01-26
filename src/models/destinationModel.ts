import Error from "../util/AppError";
import pool from "../db";

export class destination {
  async getTripAvailability(tripId) {
    const client = await pool.connect();

    const checkAvailability =
      "SELECT trip.trip_amount - COALESCE(SUM(trip_bookings.num_travelers), 0) as available_spots FROM trip LEFT JOIN trip_bookings ON trip.id = trip_bookings.trip_id WHERE trip.id = $1 GROUP BY trip.id, trip_amount";
    const availability = await pool.query(checkAvailability, [tripId]);

    if (availability.rows.length === 0) {
      return;
    }
    client.release();
    return availability.rows[0]?.available_spots ?? 0;
  }

  async getDestination(destinationId) {
    const client = await pool.connect();
    const query = "SELECT * FROM trip WHERE id = $1";
    const result = await pool.query(query, [destinationId]);
    client.release();
    return result.rows[0];
  }
}
