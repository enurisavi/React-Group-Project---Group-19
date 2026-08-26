const mongoose = require('mongoose');

const boardSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a board name'],
      default: 'My SyncBoard'
    },
    description: {
      type: String,
    },
    columns: {
      type: [String],
      default: ['TODO', 'DOING', 'DONE']
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Board', boardSchema);