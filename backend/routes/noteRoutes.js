// routes/noteRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");

// All routes below will be protected
router.use(protect);
// GET /api/notes - Get all notes for user, optionally filtered by search term
router.route('/')
  .get(protect, getNotes) // Modify getNotes controller
  .post(protect, createNote);
router.route("/").get(getNotes).post(createNote);

router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;
