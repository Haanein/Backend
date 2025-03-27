import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node"; // Import Clerk SDK component

// Import routes
import userRouter from "./router/user.js";
import placeRouter from "./router/place.js";

// Load environment variables
dotenv.config();

// Middleware to verify Clerk sessions
const requireClerkSession = ClerkExpressWithAuth({
  apiKey: process.env.CLERK_API_KEY,
});

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(requireClerkSession); // Apply Clerk middleware

// Routes
app.use("/api/users", userRouter);
app.use("/api/places", placeRouter);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Haanein API",
  });
});

// 404 handler for undefined routes
// app.use("*", (req, res) => {
//   res.status(404).json({
//     status: "error",
//     message: "Route not found",
//   });
// });

// Database connection
const uri = process.env.MONGO_ATLAS_URI;
const port = process.env.PORT || 4200;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Start server
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running at http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
