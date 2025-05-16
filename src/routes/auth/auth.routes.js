import express from "express";
import {
  login,
  signup,
  verifyOTP,
} from "../../controllers/auth/auth.controller.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
// router.route("/logout").post();
// router.route("/refresh").post();
// router.route("/forgot-password").post();
// router.route("/reset-password").post();
// router.route("/verify-email").post();
router.route("/verify-otp").post(verifyOTP);
// router.route("/resend-otp").post();

export default router;
