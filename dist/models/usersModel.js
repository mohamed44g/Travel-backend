var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from "../db";
export class Users {
    getUserComments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            const query = "SELECT comments.comment_id, comments.content, comments.created_at, comments.rate, users_table.name, trip.name as trip_name FROM comments JOIN users_table ON comments.user_id = users_table.id JOIN trip ON comments.trip_id = trip.id WHERE comments.user_id = $1";
            const result = yield pool.query(query, [userId]);
            client.release();
            return result.rows;
        });
    }
    getDeleteComment(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            const query = "DELETE FROM comments WHERE comment_id = $1 AND user_id = $2";
            const result = yield pool.query(query, [commentId, userId]);
            client.release();
            return result.rowCount;
        });
    }
    getUserDestination(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            const query = "SELECT trip_bookings.user_id, trip_bookings.trip_id, trip_bookings.num_travelers, trip_bookings.created_at,trip.name, trip.image, trip.location, trip.date, trip.time, trip.price, trip.rating FROM trip_bookings JOIN trip ON trip_bookings.trip_id = trip.id WHERE user_id = $1";
            const result = yield pool.query(query, [userId]);
            client.release();
            return result.rows;
        });
    }
    deleteUserDestination(userId, tripId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            const query = "DELETE FROM trip_bookings WHERE user_id = $1 AND trip_id = $2";
            const result = yield pool.query(query, [userId, tripId]);
            client.release();
            return result.rowCount;
        });
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            const query = "SELECT * FROM users_table WHERE id = $1";
            const result = yield pool.query(query, [userId]);
            client.release();
            return result.rows[0];
        });
    }
    updateUserProfile(userId, name, phone, gender, country, language) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            const query = "UPDATE users_table SET name = $1, phone = $2 , gender = $3, country = $4,language = $5 WHERE id = $6";
            const result = yield pool.query(query, [
                name,
                phone,
                gender,
                country,
                language,
                userId,
            ]);
            client.release();
            return result.rowCount;
        });
    }
}
