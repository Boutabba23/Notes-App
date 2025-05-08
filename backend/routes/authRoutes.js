// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // Make sure this path is correct

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe); // 'protect' middleware is crucial here

module.exports = router;
