import Destination from "../../models/destinations/destination.model.js";
import {
  deleteFromS3,
  getSignedUrlForKey,
  uploadToS3,
} from "../../services/awsS3.service.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

export const createDestination = asyncHandler(async (req, res, next) => {
  const { image, banner } = req.files;
  let newImageKey, newBannerKey;
  try {
    if (image?.[0]) {
      const img = await uploadToS3(image[0], "destinations/image");
      newImageKey = img.key;
    }
    if (banner?.[0]) {
      const bn = await uploadToS3(banner[0], "destinations/banner");
      newBannerKey = bn.key;
    }
    const destination = await Destination.create({
      ...req.body,
      imageKey: newImageKey,
      bannerKey: newBannerKey,
    });
    if (!destination) {
      return next(new ApiError("Failed to create destination", 400));
    }
    res.status(201).json({
      success: true,
      message: "Destination created successfully.",
      data: destination,
    });
  } catch (err) {
    //Cleanup any newly uploaded files on failure
    if (newImageKey) await deleteFromS3(newImageKey);
    if (newBannerKey) await deleteFromS3(newBannerKey);
    return next(err);
  }
});

export const getAllDestinations = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const filter = {
    ...(category && { category: { $regex: `^${category}$`, $options: "i" } }),
    ...(search && {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const { data: destinations, pagination } = await paginate(
    Destination,
    parseInt(page),
    parseInt(limit),
    filter
  );

  const destinationsWithUrls = await Promise.all(
    destinations.map(async (dest) => {
      const imageUrl = dest.imageKey
        ? await getSignedUrlForKey(dest.imageKey)
        : null;
      const bannerUrl = dest.bannerKey
        ? await getSignedUrlForKey(dest.bannerKey)
        : null;
      return {
        ...dest.toObject(),
        imageUrl,
        bannerUrl,
      };
    })
  );

  return res.status(200).json({
    success: true,
    message: "Destinations fetched successfully",
    pagination,
    data: destinationsWithUrls,
  });
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

  let newImageKey, newBannerKey;

  try {
    if (image?.[0]) {
      const img = await uploadToS3(image[0], "destinations/image");
      newImageKey = img.key;
    }
    if (banner?.[0]) {
      const bn = await uploadToS3(banner[0], "destinations/banner");
      newBannerKey = bn.key;
    }
    const updateDestination = {
      ...req.body,
      ...(newImageKey && { imageKey: newImageKey }),
      ...(newBannerKey && { bannerKey: newBannerKey }),
    };
    const updatedDestination = await Destination.findOneAndUpdate(
      { slug },
      updateDestination,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDestination) {
      return next(new ApiError("Failed to update destination", 400));
    }

    // 4. Only now delete old S3 objects
    if (newImageKey && existingDestination.imageKey)
      await deleteFromS3(existingDestination.imageKey);
    if (newBannerKey && existingDestination.bannerKey)
      await deleteFromS3(existingDestination.bannerKey);

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: updatedDestination,
    });
  } catch (err) {
    //Cleanup any newly uploaded files on failure
    if (newImageKey) await deleteFromS3(newImageKey);
    if (newBannerKey) await deleteFromS3(newBannerKey);
    return next(err);
  }
});

export const getDestinationBySlug = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findOne({ slug: req.params?.slug });

  if (!destination) {
    return next(new ApiError("Property not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Destination found successfully",
    data: destination,
  });
});
