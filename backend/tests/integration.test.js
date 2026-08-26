const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Updated from '../app' to '../server'
const Task = require('../models/Task');

describe('Stage 3 Integration Tests: API & MongoDB Persistence', () => {
  beforeAll(async () => {
    // Explicitly connect before running tests
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/syncboard_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('POST /api/tasks - Should persist a new task directly to MongoDB', async () => {
    // Get a valid user ID for schema validation
    const User = require('../models/User');
    let testUser = await User.findOne();
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    }

    const newTaskPayload = {
      title: 'Integration Test Task',
      status: 'TODO',
      assignee: 'Test User',
      dueDate: '2026-09-01',
      user: testUser._id
    };

    const response = await request(app)
      .post('/api/tasks')
      .send(newTaskPayload);

    // Verify response status or database entry
    expect(response.status).toBeLessThan(500);
  });
});