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


      cause: {
        type: Sequelize.STRING
      },

      effect: {
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
    
    setup();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// populate table with default users
function setup(){
  console.log('setup')
  Cancellation.sync(
    // {force: true}
    // { alter: true }
  ) 
    .then(function(){

    Cancellation.create({routeId: -1, route_short_name: "BLAH", description: "BLAH BLAH BLAH", startDate: new Date(), endDate: new Date(), cause: "TEST", effect: "NONE"})
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

app.get('/CancellationDetail', function(request, response) {
  response.sendFile(__dirname + '/views/CancellationDetail.html');
});

server.listen(process.env.PORT);

// var distanceBetweenLocations = require('./distanceBetweenLocations');

function fixCancellations(){
  
    console.log('fixCancellations')
    console.log(Cancellation)

        Cancellation.findAll({
          // limit: 10, 
          where: {
            route_short_name: null
            }
        })
      .then(cancellations => {
        // console.log(cancellations)
        cancellations.forEach(async cancellation => {
          console.log(cancellation.id + ': ' + cancellation.routeId + ', ' + cancellation.route_short_name)
          
          let entity = JSON.parse(cancellation.JSON);
          
          cancellation.routeId = entity.alert.informed_entity[0].route_id
          var route = routes.find(route => route.route_id == cancellation.routeId)
          // console.log(cancellation.routeId)
          // console.log(route)

          if(route!=null){
            cancellation.route_short_name = route.route_short_name 
            console.log(cancellation.id + ': ' + cancellation.routeId + ', ' + cancellation.route_short_name)
            // console.log('cancellation')

            // console.log(cancellation.dataValues)

            Cancellation.upsert(cancellation.dataValues)
          }

        })
    });
}
// setTimeout(fixCancellations, 5000)



function updateCancellations(){

  console.log("updateCancellations")

  axios.get(serviceAlertsURL, {
    headers: {
      'x-api-key': process.env.metlink_api_key
    }})
  .then(async function (apiResponse) {
    
    console.log("updateCancellations - response")

    console.log("apiResponse.data length:" + JSON.stringify(apiResponse.data).length)


    apiResponse.data.entity.forEach(async (entity) => {
      
      var existingCancellation = await Cancellation.findByPk(entity.id)
      
      var bNeedsUpserting = true;
      if(existingCancellation!=null && existingCancellation.JSON == JSON.stringify(entity)){
        // console.log("Exists and unchanged")

        bNeedsUpserting = false;
      }
      
      if(bNeedsUpserting){
        if(existingCancellation!=null){
          console.log("Needs Upserting")
          console.log(entity.route_id)
          console.log(existingCancellation.JSON)
          console.log(JSON.stringify(entity))          
        } else {
          console.log("Needs inserting")
        }
        
        var suppliedJSON = JSON.stringify(entity)
        if(entity.route_id == null){
          entity.route_id = entity.alert.informed_entity[0].route_id
        }
        console.log(entity.route_id)

        var route = routes.find(route => route.route_id == entity.route_id)

        var route_short_name
        if(route!=null){
          route_short_name = route.route_short_name 
        } else {
          console.log("couldn't find log")
        }

        var cancellation = {
          id: entity.id,
          routeId: entity.route_id,
          route_short_name: route_short_name,
          cause: entity.alert.cause,
          effect: entity.alert.effect,          
          JSON: suppliedJSON,
          description: entityToText(entity),
          timestamp: new Date(entity.timestamp),
          startDate: new Date(entity.alert.active_period[0].start * 1000),
          endDate: new Date(entity.alert.active_period[0].end * 1000),
        }
        
        Cancellation.upsert(cancellation)
        
        console.log('emitting...')

        console.log(cancellation)

        io.emit('cancellation', cancellation)

      }
    })
  })
  .catch(function (error) {
    // handle error
    console.log(error);

    console.log("Have you set metlink_api_key environment variable?")
  })  
}

app.get('/cancellations/', async function(request, response) {

    var from = new Date()
    from.setDate(from.getDate() - 1)
  
    if(request.query.from!=null){
      // console.log(request.query.from)
      // console.log(new Date(request.query.from))
      from = new Date(request.query.from)
    }

    var to = new Date()
  
    if(request.query.to!=null){
      to = new Date(request.query.to)
    }

    console.log(from)
    console.log(to)


    Cancellation.findAll({
        where: {
          timestamp: {
            [Op.and]:[
              {[Op.gte]: from},
              {[Op.lte]: to}

            ]
          },

          // timestamp: {[Op.gt]: from},


        },
        order: [
          ['timestamp', 'ASC']
        ]
      })
      .then(cancellations => {
        response.setHeader('Content-Type', 'application/json')
        response.send(JSON.stringify(cancellations));
    });
});

app.get('/cancellation/:cancellationId', async function(request, response) {

    // console.log('cancellation')
    response.setHeader('Content-Type', 'application/json')

    if(request.params.cancellationId!=null){
      
      // console.log(request.params.cancellationId)

      const cancellation = await Cancellation.findByPk(request.params.cancellationId)
      
      if(cancellation === null){
        response.sendStatus(404)        
      } else {
        response.send(JSON.stringify(cancellation));
      }
    } else {
      response.sendStatus(404)
    }

});



function entityToText(entity){
  // console.log(entity.alert)
  // elem.alert.informed_entity.push({route_id: "BLAH"})
  // elem.alert.informed_entity.push({route_id: "123"})
  var routeType = "Service "
  
  // console.log(entity.alert.informed_entity[0])


  switch(entity.alert.informed_entity[0].route_type){
    case 2:
      routeType = "Train "
      break

    case 3:
      routeType = "Bus "
      break

    case 4:
      routeType = "Ferry "
      break

    case 5:
      routeType = "Cable Car "
      break

    default:
      routeType = "Service "
      break
  }
  // console.log(routeType)

  var services = entity.alert.informed_entity.reduce((accumulator, currentValue) => {
    // console.log(accumulator)
    // console.log(currentValue)
    
    var route_id = currentValue.route_id
    
    var route = routes.find(route => route.route_id == route_id)
    
    if(route!=null){
      if(accumulator==""){
        return route.route_short_name 
      } else
      {
        return accumulator + ", " + route.route_short_name 
      }
    } else
    {
      return accumulator
    }
    
  }, "")
  // console.log(services)
  return routeType + services + ": " + entity.alert.header_text.translation[0].text
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
    console.log("Have you set metlink_api_key environment variable?")
    // response.status(500).send(error)
  })  
}


getRoutes();

cron.schedule('*/1 * * * *', () => {
  updateCancellations();
});






/*
  // var timeNow = new Date()
    // startOfToday.setHours(0,0,0,0)
    
    // console.log(startOfToday)
  
  
  var timeNow    = new moment();
  console.log(timeNow)

  var timeNowNZTZ    = timeNow.clone().tz("Pacific/Auckland");
  console.log(timeNowNZTZ)

  var timeNowNZ = new moment(timeNowNZTZ.format())
  console.log(timeNowNZ)

   // timeNowNZ.setHours(0)
  console.log(timeNowNZ)
  
  
  
  let now = new Date()
  console.log(now)

  // Get the current time in LA using string matching to enable the offset to be calculated
  // This allows for daylight savings to be considered
  // Caution the LocaleTimeString is en-US formatted. Take care if using a different locale
  let timeInNZ = now.toLocaleTimeString('en-US', { timeZone: 'Pacific/Auckland' })
    // .match(/([0-1]?[0-9])\:([0-5]?[0-9])\:[0-5]?[0-9]\s(AM|PM)/)
    // // trim first element of match
    // .slice(1)
    //  // take account of AM/PM and convert values to integers
    // .map( (e,i,a) => i==0 && a[3] =='PM' ? +e+12 : +e)
    // // trim AM/PM
    // .slice(0,-1)

    console.log(timeInNZ)


  // .tz("2014-06-01 12:00", "America/New_York");
  // var losAngeles = newYork.clone().tz("America/Los_Angeles");
  // var london     = newYork.clone().tz("Europe/London");

// newYork.format();    // 2014-06-01T12:00:00-04:00
*/


io.on("connection", (socket) => {
  console.log("io.on connection")
  
  // console.log(io.socket.clients().length)
  // console.log("Emiting ping to " + socket.listenersAny().count() + " listeners")

});

var pingNo = 0
// Ping every minute - and in client check if last ping was more than 5 minutes ago
setInterval(function(){
  console.log("ping")

  console.log(pingNo)

  console.log(new Date())

  io.emit("ping", ++pingNo)
}, 60000)
