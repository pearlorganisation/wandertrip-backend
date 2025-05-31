import express from "express";
import upload from "../../middlewares/multer.js";
import {
  createDestination,
  deleteDestinationById,
  getAllDestinations,
  getDestinationBySlug,
  updateDestinationBySlug,
} from "../../controllers/destinations/destination.controller.js";

const router = express.Router();

router
  .route("/")
  .post(
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
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    updateDestinationBySlug
  )
  .get(getDestinationBySlug);

router.route("/:id").delete(deleteDestinationById);

export default router;
