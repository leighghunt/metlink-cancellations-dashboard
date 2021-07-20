// server.js
// where your node app starts

// init project
const express = require('express');
var Sequelize = require('sequelize');
const {Op} = require('sequelize');
const axios = require('axios');

const moment = require('moment');

const app = express();

// Setup SocketIO
var server = require('http').Server(app);
const io = require('socket.io')(server);
var cron = require('node-cron');

var Cancellation

var routes



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
  // dialectOptions: {mode: 2 | 4},    Use sequelize v5 or you'll get file/directory creation issues here
  // https://github.com/sequelize/sequelize/issues/12329#issuecomment-662160609
  logging: false,
  storage: '.data/database.sqlite'

});


// authenticate with the database
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');

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

function updateCancellations(){

  console.log("updateCancellations")

  axios.get(serviceAlertsURL, {
    headers: {
      'x-api-key': process.env.metlink_api_key
    }})
  .then(async function (apiResponse) {
    
    console.log("updateCancellations - response")

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
          description: entityToText(entity),
          timestamp: new Date(entity.timestamp),
          startDate: new Date(entity.alert.active_period[0].start * 1000),
          endDate: new Date(entity.alert.active_period[0].end * 1000),
        });
      }
    })
      
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })  
}

app.get('/cancellations/', function(request, response) {

    // var timeNow = new Date()
    // startOfToday.setHours(0,0,0,0)
    
    // console.log(startOfToday)
  
  
  var timeNow    = new moment();
  console.log(timeNow)

  var timeNowNZ    = timeNow.clone().tz("Wellington");
  console.log(timeNowNZ)

  // .tz("2014-06-01 12:00", "America/New_York");
  // var losAngeles = newYork.clone().tz("America/Los_Angeles");
  // var london     = newYork.clone().tz("Europe/London");

// newYork.format();    // 2014-06-01T12:00:00-04:00
  
  
    Cancellation.findAll({
        // where: {
        //   timestamp: {[Op.gt]: startOfToday},   
        // },
        order: [
        ['timestamp', 'DESC']]
      })
      .then(cancellations => {
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
});



function entityToText(entity){
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



function getRoutes(){
  axios.get(routesURL, {
    headers: {
      'x-api-key': process.env.metlink_api_key
    }})
  .then(function (apiResponse) {
    
    routes = apiResponse.data;
    console.log("routes")
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    // response.status(500).send(error)
  })  
}


getRoutes();

cron.schedule('*/5 * * * *', () => {
  console.log('*/5 * * * *');
});


