const express = require('express');
const router = express.Router();
const {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAllProfiles,
  getProfileByUserId,
  getUserAnalytics,
  getTeamAnalytics,
} = require('../controllers/profileController');

const { protect } = require('../middleware/authMiddleware');

// User profile routes
router
  .route('/me')
  .get(protect, getCurrentUserProfile)
  .put(protect, updateCurrentUserProfile);

// Root profile routes
router
  .route('/')
  .get(protect, getAllProfiles)
  .post(protect, updateCurrentUserProfile);

// Analytics routes
router.get('/analytics/me', protect, getUserAnalytics);
router.get('/analytics/team', protect, getTeamAnalytics);

// User-specific profile route
router.get('/user/:userId', protect, getProfileByUserId);

module.exports = router;
