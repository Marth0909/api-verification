const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const EmailCode = sequelize.define('emailCode', {
    code: {
        type: DataTypes.STRING,
        allowNull: false
    }
    // userId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    // },
});

module.exports = EmailCode;