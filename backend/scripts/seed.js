const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany({});
    await Board.deleteMany({});
    await Task.deleteMany({});

    const createdUsers = await User.insertMany([
      { username: 'lead_dev', email: 'lead@example.com', password: 'password123' },
      { username: 'team_member', email: 'member@example.com', password: 'password123' }
    ]);

    const mainBoard = await Board.create({
      title: 'CollabBoard Sprint 1',
      owner: createdUsers[0]._id
    });

    await Task.insertMany([
      { title: 'Setup MongoDB', status: 'Done', boardId: mainBoard._id, assignedTo: createdUsers[0]._id },
      { title: 'Refactor Controllers', status: 'Doing', boardId: mainBoard._id, assignedTo: createdUsers[1]._id },
      { title: 'Test Local Storage Offline Support', status: 'To Do', boardId: mainBoard._id }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();