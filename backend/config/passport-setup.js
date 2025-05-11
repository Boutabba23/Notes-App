// config/passport-setup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback", // Relative, matches Google Console
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const photoUrl = profile.photos?.[0]?.value; // <<< GET PHOTO URL

        if (!email || !googleId) {
          return done(new Error("Google profile missing email or ID"), null);
        }

        let user = await User.findOne({ googleId: googleId });

        if (!user) {
          user = await User.findOne({ email: email }); // Check if email exists (e.g. for linking)
          if (user) {
            // User exists by email, link googleId
            user.googleId = googleId;
            user.profilePicture = photoUrl || user.profilePicture; // Update if new photo available
            await user.save();
          } else {
            // New user
            let username =
              profile.displayName.replace(/\s+/g, "").toLowerCase() ||
              `user${Date.now()}`;
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
              username = `${username}${Math.floor(Math.random() * 1000)}`;
            } else {
              user = new User({
                googleId,
                email,
                username,
                profilePicture: photoUrl, // <<< SAVE PHOTO URL FOR NEW USER
              });
              await user.save();
            }
          }
        } else {
          // User found by googleId, optionally update their photo if it changed or wasn't set
          if (photoUrl && user.profilePicture !== photoUrl) {
            user.profilePicture = photoUrl;
            await user.save();
          }
        }
        // If user was found by googleId or created/updated, generate token
        const token = generateToken(user._id);
        return done(null, { user: user.toObject(), token }); // Pass user object and your app's token
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
