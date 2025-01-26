import express from "express";
import Error from "./util/AppError.js";
import ErrorHandler from "./middlewares/ErrorHandle";
import dotenv from "dotenv";
import userRouter from "./routers/userRoutes";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import destinationRoutes from "./routers/destinationRoutes";
// Cross-Origin Resource Sharing (CORS)
dotenv.config();
const app = express();
app.use(
  cors({
    origin: [
      "http://192.168.1.8:5173",
      "http://192.168.1.4:5173",
      "http://localhost:5173",
    ], // Allow all origins
    credentials: true, // Enable cookies
  })
);
app.use(cookieParser());
//Global middlewares
//Setting secure headers
app.use(helmet());
// Parse json request bodies and limit body size
app.use(
  express.json({
    limit: "10kb",
  })
);
// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 2000, // 60 minutes
  limit: 200, // Limit each IP to 200 requests per `window` (here, per 60 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
app.use(limiter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/destination", destinationRoutes);
// Handle 404 errors and forward to error handler
app.all("*", (req, res) => {
  throw new Error("Page not found", 404);
});
// Error handling middleware (must be placed after all routes)
app.use(ErrorHandler);
const server = app.listen(3000, () =>
  console.log("Server started on port 3000")
);
// Unhandled rejections and uncaught exceptions handling
process.on("unhandledRejection", (err) => {
  if (err instanceof Error) {
    console.error("Unhandled rejection error: ", err.message);
    console.error("Stack trace: ", err.stack);
    server.close(() => {
      process.exit(1);
    });
  }
});
// Handle 404 errors and forward to error handler
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception error: ", err.message);
  console.error("Stack trace: ", err.stack);
  server.close(() => {
    process.exit(1);
  });
});
