const request = require('supertest');
const app = require('../server');

describe('Auth Integration Tests', () => {

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject duplicate email addresses', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password123'
      });

    expect([400, 409]).toContain(res.statusCode);
  });

  it('should login successfully and return JWT token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

});