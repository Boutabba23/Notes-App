// backend/models/User.js (or .ts)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Keep if you still support email/password signup/login

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    // required: false, // Explicitly setting to false, or simply REMOVE the 'required' validator
    minlength: 6,     // Keep minlength if you still have email/password signup
    select: false,    // Good practice: don't return password by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values while still enforcing uniqueness for non-null values
  },
  // profilePicture: { // Optional
  //   type: String,
  // },
}, {
  timestamps: true,
});

// Hash password ONLY if it's provided and modified (for traditional signup)
userSchema.pre('save', async function (next) {
  // If password is not present (e.g., Google signup) OR not modified, skip hashing
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Pass error to Mongoose
  }
});

// matchPassword method is only relevant for email/password login
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) { // User signed up with Google or has no password set
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;