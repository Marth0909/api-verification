const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const User = sequelize.define('user', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, //unique: true es para que no haya dos usuarios utilizando el mismo email (es decir, para que cada usuario tenga un correo diferente)
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
   firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
   lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.TEXT,//se utiliza TEXT porque las URL´s a veces son muy grandes, y con TEXT se puede tener un numero ilimitado de caracteres, y con tipo STRING no.
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
}

module.exports = User;