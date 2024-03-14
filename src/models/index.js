const EmailCode = require("./EmailCode");
const User = require("./User");

//Se hace relacion uno a uno, es decir, se relaciona un codigo ocn un usuario

EmailCode.belongsTo(User);
User.hasOne(EmailCode);