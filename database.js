/****************************
 POSTGRESQL SEQUELIZE CONNECTION
 ****************************/

const { Sequelize } = require('sequelize');
const sequelizeConnection = new Sequelize(process.env.DB_URL);
const databaseConnection = async () => {
    
  sequelizeConnection
    .authenticate()
    .then(() => {
      console.log('Connection to Database has been established successfully :)');
    })
    .catch((error) => {
      console.error('Unable to connect to the database :( \n', error);
    });
    await sequelizeConnection.sync();
    return sequelizeConnection;

}
module.exports = { sequelizeConnection, databaseConnection };
