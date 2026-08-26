const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UserImport = require('../models/User');
const BoardImport = require('../models/Board');
const TaskImport = require('../models/Task');

const User = UserImport.default || UserImport.User || UserImport;
const Board = BoardImport.default || BoardImport.Board || BoardImport;
const Task = TaskImport.default || TaskImport.Task || TaskImport;

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/syncboard_db';

    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected for seeding at: ${mongoURI}`);

    // Clear existing collections
    await User.deleteMany({});
    await Board.deleteMany({});
    await Task.deleteMany({});

    // Create users (using .create() to trigger password hashing)
    const user1 = await User.create({
      name: 'Lead Dev',
      email: 'lead@example.com',
      password: 'password123'
    });

    const user2 = await User.create({
      name: 'Team Member',
      email: 'member@example.com',
      password: 'password123'
    });

    // Create seed Board
    const mainBoard = await Board.create({
      title: 'CollabBoard Sprint 1',
      user: user1._id,
      owner: user1._id
    });

    // Create seed Tasks matching exact Task schema enum ['TODO', 'DOING', 'DONE']
    await Task.insertMany([
      {
        title: 'Setup MongoDB',
        status: 'DONE',
        boardId: mainBoard._id,
        user: user1._id,
        assignee: user1.name,
        dueDate: '2026-09-01'
      },
      {
        title: 'Refactor Controllers',
        status: 'DOING',
        boardId: mainBoard._id,
        user: user2._id,
        assignee: user2.name,
        dueDate: '2026-09-05'
      },
      {
        title: 'Test Local Storage Offline Support',
        status: 'TODO',
        boardId: mainBoard._id,
        user: user1._id,
        assignee: user1.name,
        dueDate: '2026-09-10'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();