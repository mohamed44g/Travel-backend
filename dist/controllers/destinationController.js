var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import AsyncWrapper from "../middlewares/ErrorWarrper.js";
import Error from "../util/AppError.js";
import pool from "../db.js";
import { Sendresponse } from "../util/response.js";
import { destination } from "../models/destinationModel.js";
const destinationModel = new destination();
export const getdestinations = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    if (!page || +page <= 0) {
      return next(new Error("Page number must be a positive integer.", 400));
    }
    const offset = (+page - 1) * 9;
    const query = "SELECT * FROM trip LIMIT 9 OFFSET $1";
    const result = yield pool.query(query, [offset]);
    Sendresponse(res, 200, "All destinations", [
      result.rows,
      { page, limit: 9 },
    ]);
  })
);
export const getdestination = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    //Check availability
    const checkAvailability = yield destinationModel.getTripAvailability(id);
    const destination = yield destinationModel.getDestination(id);
    if (!destination) {
      return next(new Error("Destination not found.", 404));
    }
    // Get the available tickets
    destination.availableTickets = checkAvailability;
    Sendresponse(res, 200, "destination", destination);
  })
);
export const postComment = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { tripId, comment, rate } = req.body;
    const query =
      "INSERT INTO comments (content, rate, user_id, trip_id) VALUES ($1, $2, $3, $4) RETURNING *";
    const { userId } = req.user;
    const values = [comment, rate, userId, tripId];
    const result = yield pool.query(query, values);
    Sendresponse(res, 201, "comment added successfully", result.rows[0]);
  })
);
export const getComments = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const tripId = +req.query.tripId;
    if (!tripId || tripId < 0) {
      return next(new Error("Trip id must be provided and postive.", 400));
    }
    const query =
      "SELECT comments.comment_id, comments.content, comments.created_at, comments.rate, users_table.name AS user_name, trip.name AS trip_name FROM comments JOIN users_table ON comments.user_id = users_table.id JOIN trip ON comments.trip_id = trip.id WHERE comments.trip_id = $1;";
    const values = [+tripId];
    const result = yield pool.query(query, values);
    Sendresponse(res, 200, "Comments", result.rows);
  })
);
export const Bookdestination = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { tripId, travelers } = req.body;
    const checkAvailability = yield destinationModel.getTripAvailability(
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
    const result = yield pool.query(query, values);
    result.rows[0].availableTickets = checkAvailability - travelers;
    Sendresponse(res, 201, "Ticket booked successfully", result.rows[0]);
  })
);
