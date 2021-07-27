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

//     var countBefore = await Cancellation.count()
//     // console.log("countBefore")
//     // console.log(countBefore)



    apiResponse.data.entity.forEach(async (entity) => {
      
      var existingCancellation = await Cancellation.findByPk(entity.id)
      
//       if(existingCancellation!=null){
//         console.log("existingCancellation found")
//         console.log("existingCancellation.JSON")

//         console.log(existingCancellation.JSON)

//         console.log("JSON.stringify(entity)")

//         console.log(JSON.stringify(entity))


//       }
      
      var bNeedsUpserting = true;
      if(existingCancellation!=null && existingCancellation.JSON == JSON.stringify(entity)){
        // console.log("Exists and unchanged")

        bNeedsUpserting = false;
      }
      
      if(bNeedsUpserting){
        console.log("bNeedsUpserting")
      // console.log(entity.id)

      // console.log(entity)

      // if(entity.alert.cause == "STRIKE" || (entity.alert.effect == "NO_SERVICE" || entity.alert.effect == "REDUCED_SERVICE")){
        
        // console.log(entity.alert.header_text.translation[0].text)
        var cancellation = {
          id: entity.id,
          route_id: entity.route_id,
          cause: entity.alert.cause,
          effect: entity.alert.effect,          
          JSON: JSON.stringify(entity),
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

//       } else {
//         // console.log("Not adding " + entity.alert.cause + " -> " + entity.alert.effect + "   " + entityToText(entity))
//         console.log("Not adding " + entity.alert.cause + " -> " + entity.alert.effect + "   " + entity.alert.header_text.translation[0].text)

//         // console.log(entity)
        
//       }
    })
    
//     var countAfter = await Cancellation.count()
//     // console.log("countAfter")
//     // console.log(countAfter)


//     if(countAfter>countBefore){
//       console.log("Added cancellations: " + (countAfter-countBefore))
//     }

  })
  .catch(function (error) {
    // handle error
    console.log(error);

    console.log("Have you set metlink_api_key environment variable?")
  })  
}

app.get('/cancellations/', async function(request, response) {

  
//     var from = new Date()
//     from.setDate(from.getDate() - 1)
  console.log("request.query")
  console.log(request.query)

  console.log("request.query.from")
  console.log(request.query.from)


    
    Cancellation.findAll({
        where: {
          timestamp: {[Op.gt]: new Date(request.query.from)},

          // [Op.or]: [
          //   { cause: "STRIKE" },
          //   { cause: "TECHNICAL_PROBLEM" },
          // //   { cause: "ACCIDENT" },    // Kind of not really avoidable
          //   { effect: "NO_SERVICE" },
          //   { effect: "REDUCED_SERVICE" },
          //   { effect: "SIGNIFICANT_DELAYS" }
          // ]

        },
        order: [
          ['timestamp', 'ASC']
        ]
      })
      .then(cancellations => {
        response.setHeader('Content-Type', 'application/json')
        response.send(JSON.stringify(cancellations));

      //         var results = cancellations.map(cancellation => {
//           return {
//             id: cancellation.id,
//             startDate: cancellation.startDate,
//             endDate: cancellation.endDate,
//             // description: cancellation.cause + "/" + cancellation.effect + ": " + cancellation.description
//             description: cancellation.description

//           }
//         })
        
        // console.log(results);
        // response.setHeader('Content-Type', 'application/json')
        // response.send(JSON.stringify(results));      

    });
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