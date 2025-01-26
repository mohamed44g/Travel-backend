import AsyncWrapper from "./ErrorWarrper.js";
import Error from "../util/AppError.js";
import { Request, Response, NextFunction } from "express";
import CommentSchema from "../util/commentValidator.js";

export const commentValidator = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = CommentSchema.validate(req.body);
    if (error) {
      return next(new Error(error.details[0].message, 400));
    }
    next();
  }
);
