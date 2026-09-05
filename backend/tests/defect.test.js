const request = require('supertest');
const app = require('../server.js');

describe('Role 6: QA Defect Test - 404 Handler', () => {
  it('should return 404 status and JSON error message for unknown routes', async () => {
    const res = await request(app).get('/api/invalid-route-test');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Resource Not Found');
  });
});