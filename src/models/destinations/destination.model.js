import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    // slug: { type: String, unique: true, required: true, trim: true },
    // country: { type: String, required: true },
    // tags: { type: [String], default: [] },
    // description: { type: String, required: true },
    // banner: { type: String, required: true },
    // image: { type: String, required: true },
    imageKey: { type: String, required: true },
  },
  { timestamps: true }
);

export const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;
