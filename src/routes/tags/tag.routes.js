import express from "express";
import {
  createTag,
  getAllTags,
  updateTagById,
  deleteTagById,
} from "../../controllers/tag/tag.controller.js";

const router = express.Router();

router.route("/").post(createTag).get(getAllTags);
router.route("/:id").patch(updateTagById).delete(deleteTagById);

export default router;
