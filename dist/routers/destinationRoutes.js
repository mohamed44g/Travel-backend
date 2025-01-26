import express from "express";
import { getdestinations, getdestination, postComment, getComments, Bookdestination, } from "../controllers/destinationController";
import authenticate from "../middlewares/authenticate";
import { commentValidator } from "../middlewares/destination";
const router = express.Router();
router
    .get("/comment", getComments)
    .post("/comment", commentValidator, authenticate, postComment);
router.get("/comment/", getComments);
router.post("/booking", authenticate, Bookdestination);
router.get("/", getdestinations);
router.get("/:id", getdestination);
export default router;
