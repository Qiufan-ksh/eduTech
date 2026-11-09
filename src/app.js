const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');
const { getAuthConfig } = require('./config/auth');
const { initializeModels } = require('./models');
const { createAuthRouter } = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/errorHandler.middleware');

/**
 * Tạo và cấu hình ứng dụng Express
 * @param {Object} options - Các tùy chọn khởi tạo
 * @param {import('sequelize').Sequelize} options.sequelize - Instance của Sequelize (Bắt buộc)
 * @param {Object} [options.userModel] - Model User (tùy chọn)
 * @param {string} [options.frontendDir] - Đường dẫn thư mục chứa frontend static files
 * @param {string} [options.frontendFile] - Đường dẫn file HTML chính của frontend
 * @param {Object} [options.authConfig] - Cấu hình xác thực (JWT, session, v.v.)
 * @returns {import('express').Application} Express app instance
 */
function createApp({
    sequelize,
    userModel,
    frontendDir = path.join(__dirname, '../frontend'),
    frontendFile = process.env.FRONTEND_FILE || path.join(__dirname, '../frontend/index.html'),
    authConfig = getAuthConfig()
} = {}) {
    if (!sequelize) {
        throw new Error('A Sequelize instance is required.');
    }

    const User = userModel || initializeModels(sequelize).User;
    const app = express();

    // 1. Bảo mật cơ bản và Cấu hình Parser
    app.disable('x-powered-by');
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use(cookieParser());

    // 2. Health check API (Kiểm tra kết nối DB)
    app.get('/api/health', async (req, res, next) => {
        try {
            await sequelize.authenticate();
            return res.json({ status: 'ok' });
        } catch (error) {
            return next(error);
        }
    });

    // 3. Các API Routes (Ví dụ: Auth API)
    app.use('/api/auth', createAuthRouter({ User, authConfig }));

    // 4. Phục vụ Static Files cho Frontend (JS, CSS, Images,...)
    if (frontendDir) {
        app.use(express.static(frontendDir));
    }

    // 5. Route trả về trang chủ Frontend hoặc báo lỗi nếu chưa cấu hình
    if (frontendFile) {
        app.get('/', (req, res, next) => {
            res.sendFile(frontendFile, (error) => {
                if (error) {
                    // Nếu file không tồn tại hoặc lỗi đọc file, chuyển cho middleware xử lý lỗi
                    next(error);
                }
            });
        });
    } else {
        app.get('/', (req, res) => {
            res.status(503).json({ error: 'FRONTEND_FILE is not configured.' });
        });
    }

    // 6. Xử lý Route không tồn tại (404 Not Found)
    app.use((req, res, next) => {
        // Nếu request gọi vào API mà không khớp route -> trả về JSON 404
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'Không tìm thấy API yêu cầu.' });
        }
        // Các đường dẫn khác có thể để Frontend xử lý (nếu dùng SPA) hoặc trả về thông báo
        return res.status(404).json({ error: 'Không tìm thấy đường dẫn yêu cầu.' });
    });

    // 7. Middleware xử lý lỗi tập trung (Global Error Handler)
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };