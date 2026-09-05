require('dotenv').config();

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

jest.setTimeout(30000);

let mockToken = '';

describe('Task API Tests', () => {
  let createdTaskId = '';

 beforeAll(async () => {
    const testEmail = `task_user_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    
    let authRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Task Test User',
        email: testEmail,
        password: 'password123',
      });

    if (!authRes.body.token && !authRes.body.accessToken) {
      authRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'password123',
        });
    }

    mockToken = authRes.body.token || authRes.body.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new task under a specific column/status', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Integration Test Task',
        assignee: 'Sam Patel',
        dueDate: '2026-09-01',
        status: 'TODO',
      });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Integration Test Task');

    createdTaskId = res.body._id;
  });

  it('should return HTTP 400 when creating a task with missing title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: '',
        assignee: 'Sam Patel',
      });

    expect(res.statusCode).toEqual(400);
  });

  it('should mutate task status from TODO to DOING', async () => {
    if (!createdTaskId) return;

    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        status: 'DOING',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('DOING');
  });

  it('should reject unauthenticated task requests', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(401);
  });
});