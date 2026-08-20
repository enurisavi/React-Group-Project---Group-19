const express = require('express');
const router = express.Router();
const { getBoards, createBoard } = require('../controllers/boardController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBoards).post(protect, createBoard);

module.exports = router;