import { verifyAccessToken } from "../util/jwtUtils";
import Error from "../util/AppError";

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("You are not authraized", 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new Error("You are not authraized", 401));
  }
};

export default authenticate;
