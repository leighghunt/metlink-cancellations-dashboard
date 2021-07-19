// server.js
// where your node app starts

// init project
const express = require('express');
var Sequelize = require('sequelize');
const axios = require('axios');
const app = express();

// Setup SocketIO
var server = require('http').Server(app);
const io = require('socket.io')(server);

var Cancellation

  console.log('A');


// setup a new database
// using database credentials set in .env
var sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
    // Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
  // storage: '.data/database.sqlite'

  storage: '.data/database.sqlite'

});
  console.log('A2')


// authenticate with the database

sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    // define a new table 'users'
  console.log('B');

    Cancellation = sequelize.define('cancellations', {
      routeId: {
        type: Sequelize.STRING
      },

      route_short_name: {
        type: Sequelize.STRING
      },

      description: {
        type: Sequelize.STRING
      },

      JSON: {
        type: Sequelize.STRING
      },

      startDate: {
        type: Sequelize.DATE
      },

      endDate: {
        type: Sequelize.DATE
      },

      retrievedDate: {
        type: Sequelize.DATE
      }

    });
    
    console.log('C');


    setup();
    console.log('D');


  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// populate table with default users
function setup(){
    console.log('Setup A');


  Cancellation.sync(/*{force: true}*/) // We use 'force: true' in this example to drop the table users if it already exists, and create a new one. You'll most likely want to remove this setting in your own apps
    .then(function(){
    console.log('Setup B');

    Cancellation.create({routeId: -1, route_short_name: "BLAH", description: "BLAH BLAH BLAH", startDate: new Date(), endDate: new Date()})
        console.log('Setup D');


      // // Add the default users to the database
      // for(var i=0; i<users.length; i++){ // loop through all users
      //   User.create({ firstName: users[i][0], lastName: users[i][1]}); // create a new entry in the users table
      // }
    });  
}

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


let serviceAlertsURL = "https://api.opendata.metlink.org.nz/v1/gtfs-rt/servicealerts"
let tripUpdatesURL = "https://api.opendata.metlink.org.nz/v1/gtfs-rt/tripupdates"
let routesURL = "https://api.opendata.metlink.org.nz/v1/gtfs/routes"


var routes = []

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

server.listen(process.env.PORT);

// var distanceBetweenLocations = require('./distanceBetweenLocations');


app.get('/cancellations/', function(request, response) {

  axios.get(serviceAlertsURL, {
    headers: {
      'x-api-key': process.env.metlink_api_key
    }})
  .then(function (apiResponse) {
    
    
    console.log("cancellations")
    // console.log(apiResponse.data)

    console.log("apiResponse.data length:" + JSON.stringify(apiResponse.data).length)

    // console.log("apiResponse.data.entity length:" + JSON.stringify(apiResponse.data.entity).length)

    
    // Cancellation.create({ firstName: request.query.fName, lastName: request.query.lName});


    
    
    response.setHeader('Content-Type', 'application/json')
    response.send(JSON.stringify(apiResponse.data));      
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    response.status(500).send(error)
  })  
});

app.get('/routes/', function(request, response) {

  axios.get(routesURL, {
    headers: {
      'x-api-key': process.env.metlink_api_key
    }})
  .then(function (apiResponse) {
    
    
    console.log("routes")

    console.log("apiResponse.data length:" + JSON.stringify(apiResponse.data).length)

    response.setHeader('Content-Type', 'application/json')
    response.send(JSON.stringify(apiResponse.data));      
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    response.status(500).send(error)
  })  
});
