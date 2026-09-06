const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    assignee: {
      type: String,
      required: [true, 'Please add an assignee name'],
      trim: true,
    },
    dueDate: {
      type: String,
      required: [true, 'Please add a due date'],
    },
    status: {
      type: String,
      enum: ['TODO', 'DOING', 'DONE'],
      default: 'TODO',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);