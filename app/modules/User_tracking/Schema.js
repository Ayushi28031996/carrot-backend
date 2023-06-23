const { DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../database');
const { userSchema } = require('../User/Schema.js');

// User tracking Schema Start
let userTrackingSchema = sequelizeConnection.define('userTracking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      key: 'id',
      model: userSchema,
    },
  },
  lat: { type: DataTypes.DOUBLE },
  long: { type: DataTypes.DOUBLE },

});
// User tracking Schema End
module.exports = {
  userTrackingSchema
};
