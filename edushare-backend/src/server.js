require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { createSequelize } = require('./config/database');
const { getAuthConfig } = require('./config/auth');
const { initializeModels } = require('./models');
const { createApp } = require('./app');

async function start() {
    const authConfig = getAuthConfig();
    const frontendFile = process.env.FRONTEND_FILE;
    if (!frontendFile) {
        throw new Error('FRONTEND_FILE must point to the EduShare HTML file.');
    }

    const resolvedFrontendFile = path.resolve(frontendFile);
    if (!fs.existsSync(resolvedFrontendFile) || !fs.statSync(resolvedFrontendFile).isFile()) {
        throw new Error(`FRONTEND_FILE does not exist or is not a file: ${resolvedFrontendFile}`);
    }

    const sequelize = createSequelize();
    try {
        await sequelize.authenticate();
        await initializeModels(sequelize).User.sync();
        const app = createApp({ sequelize, frontendFile: resolvedFrontendFile, authConfig });
        const port = Number.parseInt(process.env.PORT || '3000', 10);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error('PORT must be an integer between 1 and 65535.');
        }

        app.listen(port, () => {
            console.log(`EduShare is running at http://localhost:${port}`);
        });
    } catch (error) {
        await sequelize.close();
        throw error;
    }
}

start().catch((error) => {
    console.error('Unable to start EduShare:', error.message);
    process.exitCode = 1;
});
