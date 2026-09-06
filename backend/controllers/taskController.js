const Task = require('../models/Task');


const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving tasks', error: error.message });
  }
};


const createTask = async (req, res) => {
  try {
    const { title, assignee, dueDate, status } = req.body;

    if (!title || !assignee || !dueDate) {
      return res.status(400).json({ message: 'Please provide title, assignee, and dueDate' });
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
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
};


const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating task', error: error.message });
  }
};


const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task', error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};