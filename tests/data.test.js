const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { parse } = require('csv-parse/sync');
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
        const user = { id: `data-user-${users.size + 1}`, ...attributes };
        users.set(user.id, user);
        return user;
    }
};
const sequelize = { async authenticate() {} };
const authConfig = getAuthConfig({
    JWT_SECRET: 'test-secret-that-is-long-enough-for-auth-tests',
    JWT_EXPIRES_IN: '7d',
    COOKIE_NAME: 'edushare_data_test_session',
    BCRYPT_ROUNDS: '10',
    NODE_ENV: 'test'
});
const app = createApp({ sequelize, userModel, authConfig });

test('preprocesses a survey CSV for an authenticated user and rejects invalid uploads', async () => {
    const csv = [
        'Dấu thời gian,Câu 1. Bạn đang học năm thứ mấy?,Câu 3. Bạn đang học ngành nào?,Câu 6. Trung bình mỗi học kỳ bạn mua bao nhiêu sách/tài liệu?,Câu 7. Bạn thường tìm những loại tài liệu nào?,Câu 11. Bạn đánh giá mức độ khó khăn khi tìm được tài liệu phù hợp với nhu cầu học tập của mình như thế nào?,"Câu 16. Nếu đã từng bán/trao đổi, bạn thường thực hiện thông qua đâu?"',
        '2026-01-01,Năm 1,Kĩ thuật điện,1 - 2,Giáo trình; Tài liệu tham khảo,Trung bình,',
        '2026-01-02,,Kỹ thuật cơ khí,Không mua,Sách tham khảo; Giáo trình,,Facebook'
    ].join('\n');

    const unauthorized = await request(app)
        .post('/api/data/preprocess')
        .attach('file', Buffer.from(csv), 'survey.csv');
    assert.equal(unauthorized.status, 401);

    const agent = request.agent(app);
    const email = `data-${Date.now()}@example.com`;
    const registration = await agent
        .post('/api/auth/register')
        .send({ displayName: 'Data User', email, password: 'correct-horse-42' });
    assert.equal(registration.status, 201);

    const missingFile = await agent.post('/api/data/preprocess');
    assert.equal(missingFile.status, 400);

    const invalidCsv = await agent
        .post('/api/data/preprocess')
        .attach('file', Buffer.from('unrelated,columns\n1,2'), 'other.csv');
    assert.equal(invalidCsv.status, 400);

    const response = await agent
        .post('/api/data/preprocess')
        .attach('file', Buffer.from(csv), 'survey.csv');
    assert.equal(response.status, 200);
    assert.match(response.headers['content-type'], /text\/csv/u);
    assert.match(response.headers['content-disposition'], /survey-cleaned\.csv/u);

    const cleanedCsv = response.text || response.body.toString('utf8');
    const rows = parse(cleanedCsv, { bom: true, columns: true });
    assert.equal(rows.length, 2);
    assert.equal(Object.hasOwn(rows[0], 'Dấu thời gian'), false);
    assert.equal(rows[0].Nganh_Hoc, 'Kỹ thuật điện');
    assert.equal(rows[1].Nam_Hoc, 'Năm 1');
    assert.equal(rows[0].Kenh_Ban_Trao_Doi, 'Không áp dụng');
    assert.equal(rows[0].Nam_Hoc_Fix, '1');
    assert.equal(rows[1].So_Luong_Mua_Fix, '0');
    assert.equal(rows[0]['Loai_Tai_Lieu_Tim_Kiem_Giáo trình'], '1');
    assert.equal(rows[1]['Loai_Tai_Lieu_Tim_Kiem_Sách tham khảo'], '1');
});
