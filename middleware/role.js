import User from "../model/User.js";
import Link from "../model/Link.js";

export const adminCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    const user = await User.findById(link.user_id);
    console.log(id);
    console.log(link.user_id);
    if (user.role === "Admin" || user.role === "admin") {
      return next();
    } else {
      console.log("admin erh avna uu");
    }
  } catch (error) {
    res.status(401).send({
      success: false,
    });
  }
};
