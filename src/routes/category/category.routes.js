import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategoryById,
  deleteCategoryById,
} from "../../controllers/category/category.controller.js";

const router = express.Router();

router.route("/").post(createCategory).get(getAllCategories);

router.route("/:id").patch(updateCategoryById).delete(deleteCategoryById);

export default router;
