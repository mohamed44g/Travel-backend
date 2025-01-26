import { Request, Response, NextFunction } from "express";
import AsyncWrapper from "../middlewares/ErrorWarrper";
import Error from "../util/AppError";
import pool from "../db";
import { Sendresponse } from "../util/response";
import { destination } from "../models/destinationModel";

const destinationModel = new destination();

export const getdestinations = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page } = req.query;
    if (!page || +page <= 0) {
      return next(new Error("Page number must be a positive integer.", 400));
    }
    const offset = (+page - 1) * 9;
    const query = "SELECT * FROM trip LIMIT 9 OFFSET $1";
    const result = await pool.query(query, [offset]);

    Sendresponse(res, 200, "All destinations", [
      result.rows,
      { page, limit: 9 },
    ]);
  }
);

export const getdestination = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    //Check availability
    const checkAvailability = await destinationModel.getTripAvailability(id);
    const destination = await destinationModel.getDestination(id);
    if (!destination) {
      return next(new Error("Destination not found.", 404));
    }
    // Get the available tickets
    destination.availableTickets = checkAvailability;
    Sendresponse(res, 200, "destination", destination);
  }
);

export const postComment = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { tripId, comment, rate } = req.body;
    const query =
      "INSERT INTO comments (content, rate, user_id, trip_id) VALUES ($1, $2, $3, $4) RETURNING *";

    const { userId } = req.user;
    const values = [comment, rate, userId, tripId];
    const result = await pool.query(query, values);

    Sendresponse(res, 201, "comment added successfully", result.rows[0]);
  }
);

export const getComments = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const tripId = +req.query.tripId;
    if (!tripId || tripId < 0) {
      return next(new Error("Trip id must be provided and postive.", 400));
    }
    const query =
      "SELECT comments.comment_id, comments.content, comments.created_at, comments.rate, users_table.name AS user_name, trip.name AS trip_name FROM comments JOIN users_table ON comments.user_id = users_table.id JOIN trip ON comments.trip_id = trip.id WHERE comments.trip_id = $1;";

    const values = [+tripId];
    const result = await pool.query(query, values);
    Sendresponse(res, 200, "Comments", result.rows);
  }
);

export const Bookdestination = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { tripId, travelers } = req.body;
    

    const checkAvailability = await destinationModel.getTripAvailability(
      +tripId
    );

    if (checkAvailability < travelers) {
      return next(
        new Error(
          `Not enough tickets available for this trip. Only ${checkAvailability} tickets are available.`,
          400
        )
      );
    }

    if (!checkAvailability) {
      return next(new Error("Trip not found", 404));
    }

    const query =
      "INSERT INTO trip_bookings (trip_id, num_travelers, user_id) VALUES ($1, $2, $3) RETURNING *";

    const { userId } = req.user;
    console.log("from user", userId);
    const values = [tripId, travelers, userId];
    const result = await pool.query(query, values);

    result.rows[0].availableTickets = checkAvailability - travelers;
    Sendresponse(res, 201, "Ticket booked successfully", result.rows[0]);
  }

);
