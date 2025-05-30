import express from "express";
import {
  changePassword,
  getAllUsers,
  getUserProfile,
} from "../../controllers/users/user.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/change-password").post(authenticateToken, changePassword);
router.route("/profile").get(authenticateToken, getUserProfile);
router.route("/").get(authenticateToken, getAllUsers);

export default router;
