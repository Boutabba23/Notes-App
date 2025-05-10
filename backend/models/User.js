// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false, // Do not return password by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// backend/models/User.js
// ... (schema definition) ...

userSchema.methods.matchPassword = async function (enteredPassword) {
  // It's crucial that `this.password` refers to the HASHED password from the DB
  // And `enteredPassword` is the PLAIN TEXT password from the user input
  console.log(
    "[User.matchPassword] Comparing entered password with stored hash for user:",
    this.email
  );
  if (!this.password) {
    console.log("[User.matchPassword] User has no stored password.");
    return false; // User signed up with Google or password field is missing
  }
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("[User.matchPassword] bcrypt.compare error:", error);
    return false; // Or throw error to be caught by asyncHandler
  }
};

// ... (module.exports) ...
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new) AND if it actually exists
  if (!this.isModified("password") || !this.password) {
    // Check !this.password
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Pass error to next middleware
  }
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    // If the user has no password (e.g., signed up via Google)
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};
// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
