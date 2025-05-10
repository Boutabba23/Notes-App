// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};
// controllers/authController.js
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Both email and password must be provided for this login type
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Find user by email and explicitly select the password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    // User not found with that email
    res.status(401);
    throw new Error("Invalid email or password"); // Generic message
  }

  // Check if the user has a password (they might have signed up via Google)
  if (!user.password) {
    res.status(401);
    throw new Error(
      "This account was registered using Google. Please log in with Google."
    );
  }

  // If user exists and has a password, then try to match it
  if (await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password"); // Generic message for password mismatch
  }
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
// controllers/authController.js
const signupUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // For traditional signup, all these are mandatory
  if (!username || !email || !password) {
    // Explicitly check for password
    res.status(400);
    throw new Error("Please add all fields (username, email, password)");
  }

  if (password.length < 6) {
    // Add password length validation
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    res.status(400);
    // More specific error:
    if (userExists.email === email) {
      throw new Error("User already exists with that email");
    } else {
      throw new Error("User already exists with that username");
    }
  }

  // Create user (password will be hashed by the pre-save hook)
  const user = await User.create({
    username,
    email,
    password, // Pass the plain password here
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id), // generateToken uses your JWT_SECRET
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});
// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the 'protect' middleware
  res.status(200).json(req.user);
});

module.exports = {
  signupUser,
  loginUser,
  getMe,
};
