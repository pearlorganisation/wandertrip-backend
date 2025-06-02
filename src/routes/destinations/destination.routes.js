import express from "express";
import upload from "../../middlewares/multer.js";
import {
  createDestination,
  deleteDestinationById,
  getAllDestinations,
  getDestinationBySlug,
  updateDestinationBySlug,
} from "../../controllers/destinations/destination.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateToken,
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    createDestination // add auth middleware
  )
  .get(getAllDestinations);

router
  .route("/:slug")
  .patch(
    authenticateToken,
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    updateDestinationBySlug
  )
  .get(getDestinationBySlug);

router.route("/:id").delete(authenticateToken, deleteDestinationById);

export default router;
