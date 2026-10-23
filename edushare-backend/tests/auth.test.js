const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { getAuthConfig } = require('../src/config/auth');

const users = new Map();
const userModel = {
    async findOne({ where }) {
        return [...users.values()].find((user) => user.email === where.email) || null;
    },
    scope() {
        return this;
    },
    async findByPk(id) {
        return users.get(id) || null;
    },
    async create(attributes) {
        const user = { id: `user-${users.size + 1}`, ...attributes };
        users.set(user.id, user);
        return user;
    }
};
const sequelize = { async authenticate() {} };
const authConfig = getAuthConfig({
    JWT_SECRET: 'test-secret-that-is-long-enough-for-auth-tests',
    JWT_EXPIRES_IN: '7d',
    COOKIE_NAME: 'edushare_test_session',
    BCRYPT_ROUNDS: '10',
    NODE_ENV: 'test'
});
const app = createApp({ sequelize, userModel, authConfig });
const email = `test-${Date.now()}@example.com`;

test('registers an account, restores its session, rejects duplicate email, and logs out', async () => {
    const agent = request.agent(app);

    const registration = await agent
        .post('/api/auth/register')
        .send({ displayName: 'EduShare User', email: email.toUpperCase(), password: 'correct-horse-42' });

    assert.equal(registration.status, 201);
    assert.deepEqual(registration.body.user, {
        id: registration.body.user.id,
        displayName: 'EduShare User',
        email
    });
    assert.ok(registration.headers['set-cookie'][0].includes('HttpOnly'));
    assert.equal(JSON.stringify(registration.body).includes('password'), false);
    assert.notEqual(users.get(registration.body.user.id).passwordHash, 'correct-horse-42');

    const currentSession = await agent.get('/api/auth/me');
    assert.equal(currentSession.status, 200);
    assert.equal(currentSession.body.user.email, email);

    const duplicate = await agent
        .post('/api/auth/register')
        .send({ displayName: 'Another User', email, password: 'correct-horse-42' });
    assert.equal(duplicate.status, 409);

    const logout = await agent.post('/api/auth/logout');
    assert.equal(logout.status, 204);
    assert.equal((await agent.get('/api/auth/me')).status, 401);

    const login = await agent
        .post('/api/auth/login')
        .send({ email, password: 'correct-horse-42' });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.email, email);
    assert.equal((await agent.get('/api/auth/me')).status, 200);
});

test('rejects invalid registration and incorrect login without creating a session', async () => {
    const invalidRegistration = await request(app)
        .post('/api/auth/register')
        .send({ displayName: 'A', email: 'invalid', password: 'short' });
    assert.equal(invalidRegistration.status, 400);

    const invalidLogin = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'incorrect-password' });
    assert.equal(invalidLogin.status, 401);
    assert.equal(invalidLogin.headers['set-cookie'], undefined);
});
