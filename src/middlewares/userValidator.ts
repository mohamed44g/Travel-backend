import AsyncWrapper from "./ErrorWarrper.js";
import Error from "../util/AppError.js";
import regesterSchema from "../util/regesterValdator.js";
import { Request, Response, NextFunction } from "express";
import LoginSchema from "../util/loginValdator.js";
import ResetPassword from "../util/validateResetPassword.js";

export const validateRegester = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = regesterSchema.validate(req.body);
    if (error) {
      return next(new Error(error.details[0].message, 400));
    }
    next();
  }
);

export const validateLogin = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = LoginSchema.validate(req.body);
    if (error) {
      return next(new Error(error.details[0].message, 400));
    }
    next();
  }
);

export const validateResetPassword = AsyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = ResetPassword.validate(req.body);
    if (error) {
      return next(new Error(error.details[0].message, 400));
    }
    next();
  }
);
