require('dotenv').config();

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

jest.setTimeout(30000);

let mockToken = '';

describe('Board API Tests', () => {
  beforeAll(async () => {
    const testEmail = `board_user_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    let authRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Board Test User',
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

  it('should retrieve all boards for an authenticated user', async () => {
    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${mockToken}`);


    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should create a new board with default columns', async () => {
    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'New Sprint Board',
        columns: ['TODO', 'DOING', 'DONE'],
      });

      
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('_id');
  });

  it('should reject unauthenticated board requests', async () => {
    const res = await request(app).get('/api/boards');
    expect(res.statusCode).toEqual(401);
  });
});