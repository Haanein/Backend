import mongoose from "mongoose";

const PlaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Place name is required"],
      trim: true,
      maxlength: [100, "Place name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geospatial queries
PlaceSchema.index({ location: "2dsphere" });

// Virtual for links associated with this place
PlaceSchema.virtual("links", {
  ref: "Link",
  localField: "_id",
  foreignField: "place_id",
});

const Place = mongoose.model("Place", PlaceSchema);

export default Place;
