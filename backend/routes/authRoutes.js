// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
// Remove or comment out your old signupUser, loginUser controllers if going Gmail-only
// const { signupUser, loginUser, getMe } = require('../controllers/authController');
const { getMe } = require("../controllers/authController"); // Keep getMe
const { protect } = require("../middleware/authMiddleware");

// If truly Gmail-only, you might remove these or keep them commented out
// router.post('/signup', signupUser);
// router.post('/login', loginUser);

router.get("/me", protect, getMe);

// Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL_PROD
        : process.env.CLIENT_URL_DEV
    }/login?error=google_auth_failed`,
    session: false, // Important for JWT flow
  }),
  (req, res) => {
    // req.user is { user (from DB), token (your app's JWT) }
    const token = req.user.token;
    const clientUrl =
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL_PROD
        : process.env.CLIENT_URL_DEV;
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  }
);

module.exports = router;
