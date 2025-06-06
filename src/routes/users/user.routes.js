import express from "express";
import {
  changePassword,
  getAllUsers,
  getUserProfile,
} from "../../controllers/users/user.controller.js";
import {
  authenticateToken,
  verifyPermission,
} from "../../middlewares/auth.middleware.js";
import { USER_ROLES_ENUM } from "../../../constants.js";

const router = express.Router();

router.route("/change-password").post(authenticateToken, changePassword);
router.route("/profile").get(authenticateToken, getUserProfile);
router
  .route("/")
  .get(
    authenticateToken,
    verifyPermission([USER_ROLES_ENUM.ADMIN]),
    getAllUsers
  );

export default router;
