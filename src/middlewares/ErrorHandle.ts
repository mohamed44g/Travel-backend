import { Request, Response, NextFunction } from "express";
const ErrorHandler = (err, req: Request, res: Response, next: NextFunction) => {
  // Distinguish environments
  if (process.env.NODE_ENV === "development") {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      status: err.status || "error",
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "production") {
    // Operational errors
    if (err.isOperational) {
      //check duplicate error
      if (err?.code === "23505") {
        return res.status(409).json({
          status: "error",
          code: 409,
          message: "Email already exists",
        });
        //check token validity
      } else if (err?.name === "JsonWebTokenError") {
        return res.status(401).json({
          status: "error",
          code: 401,
          message: "Invalid token please log in again",
        });
      } else if (err?.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          code: 401,
          message: "user is not authorized",
        });
      }

      return res.status(err.statusCode || 500).json({
        status: err.status,
        code: err.statusCode || 500,
        message: err.message,
      });
    }

    // Programming or unknown errors (don't leak details to the client)
    console.error("ERROR 💥", err);
    if (err.code === "23505" && err.constraint === "trip_bookings_pkey") {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "you can't register more than one trip at the same time",
      });
    }

    if (err?.code === "23505") {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email already exists",
      });
      //check token validity
    }

    if (err?.code === "22P02") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid pramater please send a valid data",
      });
    }
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
    });
  }
};

export default ErrorHandler;
