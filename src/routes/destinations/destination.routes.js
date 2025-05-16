import express from "express";
import upload from "../../middlewares/multer.js";
import {
  createDestination,
  deleteDestinationById,
  getAllDestinations,
} from "../../controllers/destinations/destination.controller.js";

const router = express.Router();

router
  .route("/")
  .post(
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    createDestination
  )
  .get(getAllDestinations);

router.route("/:id").delete(deleteDestinationById);

export default router;
