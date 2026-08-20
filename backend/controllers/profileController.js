const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * Helper to safely resolve Task model without throwing if not yet registered in mongoose
 */
const getTaskModel = () => {
  try {
    return require('../models/Task');
  } catch (err) {
    if (require('mongoose').models.Task) {
      return require('mongoose').models.Task;
    }
    return null;
  }
};

/**
 * @desc    Get current authenticated user's profile
 * @route   GET /api/profiles/me
 * @access  Private
 */
const getCurrentUserProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!profile) {
      // Auto-initialize default profile for smooth user onboarding
      const user = await User.findById(req.user.id).select('name email');
      profile = await Profile.create({
        user: req.user.id,
        displayName: user?.name || '',
      });
      profile = await profile.populate('user', 'name email');
    }

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

    if (displayName !== undefined) profileFields.displayName = displayName;
    if (avatar !== undefined) profileFields.avatar = avatar;
    if (jobTitle !== undefined) profileFields.jobTitle = jobTitle;
    if (department !== undefined) profileFields.department = department;
    if (bio !== undefined) profileFields.bio = bio;
    if (phoneNumber !== undefined) profileFields.phoneNumber = phoneNumber;

    // Skills array formatting
    if (skills !== undefined) {
      profileFields.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Social Links nested object
    if (socialLinks) {
      profileFields.socialLinks = {
        github: socialLinks.github || '',
        linkedin: socialLinks.linkedin || '',
        twitter: socialLinks.twitter || '',
      };
    }

    // Preferences nested object
    if (preferences) {
      profileFields.preferences = {
        theme: preferences.theme || 'light',
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
    const profile = await Profile.findOne({ user: req.params.userId }).populate(
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
      todoCount = userTasks.filter((t) => t.status === 'TODO').length;
      doingCount = userTasks.filter((t) => t.status === 'DOING').length;
      doneCount = userTasks.filter((t) => t.status === 'DONE').length;
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
      totalDone = allTasks.filter((t) => t.status === 'DONE').length;
      totalDoing = allTasks.filter((t) => t.status === 'DOING').length;
      totalTodo = allTasks.filter((t) => t.status === 'TODO').length;

      // Group tasks by assignee
      const countsByAssignee = {};
      allTasks.forEach((task) => {
        const name = task.assignee || 'Unassigned';
        if (!countsByAssignee[name]) {
          countsByAssignee[name] = { total: 0, done: 0, doing: 0, todo: 0 };
        }
        countsByAssignee[name].total += 1;
        if (task.status === 'DONE') countsByAssignee[name].done += 1;
        else if (task.status === 'DOING') countsByAssignee[name].doing += 1;
        else if (task.status === 'TODO') countsByAssignee[name].todo += 1;
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
