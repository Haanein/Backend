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
        message: "Энэ имэйл дээр бүртгэл үүссэн байна. Өөр имэйл ашиглана уу.",
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
      message: "Бүртгэл амжилттай үүслээ.",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Таны бүртгэлийг үүсгэх явцад алдаа гарлаа. Дахин оролдоно уу.",
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
        message: "Нэвтрэхийн тулд имэйл болон нууц үг шаардлагатай.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Имэйл эсвэл нууц үг таарсангүй. Дахин оролдоно уу.",
      });
    }

    const token = user.generateAuthToken();
    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "Амжилттай нэвтэрлээ.",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Нэвтрэх явцад алдаа гарлаа. Дараа дахин оролдоно уу.",
    });
  }
};

// @desc    Get all users
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      status: "success",
      message: "Хэрэглэгчдийг амжилттай татаж авлаа.",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Хэрэглэгчдийг татаж чадсангүй. Дараа дахин оролдоно уу.",
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
        message: "Имэйл болон нууц үгээ оруулна уу.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Энэ имэйлтэй хэрэглэгч олдсонгүй.",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Нууц үг буруу байна. Дахин оролдоно уу.",
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
      message: "Хэрэглэгчийг амжилттай баталгаажууллаа.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Алдаа гарлаа. Дараа дахин оролдоно уу.",
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
        message: "Хэрэглэгч олдсонгүй. ID-г шалгаад дахин оролдоно уу.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Хэрэглэгчийн мэдээллийг амжилттай татаж авлаа.",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message:
        "Хэрэглэгчийн мэдээллийг татаж авахад алдаа гарлаа. Дахин оролдоно уу.",
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
          "Энд нууц үг шинэчлэхийг хориглоно. /updatePassword маршрутыг ашиглана уу.",
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
        message: "Хэрэглэгч олдсонгүй. ID-г шалгаад дахин оролдоно уу.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Хэрэглэгчийн профайлыг амжилттай шинэчилсэн.",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Профайлыг шинэчлэхэд алдаа гарлаа. Дараа дахин оролдоно уу.",
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
        message: "Хэрэглэгч олдсонгүй. Устгах боломжгүй.",
      });
    }

    res.status(204).json({
      status: "success",
      message: "Хэрэглэгчийг амжилттай устгасан.",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Хэрэглэгчийг устгах явцад алдаа гарлаа. Дахин оролдоно уу.",
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
        message: "Хэрэглэгч олдсонгүй. Дахин нэвтэрнэ үү.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Хэрэглэгчийн профайлыг амжилттай татаж авлаа.",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Профайлыг сэргээхэд алдаа гарлаа. Дараа дахин оролдоно уу.",
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
