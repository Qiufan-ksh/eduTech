const { DataTypes } = require('sequelize');

function defineUserModel(sequelize) {
    return sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        displayName: {
            type: DataTypes.STRING(80),
            allowNull: false,
            field: 'display_name'
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        passwordHash: {
            type: DataTypes.STRING(60),
            allowNull: false,
            field: 'password_hash'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        scopes: {
            withPassword: { attributes: { include: ['passwordHash'] } }
        }
    });
}

module.exports = { defineUserModel };
