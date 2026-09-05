const mongoose = require('mongoose');
const Board = require('../models/Board');

// @desc    Get user's boards
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res) => {
  try {
    // මේකෙන් කරන්නේ ලොග් වෙලා ඉන්න User ට අදාළ Board එක හොයලා දෙන එකයි
    const boards = await Board.find({ user: req.user.id });
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      name: req.body.name || 'My SyncBoard',
      description: req.body.description,
      user: req.user.id,
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a board with optimistic concurrency checking
// @route   PUT /api/boards/:id
// @access  Private
const updateBoard = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid board ID',
      });
    }

    // The client must send the version it last received
    const { __v, ...updates } = req.body;

    if (__v === undefined) {
      return res.status(400).json({
        message: 'Board version (__v) is required for update',
      });
    }

    // Make sure the board belongs to the logged-in user
    const board = await Board.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!board) {
      return res.status(404).json({
        message: 'Board not found',
      });
    }

    // Detect a stale version
    if (board.__v !== __v) {
      return res.status(409).json({
        message: 'Conflict: board has been modified by another user',
        currentVersion: board.__v,
      });
    }

    // Update only when the supplied version still matches
    const updatedBoard = await Board.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        __v,
      },
      {
        ...updates,
        $inc: { __v: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBoard) {
      return res.status(409).json({
        message: 'Conflict: board was modified by another user',
      });
    }

    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({
      message: 'Server error updating board',
      error: error.message,
    });
  }
};

// @desc    Delete a board
// @route   DELETE /api/boards/:id
// @access  Private
const deleteBoard = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid board ID',
      });
    }

    const result = await Board.deleteOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Board not found',
      });
    }

    res.status(200).json({
      id: req.params.id,
      message: 'Board removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error deleting board',
      error: error.message,
    });
  }
};

module.exports = {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
};