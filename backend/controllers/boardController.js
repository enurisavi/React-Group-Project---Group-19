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

module.exports = {
  getBoards,
  createBoard,
};