const mongoose = require('mongoose');
const Task = require('../models/Task');

// Get all tasks belonging to the logged-in user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: 'Server error retrieving tasks',
      error: error.message,
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, assignee, dueDate, status } = req.body;

    if (!title || !assignee || !dueDate) {
      return res.status(400).json({
        message: 'Please provide title, assignee, and dueDate',
      });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      assignee,
      dueDate,
      status: status || 'TODO',
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: 'Server error creating task',
      error: error.message,
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    // Validate MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid task ID',
      });
    }

    // The client must send the version it last received
    const { __v, ...updates } = req.body;

    if (__v === undefined) {
      return res.status(400).json({
        message: 'Task version (__v) is required for update',
      });
    }

    // Find the task and make sure it belongs to the logged-in user
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    // Check whether the task has changed since the client last received it
    if (task.__v !== __v) {
      return res.status(409).json({
        message: 'Conflict: task has been modified by another user',
        currentVersion: task.__v,
      });
    }

    // Update only if the version still matches
    const updatedTask = await Task.findOneAndUpdate(
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

    // If another update happened between our check and update,
    // no document will be updated.
    if (!updatedTask) {
      return res.status(409).json({
        message: 'Conflict: task was modified by another user',
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: 'Server error updating task',
      error: error.message,
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    // Validate MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    // Make sure the logged-in user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: 'User not authorized to delete this task',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      id: req.params.id,
      message: 'Task removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error deleting task',
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};