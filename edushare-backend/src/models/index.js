const { defineUserModel } = require('./user.model');

function initializeModels(sequelize) {
    return { User: defineUserModel(sequelize) };
}

module.exports = { initializeModels };
