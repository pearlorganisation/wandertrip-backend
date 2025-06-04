import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 30,
    },
    categories: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
      ],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one category is required",
      },
    },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
