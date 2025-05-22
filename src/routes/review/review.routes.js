import express from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import {
  createReview,
  deleteReviewById,
  updateReviewById,
} from "../../controllers/review/review.controller.js";

const router = express.Router();

router.route("/").post(authenticateToken, createReview);
router
  .route("/:reviewId")
  .patch(authenticateToken, updateReviewById)
  .delete(authenticateToken, deleteReviewById);

export default router;
