import express from "express";
import {
  loginUser,
  registerUser,
  auth,
  checkRole,
  resetPassword,
  sendEmail,
  getUserComments,
  deleteComment,
  getUserDestination,
  deleteUserDestination,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  Logout,
} from "../controllers/userController";
import {
  validateRegester,
  validateLogin,
  validateResetPassword,
} from "../middlewares/userValidator";
import authenticate from "../middlewares/authenticate";
import { Sendresponse } from "../util/response";
const router = express.Router();

router.post("/register", validateRegester, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/resetPassword", validateResetPassword, resetPassword);
router.get("/check", auth);
router.post("/sendEmail", sendEmail);
router.post("/logout", authenticate, Logout);
router
  .get("/comment", authenticate, getUserComments)
  .delete("/comment", authenticate, deleteComment);
// router.get("/dashboard", authenticate, checkRole("admin"), (req, res) => {
//   Sendresponse(res, 200, "Dashboard accessed", null);
// });

router.post("/refreshtoken", refreshToken);

router
  .get("/destination", authenticate, getUserDestination)
  .delete("/destination/:tripId", authenticate, deleteUserDestination);

router
  .get("/profile", authenticate, getUserProfile)
  .put("/profile", authenticate, updateUserProfile);

export default router;
