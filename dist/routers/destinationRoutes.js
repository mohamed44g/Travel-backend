import express from "express";
import {
  getdestinations,
  getdestination,
  postComment,
  getComments,
  Bookdestination,
} from "../controllers/destinationController.js";
import authenticate from "../middlewares/authenticate.js";
import { commentValidator } from "../middlewares/destination.js";
const router = express.Router();
router
  .get("/comment", getComments)
  .post("/comment", commentValidator, authenticate, postComment);
router.get("/comment/", getComments);
router.post("/booking", authenticate, Bookdestination);
router.get("/", getdestinations);
router.get("/:id", getdestination);
export default router;
