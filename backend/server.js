// backend/server.js
const dotenv = require("dotenv");
dotenv.config(); // Load env vars first

const express = require("express");
const cors = require("cors"); // <<<<<<<<<<<<<<<<<<< MAKE SURE YOU HAVE THIS INSTALLED AND REQUIRED
const passport = require("passport");
const session = require("express-session");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

require("./config/passport-setup");

connectDB();
const app = express();
// Trust the first proxy (Render's reverse proxy)
// This allows req.protocol to correctly reflect 'https' even if the
// internal connection between Render's proxy and your app is http.
app.set('trust proxy', 1); // <<<<<<<<<<<<<<<<<<< ADD THIS LINE
// === CORS Configuration ===
// Define allowed origins.
// CLIENT_URL_DEV should be 'http://localhost:5173' (or your Vite port)
// CLIENT_URL_PROD should be your deployed Vercel frontend URL
const allowedOrigins = [
  process.env.CLIENT_URL_DEV,
  process.env.CLIENT_URL_PROD,
].filter(Boolean); // .filter(Boolean) removes any undefined values if some env vars are not set

const corsOptions = {
  origin: function (origin, callback) {
        console.log('[CORS] Request Origin:', origin); // <<<< ADD THIS LOG FOR DEBUGGING ON RENDER
    // Allow requests with no origin (like mobile apps or curl requests)
    // OR if the origin is in our allowedOrigins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            console.log('[CORS] Allowed origin:', origin); // <<<< ADD THIS LOG
      callback(null, true);
    } else {
            console.error('[CORS] Blocked origin:', origin); // <<<< ADD THIS LOG
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true, // Allows cookies to be sent/received (important for some OAuth flows or session-based auth)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow methods
  allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow headers
};

app.use(cors(corsOptions)); // <<<<<<<<<<<<<<<<<<< USE THE CORS MIDDLEWARE WITH OPTIONS

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware (for Passport OAuth dance)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

// Passport middleware
app.use(passport.initialize());
// app.use(passport.session()); // If you were deeply relying on passport sessions

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));

// Simple root route
app.get("/", (req, res) => res.send("API is running..."));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  )
);
