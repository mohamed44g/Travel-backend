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
import pool from "../db.js";
export class destination {
  getTripAvailability(tripId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      const client = yield pool.connect();
      const checkAvailability =
        "SELECT trip.trip_amount - COALESCE(SUM(trip_bookings.num_travelers), 0) as available_spots FROM trip LEFT JOIN trip_bookings ON trip.id = trip_bookings.trip_id WHERE trip.id = $1 GROUP BY trip.id, trip_amount";
      const availability = yield pool.query(checkAvailability, [tripId]);
      if (availability.rows.length === 0) {
        return;
      }
      client.release();
      return (_b =
        (_a = availability.rows[0]) === null || _a === void 0
          ? void 0
          : _a.available_spots) !== null && _b !== void 0
        ? _b
        : 0;
    });
  }
  getDestination(destinationId) {
    return __awaiter(this, void 0, void 0, function* () {
      const client = yield pool.connect();
      const query = "SELECT * FROM trip WHERE id = $1";
      const result = yield pool.query(query, [destinationId]);
      client.release();
      return result.rows[0];
    });
  }
}
