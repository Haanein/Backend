import Place from "../model/Place.js";
import Link from "../model/Link.js";

// @desc    Get all places
// @route   GET /api/places
// @access  Public
export const getAllPlaces = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    let query = Place.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const places = await query.populate({
      path: "createdBy",
      select: "name email",
    });

    res.status(200).json({
      status: "success",
      results: places.length,
      data: {
        places,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc    Get place by ID
// @route   GET /api/places/:id
// @access  Public
export const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate({
        path: "createdBy",
        select: "name email",
      })
      .populate("links");

    if (!place) {
      return res.status(404).json({
        status: "error",
        message: "Place not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        place,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc    Create a new place
// @route   POST /api/places
// @access  Private
export const createPlace = async (req, res) => {
  try {
    // Add user ID to request body
    req.body.createdBy = req.user._id;

    const place = await Place.create(req.body);

    // Create an owner link for the user
    await Link.create({
      user_id: req.user._id,
      place_id: place._id,
      linkType: "owner",
    });

    res.status(201).json({
      status: "success",
      data: {
        place,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc    Update place
// @route   PATCH /api/places/:id
// @access  Private
export const updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        status: "error",
        message: "Place not found",
      });
    }

    // Check if user is the owner or an admin
    if (
      place.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to update this place",
      });
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        place: updatedPlace,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access  Private
export const deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        status: "error",
        message: "Place not found",
      });
    }

    // Check if user is the owner or an admin
    if (
      place.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to delete this place",
      });
    }

    await Place.findByIdAndDelete(req.params.id);

    // Delete all links related to this place
    await Link.deleteMany({ place_id: req.params.id });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc    Get places within radius
// @route   GET /api/places/radius/:lat/:lng/:distance
// @access  Public
export const getPlacesWithinRadius = async (req, res) => {
  try {
    const { lat, lng, distance } = req.params;

    // Calculate radius using radians: divide distance by Earth's radius (6371 km)
    const radius = distance / 6371;

    const places = await Place.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      status: "success",
      results: places.length,
      data: {
        places,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc    Add review to place
// @route   POST /api/places/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const placeId = req.params.id;
    const userId = req.user._id;
    const { rating, reviewContent } = req.body;

    // Validate input
    if (!rating || !reviewContent) {
      return res.status(400).json({
        status: "error",
        message: "Please provide rating and review content",
      });
    }

    // Check if place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        status: "error",
        message: "Place not found",
      });
    }

    // Create review
    place.reviews.push({
      user: userId,
      rating,
      reviewContent,
    });

    await place.save();

    res.status(201).json({
      status: "success",
      data: {
        place,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
