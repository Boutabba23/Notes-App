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

router.route("/").get(getNotes).post(createNote);

router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;
