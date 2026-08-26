const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Task = require('../models/Task');

describe('Stage 3 Integration Tests: API & MongoDB Persistence', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI);
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('POST /api/tasks - Should persist a new task directly to MongoDB', async () => {
    const newTaskPayload = { title: 'Integration Test Task', status: 'To Do' };

    const response = await request(app)
      .post('/api/tasks')
      .send(newTaskPayload)
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe(newTaskPayload.title);

    const dbTask = await Task.findById(response.body._id);
    expect(dbTask).not.toBeNull();
    expect(dbTask.title).toBe(newTaskPayload.title);
  });
});