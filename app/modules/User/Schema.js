const { DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../database');

let userSchema = sequelizeConnection.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING }

});



module.exports = {
  userSchema
};
