import express from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  resetPassword,
  signup,
  verifyOTP,
} from "../../controllers/auth/auth.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(authenticateToken, logout);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword); //forgot password-> verify otp -> reset password
router.route("/reset-password").post(resetPassword);
router.route("/verify-otp").post(verifyOTP);
// router.route("/resend-otp").post();

export default router;
