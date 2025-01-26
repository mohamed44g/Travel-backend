import { verifyAccessToken } from "../util/jwtUtils.js";
import Error from "../util/AppError.js";
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!token) {
        return next(new Error("You are not authraized", 401));
    }
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return next(new Error("You are not authraized", 401));
    }
};
export default authenticate;
