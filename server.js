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
var cron = require('node-cron');

var Cancellation

var routes

  // console.log('A');

// https://medium.com/@joshuatabansi/cron-jobs-in-glitch-easy-e6068b14e474
cron.schedule('0 * * * *', () => {
  console.log('running a task at the start of every hour');
  //function logic goes here
});

cron.schedule('* * * * *', () => {
  console.log('* * * * *');
});


cron.schedule('0/1 * * * *', () => {
  console.log('0/1 * * * *');
});


cron.schedule('0/5 * * * *', () => {
  console.log('0/5 * * * *');
});


var task = cron.schedule('0/1 * * * *', () => {
  console.log('running a task aevery minute');
  //function logic goes here
});

task.start();




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

  // dialectOptions: {mode: 2 | 4},    Use sequelize v5 or you'll get file/directory creation issues here
  // https://github.com/sequelize/sequelize/issues/12329#issuecomment-662160609
  logging: false,
  storage: '.data/database.sqlite'

});
  console.log('A2')


// authenticate with the database

sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    // define a new table 'users'

    Cancellation = sequelize.define('cancellations', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER
      },

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

      timestamp: {
        type: Sequelize.DATE
      }

    });
    
    // setup();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// populate table with default users
function setup(){

  Cancellation.sync(
    // {force: true}
  ) 
  // We use 'force: true' in this example to drop the table users if it already exists, and create a new one. You'll most likely want to remove this setting in your own apps
    .then(function(){

    Cancellation.create({routeId: -1, route_short_name: "BLAH", description: "BLAH BLAH BLAH", startDate: new Date(), endDate: new Date()})
    });  
}

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
  .then(async function (apiResponse) {
    
    console.log("cancellations")

    // console.log(apiResponse.data)

    console.log("apiResponse.data length:" + JSON.stringify(apiResponse.data).length)

    // console.log("apiResponse.data.entity length:" + JSON.stringify(apiResponse.data.entity).length)

    apiResponse.data.entity.forEach((entity) => {
      
      if(entity.alert.cause == "STRIKE" || (entity.alert.effect == "NO_SERVICE" || entity.alert.effect == "REDUCED_SERVICE")){

        
        
        
        // console.log(entity.alert.header_text.translation[0].text)
        Cancellation.upsert({
          id: entity.id,
          route_id: entity.route_id,
          JSON: JSON.stringify(entity),
          description: alertToText(entity),
          timestamp: new Date(entity.timestamp),
          startDate: new Date(entity.alert.active_period[0].start * 1000),
          endDate: new Date(entity.alert.active_period[0].end * 1000),
        });
      }
    })
    
    // Cancellation.create({ firstName: request.query.fName, lastName: request.query.lName});

    
    // ******************************************************************************************************
    // TO DO - change to format we want to display, process on server, and merge new and persisted data here.
    //
    // And add timer to auto-retrieve data
    // ******************************************************************************************************

    
    Cancellation.findAll({
  order: [
    ['timestamp', 'DESC']]})
      .then(cancellations => {
        // console.log("All cancellations:", JSON.stringify(cancellations, null, 4));
        var results = cancellations.map(cancellation => {
          return {
            id: cancellation.id,
            startDate: cancellation.startDate,
            endDate: cancellation.endDate,
            description: cancellation.description
          }
        })
        
        // console.log(results);
        response.setHeader('Content-Type', 'application/json')
        response.send(JSON.stringify(results));      

    });

    // response.setHeader('Content-Type', 'application/json')
    // response.send(JSON.stringify(apiResponse.data));      
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    response.status(500).send(error)
  })  
});



function alertToText(entity){
  // console.log(entity.alert)
  // elem.alert.informed_entity.push({route_id: "BLAH"})
  // elem.alert.informed_entity.push({route_id: "123"})
  var services = entity.alert.informed_entity.reduce((accumulator, currentValue) => {
    // console.log(accumulator)
    // console.log(currentValue)
    
    var route_id = currentValue.route_id
    
    var route = routes.find(route => route.route_id == route_id)
    
    if(accumulator==""){
      return route.route_short_name 
    } else
    return accumulator + ", " + route.route_short_name 
  }, "")
  // console.log(services)
  return "Service " + services + ": " + entity.alert.header_text.translation[0].text
}



// app.get('/routes/', function(request, response) {

  axios.get(routesURL, {
    headers: {
      'x-api-key': process.env.metlink_api_key
    }})
  .then(function (apiResponse) {
    
    routes = apiResponse.data;
    console.log("routes")

//     console.log("apiResponse.data length:" + JSON.stringify(apiResponse.data).length)

//     response.setHeader('Content-Type', 'application/json')
//     response.send(JSON.stringify(apiResponse.data));      
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    // response.status(500).send(error)
  })  
// });
