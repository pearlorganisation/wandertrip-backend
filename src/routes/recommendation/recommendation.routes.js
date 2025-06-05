import express from "express";
import { refreshRecommendationsManually } from "../../controllers/recommendation/recommendation.controller.js";

const router = express.Router();

router.route("/refresh").post(refreshRecommendationsManually);

export default router;
