require('dotenv').config();
const express = require('express');
const app = express();
const database = require('./database')
const sequelize = require('sequelize');
const UserTracking = require('./app/modules/User_tracking/Schema.js')
const User = require('./app/modules/User/Schema.js')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema')
async function dbfunction() {
  await database.databaseConnection()
}
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: usersList } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, usersList, totalPages, currentPage };
};

dbfunction()
async function userFind() {
  // const { page, size } = {1 , 10}
  const page = 1
  const size = 10
  const offset = (page - 1) * size;
  const limit = size;
  let count = await User.userSchema.findAndCountAll({ limit, offset, raw: true })
  const response = getPagingData(count, page, limit);
  return response.usersList;
}
const schema = buildSchema(`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    gender: String!
  }

  type Query {
    
    users: [User!]!,
   
  }
`);

const root = {

  users: async () => await userFind(),

};

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

app.get('/userList', async (req, res) => {
  try {
    const { page, size } = req.query;
    const offset = (page - 1) * size;
    const limit = size;
    let count = await User.userSchema.findAndCountAll({ limit, offset })
    const response = getPagingData(count, page, limit);
    res.send(response);
  }
  catch (e) {
    console.log(e);
    res.send(e)
  }

});

app.get('/geolocation', async (req, res) => {
  const lat = 28.62;
  const long = 79.82;
  const distance = 1;
  const haversine = `(
        6371 * acos(
            cos(radians(${lat}))
            * cos(radians(lat))
            * cos(radians(long) - radians(${long}))
            + sin(radians(${lat})) * sin(radians(lat))
        )
    )`;

  const users = await UserTracking.userTrackingSchema.findAll({
    attributes: [
      'userId',
      [sequelize.literal(haversine), 'radius'],
      'lat',
      'long'
    ],
    limit: 10
  });
  let finalRes = []
  for (var i = 0; i < users.length; i++) {
    let m = users[i]
    let user = await User.userSchema.findOne({ where: { id: m.userId } })
    finalRes.push({ 'first_name': user.first_name, 'last_name': user.last_name, 'gender': user.gender, location: { lat: m.lat, long: m.long } })
  }

  res.send(finalRes)


})
app.listen(process.env.PORT, () => {
  console.log(`Now listening on port ${process.env.PORT}`);
});

