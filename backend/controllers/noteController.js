// controllers/noteController.js
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");

// @desc    Get all notes for the logged-in user
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const { search } = req.query; // Get search term from query params
  let query = { user: req.user._id };

  if (search && typeof search === 'string' && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i'); // 'i' for case-insensitive
    query = {
      ...query,
      $or: [ // Search in title, content, or tags
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex } // This searches if any tag in the array matches
      ]
    };
  }

  const notes = await Note.find(query).sort({ updatedAt: -1 });
  res.status(200).json(notes);

});


// ...
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  // Check if the note belongs to the logged-in user
  if (note.user.toString() !== req.user._id.toString()) {
    res.status(401); // Unauthorized
    throw new Error("User not authorized to view this note");
  }

  res.status(200).json(note);
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Please add a title and content");
  }

  const note = await Note.create({
    user: req.user._id, // Associate note with the logged-in user
    title,
    content,
    tags: tags || [],
  });

  res.status(201).json(note);
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  // Check if the note belongs to the logged-in user
  if (note.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized to update this note");
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the modified document
    runValidators: true, // Run schema validators on update
  });

  res.status(200).json(updatedNote);
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  // Check if the note belongs to the logged-in user
  if (note.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized to delete this note");
  }

  await note.deleteOne(); // Mongoose v6+
  // For older Mongoose: await note.remove();

  res.status(200).json({ id: req.params.id, message: "Note removed" });
});

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
