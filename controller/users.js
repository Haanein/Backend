import User from "../model/User.js";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message:
          "A user with this email already exists. Please use a different email or log in.",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "normal",
    });

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      status: "success",
      message: "Account created successfully!",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message:
        "Something went wrong while creating your account. Please try again.",
    });
  }
};

// @desc    Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required to log in.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password. Please try again.",
      });
    }

    const token = user.generateAuthToken();
    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "Login successful!",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "An error occurred while logging in. Please try again later.",
    });
  }
};

// @desc    Get all users
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully.",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Could not fetch users. Please try again later.",
    });
  }
};

export const getUserByObject = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password were provided
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide both email and password.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No user found with this email.",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password. Please try again.",
      });
    }

    // Generate token (without password)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "100d" }
    );

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "User authenticated successfully.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred. Please try again later.",
    });
  }
};

// @desc    Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("links");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found. Please check the ID and try again.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User details retrieved successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Error retrieving user details. Please try again.",
    });
  }
};

// @desc    Update user profile
export const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      return res.status(400).json({
        status: "error",
        message:
          "Password updates are not allowed here. Please use the /updatePassword route.",
      });
    }

    const filteredBody = filterObj(req.body, "name", "email");

    const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found. Please check the ID and try again.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User profile updated successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Error updating profile. Please try again later.",
    });
  }
};

// @desc    Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found. Unable to delete.",
      });
    }

    res.status(204).json({
      status: "success",
      message: "User deleted successfully.",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "An error occurred while deleting the user. Please try again.",
    });
  }
};

// @desc    Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("links");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found. Please log in again.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Error retrieving profile. Please try again later.",
    });
  }
};

// Helper function to filter objects
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};
