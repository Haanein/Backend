import express from "express";
import {
  getAllUser,
  createUser,
  getUserByObject,
  deleteUser,
  getUserById,
} from "../controller/users.js";

const userRouter = express.Router();

userRouter.get("/", getAllUser);
userRouter.post("/signup", createUser);
userRouter.post("/login", getUserByObject);
userRouter.route("/:id").delete(deleteUser).get(getUserById);

export default userRouter;
