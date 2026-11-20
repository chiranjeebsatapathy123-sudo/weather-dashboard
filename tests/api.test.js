const test = require('node:test');
const { after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../api/index');

// Cross-platform test client: on Windows sandbox, uses named pipes to avoid loopback TCP restrictions
function createTestClient(expressApp) {
    if (process.platform !== 'win32') {
        const supertest = require('supertest');
        return supertest(expressApp);
    }

    const pipeName = `\\\\.\\pipe\\weather-test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    let server = null;

    const ensureServer = () => new Promise((resolve) => {
        if (server) return resolve(server);
        server = http.createServer(expressApp).listen(pipeName, () => {
            server.unref();
            resolve(server);
        });
    });

    const send = (method, path, body = null, headers = {}) => {
        return new Promise(async (resolve, reject) => {
            try {
                await ensureServer();
                const req = http.request({
                    socketPath: pipeName,
                    path,
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    }
                }, (res) => {
                    let raw = '';
                    res.on('data', chunk => raw += chunk);
                    res.on('end', () => {
                        let parsed = raw;
                        try { parsed = JSON.parse(raw); } catch (e) {}
                        resolve({
                            status: res.statusCode,
                            statusCode: res.statusCode,
                            body: parsed,
                            headers: res.headers
                        });
                    });
                });
                req.on('error', reject);
                if (body !== null && body !== undefined) {
                    req.write(typeof body === 'string' ? body : JSON.stringify(body));
                }
                req.end();
            } catch (err) {
                reject(err);
            }
        });
    };

    const client = {
        get: (path, headers = {}) => {
            let requestHeaders = { ...headers };
            const chain = {
                set: (k, v) => {
                    requestHeaders[k] = v;
                    return chain;
                },
                then: (resolve, reject) => send('GET', path, null, requestHeaders).then(resolve, reject)
            };
            return chain;
        },
        post: (path, headers = {}) => {
            let requestHeaders = { ...headers };
            const chain = {
                set: (k, v) => {
                    requestHeaders[k] = v;
                    return chain;
                },
                send: (body) => send('POST', path, body, requestHeaders),
                then: (resolve, reject) => send('POST', path, null, requestHeaders).then(resolve, reject)
            };
            return chain;
        },
        delete: (path, headers = {}) => {
            let requestHeaders = { ...headers };
            const chain = {
                set: (k, v) => {
                    requestHeaders[k] = v;
                    return chain;
                },
                then: (resolve, reject) => send('DELETE', path, null, requestHeaders).then(resolve, reject)
            };
            return chain;
        },
        close: () => {
            if (server) {
                server.close();
                server = null;
            }
        }
    };

    return client;
}

const client = createTestClient(app);

test('API V1 Health Check', async (t) => {
    await t.test('GET /api/v1/health should return 200 OK with standard format', async () => {
        const res = await client.get('/api/v1/health');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.status, 'ok');
        assert.strictEqual(res.body.data.service, 'weather-intelligence-api');
    });
});

test('API V1 Weather Validation', async (t) => {
    await t.test('GET /api/v1/weather/current without city should return 400', async () => {
        const res = await client.get('/api/v1/weather/current');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('GET /api/v1/weather/current with overly long city name should return 400', async () => {
        const longName = 'A'.repeat(101);
        const res = await client.get(`/api/v1/weather/current?city=${longName}`);
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });
});

test('API V1 AI Assistant', async (t) => {
    await t.test('POST /api/v1/ai without payload should return 400', async () => {
        const res = await client.post('/api/v1/ai/chat').send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });
});

test('API V1 Composite Validation', async (t) => {
    await t.test('GET /api/v1/composite/dashboard without city should return 400', async () => {
        const res = await client.get('/api/v1/composite/dashboard');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });
});

test('API V1 Insights and Risk Validation', async (t) => {
    await t.test('GET /api/v1/insights without city should return 400', async () => {
        const res = await client.get('/api/v1/insights');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('GET /api/v1/risk/dashboard without city should return 400', async () => {
        const res = await client.get('/api/v1/risk/dashboard');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('GET /api/v1/history/weather without city should return 400', async () => {
        const res = await client.get('/api/v1/history/weather');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('GET /api/v1/forecast without city should return 400', async () => {
        const res = await client.get('/api/v1/forecast');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('GET /api/v1/alerts without city should return 400', async () => {
        const res = await client.get('/api/v1/alerts');
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('POST /api/v1/locations/compare with invalid body should return 400', async () => {
        const res = await client.post('/api/v1/locations/compare').send({ cities: ['SingleCity'] });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'INVALID_INPUT');
    });

    await t.test('GET /api/v1/favorites without auth should return 401', async () => {
        const res = await client.get('/api/v1/favorites');
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    });
});

test('API V1 User State and Locations Lifecycle', async (t) => {
    const testUserId = '11111111-2222-3333-4444-555555555555';

    await t.test('POST /api/v1/favorites with auth should add favorite city', async () => {
        const res = await client.post('/api/v1/favorites')
            .set('x-user-id', testUserId)
            .send({ city: 'Sydney' });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.city, 'Sydney');
    });

    await t.test('GET /api/v1/favorites with auth should return user favorites', async () => {
        const res = await client.get('/api/v1/favorites')
            .set('x-user-id', testUserId);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert(Array.isArray(res.body.data));
        assert(res.body.data.some(f => f.city === 'Sydney'));
    });

    await t.test('POST /api/v1/favorites duplicate should return 400 ALREADY_EXISTS', async () => {
        const res = await client.post('/api/v1/favorites')
            .set('x-user-id', testUserId)
            .send({ city: 'Sydney' });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.code, 'ALREADY_EXISTS');
    });

    await t.test('GET /api/v1/locations should return list of saved locations', async () => {
        const res = await client.get('/api/v1/locations');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert(Array.isArray(res.body.data));
    });

    await t.test('DELETE /api/v1/favorites/:city with auth should remove favorite', async () => {
        const res = await client.delete('/api/v1/favorites/Sydney')
            .set('x-user-id', testUserId);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
    });

    await t.test('GET /api/v1/history with auth should return search history', async () => {
        const res = await client.get('/api/v1/history')
            .set('x-user-id', testUserId);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert(Array.isArray(res.body.data));
    });
});

after(() => {
    client.close();
});
