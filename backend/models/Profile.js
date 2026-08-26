const mongoose = require('mongoose');

/**
 * Profile Schema - Member 4 Deliverable
 * Stores detailed user profile info, organizational metadata, and user preferences.
 */
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // Automatically creates unique index on user
    },
    displayName: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
    jobTitle: {
      type: String,
      default: 'Software Engineer',
      trim: true,
    },
    department: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    socialLinks: {
      github: { type: String, default: '', trim: true },
      linkedin: { type: String, default: '', trim: true },
      twitter: { type: String, default: '', trim: true },
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'light',
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
