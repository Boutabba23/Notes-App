// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log("Protect middleware hit. Headers:", req.headers.authorization); // Log 1

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token extracted:", token); // Log 2

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded:", decoded); // Log 3

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");
      console.log("User found from token:", req.user); // Log 4

      if (!req.user) {
        console.log("User not found in DB for decoded ID:", decoded.id);
        res.status(401);
        throw new Error("Not authorized, user not found");
      }
      next();
    } catch (error) {
      console.error("Token verification/User fetch error:", error.message); // Log 5
      res.status(401);
      // Send a more specific error message based on the error type
      if (error.name === "JsonWebTokenError") {
        throw new Error("Not authorized, token malformed or invalid");
      } else if (error.name === "TokenExpiredError") {
        throw new Error("Not authorized, token expired");
      } else {
        throw new Error("Not authorized, token failed");
      }
    }
  }

  if (!token) {
    console.log("No token found or not Bearer type."); // Log 6
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
