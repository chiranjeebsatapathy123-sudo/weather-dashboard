const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../api/index');

test('API V1 Health Check', async (t) => {
    await t.test('GET /api/v1/health should return 200 OK with standard format', async () => {
        const res = await request(app).get('/api/v1/health');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.status, 'ok');
        assert.strictEqual(res.body.data.service, 'weather-intelligence-api');
    });
});

test('API V1 Weather Validation', async (t) => {
    await t.test('GET /api/v1/weather/current without city should return 400', async () => {
        const res = await request(app).get('/api/v1/weather/current');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('GET /api/v1/weather/current with overly long city name should return 400', async () => {
        const longName = 'A'.repeat(101);
        const res = await request(app).get(`/api/v1/weather/current?city=${longName}`);
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });
});

test('API V1 AI Assistant', async (t) => {
    await t.test('POST /api/v1/ai without payload should return 400', async () => {
        const res = await request(app).post('/api/v1/ai/chat').send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });
});
