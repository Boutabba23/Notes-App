// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const passport = require("passport"); // For Google OAuth

// Import controller functions for user authentication
// Make sure these functions are correctly defined and exported in your authController.js
const {
  signupUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

// Import middleware to protect routes
const { protect } = require("../middleware/authMiddleware");

// === Traditional Email/Password Authentication Routes ===

// POST /api/auth/signup - Register a new user with email and password
router.post("/signup", signupUser);

// POST /api/auth/login - Log in an existing user with email and password
router.post("/login", loginUser);

// === Common Authenticated Route ===

// GET /api/auth/me - Get the profile of the currently logged-in user
// This route is protected by the 'protect' middleware, which validates the JWT.
// The JWT could have been obtained either through email/password login or Google Sign-In.
router.get("/me", protect, getMe);

// === Google OAuth 2.0 Authentication Routes ===

// GET /api/auth/google - Step 1: Redirect to Google for authentication
// When the frontend hits this endpoint, Passport initiates the Google OAuth flow.
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // Request access to the user's Google profile and email address
  })
);

// GET /api/auth/google/callback - Step 2: Google redirects back to this URL after user authentication
// This is the callback URL configured in your Google Cloud Console.
router.get(
  "/google/callback",
  passport.authenticate("google", {
    // If Google authentication fails at their end or the user denies access,
    // redirect them back to the frontend login page with an error query parameter.
    failureRedirect: `${
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL_PROD
        : process.env.CLIENT_URL_DEV
    }/login?error=google_auth_failed`,
    session: false, // We are not using server-side sessions for API authentication; we will use JWTs.
    // Passport's session support is primarily for the duration of the OAuth dance itself.
  }),
  (req, res) => {
    // If Google authentication was successful, the Passport Google strategy's verify callback
    // (the `async (accessToken, refreshToken, profile, done) => { ... }` function)
    // will have run. It should call `done(null, { user, token })`.
    // This makes `req.user` available here, containing the user object from your DB and your app's JWT.

    if (req.user && req.user.token) {
      const token = req.user.token; // This is your application's JWT
      const clientUrl =
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL_PROD
          : process.env.CLIENT_URL_DEV;

      // Redirect the user back to a specific frontend route (e.g., /auth/callback),
      // passing your application's JWT as a query parameter.
      // The frontend will then extract this token, store it, and complete the login process.
      res.redirect(`${clientUrl}/auth/callback?token=${token}`);
    } else {
      // This case indicates an unexpected issue: authentication succeeded at Google's end,
      // but the Passport strategy didn't provide a user/token (e.g., error in the verify callback).
      const clientUrl =
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL_PROD
          : process.env.CLIENT_URL_DEV;
      res.redirect(`${clientUrl}/login?error=token_generation_failed`);
    }
  }
);

module.exports = router;
