const express = require('express');
const cookieParser = require('cookie-parser');
const { getAuthConfig } = require('./config/auth');
const { initializeModels } = require('./models');
const { createAuthRouter } = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/errorHandler.middleware');

function createApp({ sequelize, userModel, frontendFile = process.env.FRONTEND_FILE, authConfig = getAuthConfig() }) {
    if (!sequelize) {
        throw new Error('A Sequelize instance is required.');
    }

    const User = userModel || initializeModels(sequelize).User;
    const app = express();

    app.disable('x-powered-by');
    app.use(express.json({ limit: '10kb' }));
    app.use(cookieParser());
    app.get('/api/health', async (req, res, next) => {
        try {
            await sequelize.authenticate();
            return res.json({ status: 'ok' });
        } catch (error) {
            return next(error);
        }
    });
    app.use('/api/auth', createAuthRouter({ User, authConfig }));

    if (frontendFile) {
        app.get('/', (req, res, next) => res.sendFile(frontendFile, (error) => {
            if (error) next(error);
        }));
    } else {
        app.get('/', (req, res) => res.status(503).json({ error: 'FRONTEND_FILE is not configured.' }));
    }

    app.use((req, res) => res.status(404).json({ error: 'Không tìm thấy đường dẫn yêu cầu.' }));
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
