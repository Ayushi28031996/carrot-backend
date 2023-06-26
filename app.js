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


// DB FUnction Start 
async function dbfunction() {
  await database.databaseConnection()
}
dbfunction()
// DB Function End


// User List Functions Start with pagination
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: usersList } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, usersList, totalPages, currentPage };
};
async function userFind(page,size) {
  const offset = (page - 1) * size;
  const limit = size;
  let count = await User.userSchema.findAndCountAll({ limit, offset })
  const response = getPagingData(count, page, limit);
  return response;
}
// User List Functions End with pagination


// Find users within specific geo radius start 
async function geolocation(latitude,longitude){
  const lat = latitude;
  const long = longitude;
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
  console.log(finalRes)
  return finalRes;
}
// Find users within specific geo radius End 

// Build Schema .gql Start
const schema1 = buildSchema(`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    gender: String!
    
  }

  type Query {
    totalItems : Int 
    users: [User!]!
    totalPages  : Int 
    currentPage : Int 
  }
`);
const schema = buildSchema(`
type Location{
  lat:Float!
  long:Float!
}
type User {
  first_name: String!
  last_name: String!
  gender: String!
  location: Location
}
type Query {
  findusers(radius: Int): [User!]!
}
`);
// Build Schema .gql End


// Resolvers in Graphql Start
const root = {
  totalItems : async () => (await userFind(1,10)).totalItems,
  users: async () => (await userFind(1,10)).usersList,
  totalPages : async () => (await userFind(1,10)).totalPages,
  currentPage : async () => (await userFind(1,10)).currentPage
};
const Resolvers = {
  findusers: async(radius=1)=> ( geolocation(28.62,79.82))
};
// Resolvers in Graphql End


// Graphql Start
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: Resolvers,
    graphiql: true,
  })
);
// Graphql End


// App Listen At Server Start
app.listen(process.env.PORT, () => {
  console.log(`Now listening on port ${process.env.PORT}`);
});
// App Listen At Server End

