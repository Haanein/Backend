import jwt from "jsonwebtoken";

export const checkToken = (req, res, next) => {
  const { token } = req.body;
  jwt.verify(token, "secret", (err, result) => {
    if (err) {
      res.status(403).send({
        data: "Token",
      });
    } else {
      next();
      console.log(result);
      return result;
    }
  });
};
