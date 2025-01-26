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
import pool from "../db";
import bcrypt from "bcrypt";
import Error from "../util/AppError.js";
import AsyncWrapper from "../middlewares/ErrorWarrper";
import { Sendresponse } from "../util/response";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../util/jwtUtils";
import nodemailer from "nodemailer";
import { Users } from "../models/usersModel";
export const registerUser = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, gender } = req.body;
    const hashedPassword = yield bcrypt.hash(password, 12);
    const query = `
  INSERT INTO users_table(name, email, password,gender) 
  VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [name, email, hashedPassword, gender];
    const result = yield pool.query(query, values);
    Sendresponse(res, 201, "User created successfully", result.rows[0]);
  })
);
export const loginUser = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const query = "SELECT * FROM users_table WHERE email = $1";
    const values = [email];
    const result = yield pool.query(query, values);
    if (!result.rows.length) {
      return next(new Error("Invalid email or password.", 400));
    }
    const match = yield bcrypt.compare(password, result.rows[0].password);
    if (!match) {
      return next(new Error("Invalid email or password.", 400));
    }
    const accessToken = generateAccessToken(
      result.rows[0].id,
      result.rows[0].name,
      result.rows[0].user_role
    );
    const refreshToken = generateRefreshToken(
      result.rows[0].id,
      result.rows[0].name,
      result.rows[0].user_role
    );
    result.rows[0].accessToken = accessToken;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: true,
    });
    Sendresponse(res, 200, "User login successfully", result.rows[0]);
  })
);
export const auth = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token =
      (_a = req.header("Authorization")) === null || _a === void 0
        ? void 0
        : _a.replace("Bearer ", "");
    if (!token) {
      return next(new Error("Token not provided.", 401));
    }
    const payload = yield verifyAccessToken(token);
    Sendresponse(res, 200, "User authantcated", token);
  })
);
export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return next(new Error("You can not access this page.", 403));
    }
    next();
  };
};
export const resetPassword = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const query = "SELECT * FROM users_table WHERE email = $1";
    const values = [email];
    const result = yield pool.query(query, values);
  })
);
export const sendEmail = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "8344a38adef1ff",
        pass: "3b4ae56daf8c05",
      },
    });
    const mailOptions = {
      to: email,
      from: "api",
      subject: "Password Reset Code",
      text: `Your password reset code is:`,
    };
    yield transporter.sendMail(mailOptions);
    res.json({ message: "Reset code sent to your email" });
  })
);
const userModel = new Users();
export const getUserComments = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const userComments = yield userModel.getUserComments(userId);
    Sendresponse(res, 200, "Comments fetched successfully", userComments);
  })
);
export const deleteComment = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.query;
    const { userId } = req.user;
    const userComments = yield userModel.getDeleteComment(commentId, userId);
    Sendresponse(res, 200, "Comment deleted successfully", null);
  })
);
export const getUserDestination = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const userDestination = yield userModel.getUserDestination(userId);
    Sendresponse(
      res,
      200,
      "Destinations fetched successfully",
      userDestination
    );
  })
);
export const deleteUserDestination = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { tripId } = req.params;
    const { userId } = req.user;
    const userDestination = yield userModel.deleteUserDestination(
      userId,
      tripId
    );
    Sendresponse(res, 200, "Destination deleted successfully", null);
  })
);
export const refreshToken = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies["refreshToken"];
    console.log(req.cookies);
    if (!refreshToken) {
      return next(new Error("Token not provided.", 401));
    }
    const payload = yield verifyRefreshToken(refreshToken);
    console.log(payload);
    const accessToken = generateAccessToken(
      payload.id,
      payload.name,
      payload.role
    );
    Sendresponse(res, 200, "User refreshed successfully", { accessToken });
  })
);
export const getUserProfile = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const userProfile = yield userModel.getUserProfile(userId);
    if (!userProfile) {
      return next(new Error("No profile found for this user.", 404));
    }
    Sendresponse(res, 200, "Profile fetched successfully", userProfile);
  })
);
export const updateUserProfile = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { name, phone, gender, country, language } = req.body;
    const update = yield userModel.updateUserProfile(
      userId,
      name,
      phone,
      gender,
      country,
      language
    );
    if (!update) {
      return next(new Error("Profile update failed.", 400));
    }
    Sendresponse(res, 200, "Profile updated successfully", null);
  })
);
export const Logout = AsyncWrapper((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("refreshToken", { path: "/" });
    Sendresponse(res, 200, "User logged out successfully", null);
  })
);
