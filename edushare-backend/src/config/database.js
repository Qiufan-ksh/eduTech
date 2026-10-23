const { Sequelize } = require('sequelize');

function createSequelize(databaseUrl = process.env.DATABASE_URL) {
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required.');
    }

    return new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.NODE_ENV === 'production'
            ? { ssl: { require: true, rejectUnauthorized: true } }
            : {}
    });
}

module.exports = { createSequelize };
