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

// Update a task with Optimistic Concurrency Control
const updateTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const { __v, ...updates } = req.body;

    // Find the task belonging to the authenticated user
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Default client version to 0 if undefined, or compare directly
    const clientVersion = typeof __v === 'number' ? __v : (task.__v || 0);

    // Conflict detection: if version on server does not match version from client
    if (task.__v !== undefined && task.__v !== clientVersion) {
      return res.status(409).json({
        message: 'Conflict: task has been modified by another session',
        serverTask: task,
        currentVersion: task.__v,
      });
    }

    // Perform atomic update and increment version
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        __v: task.__v,
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

    if (!updatedTask) {
      return res.status(409).json({
        message: 'Conflict: task was updated concurrently',
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

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