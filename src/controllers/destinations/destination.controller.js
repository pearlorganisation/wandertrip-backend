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
  const bannerFile = req.files.banner[0];
  const image = await uploadToS3(imageFile, "destinations/image");
  const banner = await uploadToS3(bannerFile, "destinations/banner");
  const destination = await Destination.create({
    ...req.body,
    imageKey: image.key,
    bannerKey: banner.key,
  });
  if (!destination) {
    return next(new ApiError("Failed to create destination", 400));
  }
  res.status(201).json({
    success: ture,
    message: "Destination created successfully.",
    data: destination,
  });
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

export const updateDestinationBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const { image, banner } = req.files;

  const existingDestination = await Destination.findOne({
    slug,
  });

  if (!existingDestination) {
    return next(new ApiError("Destination not found", 404));
  }

  let imageResponse;
  let bannerResponse;

  if (image?.[0]) {
    imageResponse = await uploadToS3(image[0], "destinations/image");
  }
  if (banner?.[0]) {
    bannerResponse = await uploadToS3(banner[0], "destinations/banner");
  }
  const updatedDestination = await Destination.findOneAndUpdate(
    { slug },
    { ...req.body, imageKey: imageResponse.key, bannerKey: bannerResponse.key },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedDestination) {
    return next(new ApiError("Failed to update destination", 400));
  }

  // 4. Only now delete old S3 objects
  const deletes = [];
  if (newImageKey && existing.imageKey)
    deletes.push(deleteFromS3(existing.imageKey));
  if (newBannerKey && existing.bannerKey)
    deletes.push(deleteFromS3(existing.bannerKey));
  await Promise.all(deletes);

  res.status(200).json({
    success: true,
    message: "Destination updated successfully",
    data: updatedDestination,
  });
});
