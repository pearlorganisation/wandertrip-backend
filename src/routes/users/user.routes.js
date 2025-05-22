import express from "express";
import {
  changePassword,
  getUserProfile,
} from "../../controllers/users/user.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/change-password").post(authenticateToken, changePassword);
router.route("/profile").get(authenticateToken, getUserProfile);

export default router;
