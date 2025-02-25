import express from "express";
import {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
  getPlacesWithinRadius,
  addReview,
} from "../controller/places.js";

const placeRouter = express.Router();

// Define routes properly
placeRouter.route("/").get(getAllPlaces).post(createPlace);
placeRouter
  .route("/:id")
  .get(getPlaceById)
  .patch(updatePlace)
  .delete(deletePlace);
placeRouter.route("/radius/:lat/:lng/:distance").get(getPlacesWithinRadius);
placeRouter.route("/:id/reviews").post(addReview);

export default placeRouter;
