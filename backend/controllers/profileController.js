const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * Helper to safely resolve Task model without throwing if not yet registered in mongoose
 */
const getTaskModel = () => {
  try {
    return require('../models/Task');
  } catch (err) {
    if (mongoose.models.Task) {
      return mongoose.models.Task;
    }
    return null;
  }
};

/**
 * Normalizes status strings for consistent analytics aggregations
 */
const normalizeStatus = (status) => {
  if (!status) return '';
  return String(status).toUpperCase().replace(/[\s-_]/g, '');
};

/**
 * @desc    Get current authenticated user's profile
 * @route   GET /api/profiles/me
 * @access  Private
 */
const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email');

    // Concurrency-safe atomic find-or-create using $setOnInsert
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      {
        $setOnInsert: {
          user: req.user.id,
          displayName: user?.name || '',
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).populate('user', 'name email');

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve user profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Create or update user profile
 * @route   PUT /api/profiles/me
 * @access  Private
 */
const updateCurrentUserProfile = async (req, res) => {
  try {
    const {
      displayName,
      avatar,
      jobTitle,
      department,
      bio,
      phoneNumber,
      skills,
      socialLinks,
      preferences,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;

    if (displayName !== undefined) profileFields.displayName = String(displayName).trim();
    if (avatar !== undefined) profileFields.avatar = String(avatar).trim();
    if (jobTitle !== undefined) profileFields.jobTitle = String(jobTitle).trim();
    if (department !== undefined) profileFields.department = String(department).trim();
    if (bio !== undefined) profileFields.bio = String(bio).trim();
    if (phoneNumber !== undefined) profileFields.phoneNumber = String(phoneNumber).trim();

    // Skills array formatting
    if (skills !== undefined) {
      profileFields.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    // Social Links nested object
    if (socialLinks && typeof socialLinks === 'object') {
      profileFields.socialLinks = {
        github: String(socialLinks.github || '').trim(),
        linkedin: String(socialLinks.linkedin || '').trim(),
        twitter: String(socialLinks.twitter || '').trim(),
      };
    }

    // Preferences nested object
    if (preferences && typeof preferences === 'object') {
      profileFields.preferences = {
        theme: ['light', 'dark', 'system'].includes(preferences.theme)
          ? preferences.theme
          : 'light',
        notificationsEnabled: preferences.notificationsEnabled ?? true,
      };
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email');

    return res.status(200).json(updatedProfile);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all team profiles
 * @route   GET /api/profiles
 * @access  Private
 */
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch team profiles',
      error: error.message,
    });
  }
};

/**
 * @desc    Get profile by user ID
 * @route   GET /api/profiles/user/:userId
 * @access  Private
 */
const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format before database query
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const profile = await Profile.findOne({ user: userId }).populate(
      'user',
      'name email'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found for this user' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving profile by user ID',
      error: error.message,
    });
  }
};

/**
 * @desc    Get personal user analytics & performance statistics
 * @route   GET /api/profiles/analytics/me
 * @access  Private
 */
const getUserAnalytics = async (req, res) => {
  try {
    const Task = getTaskModel();
    const user = await User.findById(req.user.id).select('name email');

    let totalTasks = 0;
    let todoCount = 0;
    let doingCount = 0;
    let doneCount = 0;

    if (Task) {
      // Find tasks owned by user or assigned to user's name
      const userTasks = await Task.find({
        $or: [{ user: req.user.id }, { assignee: user?.name }],
      });

      totalTasks = userTasks.length;
      for (const t of userTasks) {
        const norm = normalizeStatus(t.status);
        if (norm === 'TODO') todoCount += 1;
        else if (norm === 'DOING' || norm === 'INPROGRESS') doingCount += 1;
        else if (norm === 'DONE' || norm === 'COMPLETED') doneCount += 1;
      }
    }

    const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    return res.status(200).json({
      userId: req.user.id,
      userName: user?.name,
      metrics: {
        totalTasks,
        todoCount,
        doingCount,
        doneCount,
        completionRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate user analytics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get overall team analytics and workload breakdown
 * @route   GET /api/profiles/analytics/team
 * @access  Private
 */
const getTeamAnalytics = async (req, res) => {
  try {
    const Task = getTaskModel();
    const profiles = await Profile.find().populate('user', 'name email');

    let totalTasks = 0;
    let totalDone = 0;
    let totalDoing = 0;
    let totalTodo = 0;
    let workloadBreakdown = [];

    if (Task) {
      const allTasks = await Task.find();
      totalTasks = allTasks.length;

      // Group tasks by assignee
      const countsByAssignee = {};
      allTasks.forEach((task) => {
        const name = task.assignee || 'Unassigned';
        if (!countsByAssignee[name]) {
          countsByAssignee[name] = { total: 0, done: 0, doing: 0, todo: 0 };
        }
        countsByAssignee[name].total += 1;

        const norm = normalizeStatus(task.status);
        if (norm === 'DONE' || norm === 'COMPLETED') {
          totalDone += 1;
          countsByAssignee[name].done += 1;
        } else if (norm === 'DOING' || norm === 'INPROGRESS') {
          totalDoing += 1;
          countsByAssignee[name].doing += 1;
        } else if (norm === 'TODO') {
          totalTodo += 1;
          countsByAssignee[name].todo += 1;
        }
      });

      workloadBreakdown = Object.keys(countsByAssignee).map((assignee) => ({
        assignee,
        ...countsByAssignee[assignee],
        completionRate:
          countsByAssignee[assignee].total > 0
            ? Math.round(
                (countsByAssignee[assignee].done / countsByAssignee[assignee].total) * 100
              )
            : 0,
      }));
    }

    const teamVelocity = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

    return res.status(200).json({
      teamSummary: {
        totalMembers: profiles.length,
        totalTasks,
        totalDone,
        totalDoing,
        totalTodo,
        teamVelocity,
      },
      workloadBreakdown,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate team analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAllProfiles,
  getProfileByUserId,
  getUserAnalytics,
  getTeamAnalytics,
};
