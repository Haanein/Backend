import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const UserSchema = new mongoose.Schema(
  {
    name: {
      required: [true, "Name"],
      type: String,
      maxlength: [30, "Нэр урт байна!"],
    },
    email: {
      required: [false, "Email"],
      unique: [true, "Таны оруулсан email бүртгэгдсэн байна"],
      type: String,
    },
    password: {
      required: [true, "Password"],
      type: String,
    },
    role: {
      enum: ["normal", "Admin", "admin"],
      default: "normal",
      required: true,
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
UserSchema.virtual("Link", {
  ref: "Link",
  localField: "_id",
  foreignField: "user_id",
});
UserSchema.path("name").validate((name) => {
  return !/[0-9]/.test(name);
}, "Neren dund too orj bolku");

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.jwtGenerate = async function () {
  return jwt.sign({ id: this._id, username: this.username }, process.env.JWT, {
    expiresIn: "1d",
  });
};
const User = mongoose.model("User", UserSchema);

export default User;
