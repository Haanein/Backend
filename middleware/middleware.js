import jwt from "jsonwebtoken";

export const checkToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "No token provided or incorrect format",
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        message: "Invalid or expired token",
      });
    }

    req.user = decoded; // Attach user info to the request
    console.log(decoded); // Log the decoded token payload
    next();
  });
};
