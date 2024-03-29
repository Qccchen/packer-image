const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = new Sequelize(
    process.env.DB_DATABASE || 'test_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
    } 
);

const Users = sequelize.define('users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            is: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 10))
        },
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verification_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    verification_token: {
        type: DataTypes.UUID,
        allowNull: true,
    }
});

sequelize.sync();

module.exports = { Users, sequelize };