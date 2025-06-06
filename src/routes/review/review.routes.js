import express from "express";
import {
  authenticateToken,
  verifyPermission,
} from "../../middlewares/auth.middleware.js";
import {
  createReview,
  deleteReviewById,
  getAllReviews,
  updateReviewById,
} from "../../controllers/review/review.controller.js";
import { USER_ROLES_ENUM } from "../../../constants.js";

const router = express.Router();

router
  .route("/")
  .post(authenticateToken, createReview)
  .get(
    authenticateToken,
    verifyPermission([USER_ROLES_ENUM.ADMIN]),
    getAllReviews
  );

router
  .route("/:reviewId")
  .patch(authenticateToken, updateReviewById)
  .delete(
    authenticateToken,
    verifyPermission([USER_ROLES_ENUM.USER, USER_ROLES_ENUM.ADMIN]),
    deleteReviewById
  );

export default router;
