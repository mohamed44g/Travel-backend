import Error from "../util/AppError";
import pool from "../db";

export class Users {
  async getUserComments(userId) {
    const client = await pool.connect();
    const query =
      "SELECT comments.comment_id, comments.content, comments.created_at, comments.rate, users_table.name, trip.name as trip_name FROM comments JOIN users_table ON comments.user_id = users_table.id JOIN trip ON comments.trip_id = trip.id WHERE comments.user_id = $1";
    const result = await pool.query(query, [userId]);
    client.release();
    return result.rows;
  }

  async getDeleteComment(commentId: number, userId: number) {
    const client = await pool.connect();
    const query = "DELETE FROM comments WHERE comment_id = $1 AND user_id = $2";
    const result = await pool.query(query, [commentId, userId]);
    client.release();
    return result.rowCount;
  }

  async getUserDestination(userId) {
    const client = await pool.connect();
    const query =
      "SELECT trip_bookings.user_id, trip_bookings.trip_id, trip_bookings.num_travelers, trip_bookings.created_at,trip.name, trip.image, trip.location, trip.date, trip.time, trip.price, trip.rating FROM trip_bookings JOIN trip ON trip_bookings.trip_id = trip.id WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    client.release();
    return result.rows;
  }

  async deleteUserDestination(userId, tripId) {
    const client = await pool.connect();
    const query =
      "DELETE FROM trip_bookings WHERE user_id = $1 AND trip_id = $2";
    const result = await pool.query(query, [userId, tripId]);
    client.release();
    return result.rowCount;
  }

  async getUserProfile(userId) {
    const client = await pool.connect();
    const query = "SELECT * FROM users_table WHERE id = $1";
    const result = await pool.query(query, [userId]);
    client.release();
    return result.rows[0];
  }

  async updateUserProfile(
    userId: number,
    name: string,
    phone: string,
    gender: string,
    country: string,
    language: string
  ) {
    const client = await pool.connect();
    const query =
      "UPDATE users_table SET name = $1, phone = $2 , gender = $3, country = $4,language = $5 WHERE id = $6";
    const result = await pool.query(query, [
      name,
      phone,
      gender,
      country,
      language,
      userId,
    ]);
    client.release();
    return result.rowCount;
  }
}
