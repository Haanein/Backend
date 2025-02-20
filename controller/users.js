import Post from "../model/User.js";
import jwt from "jsonwebtoken";
export const getAllUser = async (req, res) => {
  try {
    const user = await Post.find({}).populate("Link");
    res.status(200).send({
      data: user,
    });
  } catch (error) {
    res.status(400).send({
      data: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await Post.create(req.body);
    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).send({
      data: error.message,
    });
  }
};

export const getUserByObject = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const token = jwt.sign(
      {
        email: email,
        password: password,
        role: role,
      },
      "secret",
      {
        expiresIn: "100d",
      }
    );
    const user = await Post.findOne({
      email,
    });
    const isMatch = await user.comparePassword(password);
    console.log(isMatch);
    if (!isMatch) {
      res.send("isMatch");
    }
    if (user) {
      res.status(200).send({
        data: user,
        token: token,
      });
    } else {
      res.status(404).send({
        data: "User not found",
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Post.findById({ _id: id }).populate("Link");
    res.status(200).send({
      data: user,
    });
  } catch (error) {
    res.status(400).send({
      data: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Post.deleteOne({ _id: id });
    res.send({
      data: user,
    });
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};
