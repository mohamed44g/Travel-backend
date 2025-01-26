import pool from "../db";
import bcrypt from "bcrypt";
import Error from "../util/AppError";
import AsyncWrapper from "../middlewares/ErrorWarrper";
import regesterSchema from "../util/regesterValdator";
import { Sendresponse } from "../util/response";
import { Request, Response, NextFunction } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../util/jwtUtils";

import nodemailer from "nodemailer";
import { Users } from "../models/usersModel";

export const registerUser = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, gender } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const query = `
  INSERT INTO users_table(name, email, password,gender) 
  VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [name, email, hashedPassword, gender];
    const result = await pool.query(query, values);

    Sendresponse(res, 201, "User created successfully", result.rows[0]);
  }
);

export const loginUser = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users_table WHERE email = $1";
    const values = [email];
    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return next(new Error("Invalid email or password.", 400));
    }

    const match = await bcrypt.compare(password, result.rows[0].password);

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
  }
);

export const auth = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Token not provided.", 401));
    }

    const payload = await verifyAccessToken(token);

    Sendresponse(res, 200, "User authantcated", token);
  }
);

export const checkRole = (role: string) => {
  return (req, res: Response, next: NextFunction) => {
    if (req.user.role !== role) {
      return next(new Error("You can not access this page.", 403));
    }
    next();
  };
};

export const resetPassword = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const query = "SELECT * FROM users_table WHERE email = $1";
    const values = [email];
    const result = await pool.query(query, values);
  }
);

export const sendEmail = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
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

    await transporter.sendMail(mailOptions);

    res.json({ message: "Reset code sent to your email" });
  }
);

const userModel = new Users();

export const getUserComments = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const userComments = await userModel.getUserComments(userId);
    Sendresponse(res, 200, "Comments fetched successfully", userComments);
  }
);

export const deleteComment = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { commentId } = req.query;

    const { userId } = req.user;
    const userComments = await userModel.getDeleteComment(commentId, userId);

    Sendresponse(res, 200, "Comment deleted successfully", null);
  }
);

export const getUserDestination = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const userDestination = await userModel.getUserDestination(userId);
    Sendresponse(
      res,
      200,
      "Destinations fetched successfully",
      userDestination
    );
  }
);

export const deleteUserDestination = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { tripId } = req.params;
    const { userId } = req.user;
    const userDestination = await userModel.deleteUserDestination(
      userId,
      tripId
    );
    Sendresponse(res, 200, "Destination deleted successfully", null);
  }
);

export const refreshToken = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies["refreshToken"];
    console.log(req.cookies);
    if (!refreshToken) {
      return next(new Error("Token not provided.", 401));
    }

    const payload = await verifyRefreshToken(refreshToken);
    console.log(payload);
    const accessToken = generateAccessToken(
      payload.id,
      payload.name,
      payload.role
    );
    Sendresponse(res, 200, "User refreshed successfully", { accessToken });
  }
);

export const getUserProfile = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const userProfile = await userModel.getUserProfile(userId);
    if (!userProfile) {
      return next(new Error("No profile found for this user.", 404));
    }
    Sendresponse(res, 200, "Profile fetched successfully", userProfile);
  }
);

export const updateUserProfile = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const { name, phone, gender, country, language } = req.body;
    const update = await userModel.updateUserProfile(
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
  }
);

export const Logout = AsyncWrapper(
  async (req, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken", { path: "/" });
    Sendresponse(res, 200, "User logged out successfully", null);
  }
);
