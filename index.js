const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://naazmulla9195_db_user:cGenvfL2O2560Vnx@cluster0.iqjz2yr.mongodb.net/notes";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// ✅ Mongoose Schema & Model
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

noteSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Note = mongoose.model("Note", noteSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Notes API 🚀");
});

// Get all notes
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching notes" });
  }
});

// Create a new note
app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newNote = new Note({ title, content });
    await newNote.save();

    res.status(201).json({
      message: "Note created successfully",
      note: newNote,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating note", error: err.message });
  }
});

// Update a note
app.put("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    note.updatedAt = Date.now();

    await note.save();
    res.json({ message: "Note updated successfully", note });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating note", error: err.message });
  }
});

// Delete a note
app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByIdAndDelete(id);

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting note", error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
