import Destination from "../../models/destinations/destination.model.js";
import {
  deleteFromS3,
  getSignedUrlForKey,
  uploadToS3,
} from "../../services/awsS3.service.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";

export const createDestination = asyncHandler(async (req, res, next) => {
  console.log("req files: ", req.files);
  const imageFile = req.files.image[0];
  const image = await uploadToS3(imageFile, "destinations/image");
  const destination = await Destination.create({
    name: req.body.name,
    //     image: image.url,
    imageKey: image.key,
  });
  res.status(201).json(destination);
});

export const getAllDestinations = asyncHandler(async (req, res, next) => {
  const destinations = await Destination.find();
  const withUrls = await Promise.all(
    destinations.map(async (dest) => {
      const imageUrl = await getSignedUrlForKey(dest.imageKey);
      return {
        ...dest.toObject(),
        imageUrl,
      };
    })
  );
  res.status(200).json(withUrls);
});

export const deleteDestinationById = asyncHandler(async (req, res) => {
  const deletedDestination = await Destination.findByIdAndDelete(req.params.id);
  if (!deletedDestination) {
    throw new ApiError("Destination not found", 404);
  }

  if (deletedDestination.imageKey) {
    await deleteFromS3(deletedDestination.imageKey);
  }

  res.status(200).json({
    success: true,
    message: "Destination deleted successfully",
  });
});
