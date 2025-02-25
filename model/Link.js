import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    linkType: {
      type: String,
      enum: ["favorite", "visited", "review", "owner"],
      required: true,
    },
    reviewContent: {
      type: String,
      required: function () {
        return this.linkType === "review";
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: function () {
        return this.linkType === "review";
      },
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

// Create a compound index to ensure a user can only have one link of each type to a place
LinkSchema.index({ user_id: 1, place_id: 1, linkType: 1 }, { unique: true });

const Link = mongoose.model("Link", LinkSchema);

export default Link;
