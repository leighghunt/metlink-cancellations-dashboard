// server.js
// where your node app starts

// init project
const express = require('express');
const axios = require('axios');
const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Bus stuff

let services = ['KPL', 60, 220, 210, 226, 236, 230, 250, 260];
let url = 'https://www.metlink.org.nz/api/v1/ServiceLocation/';

function getStuff(){
  console.log('getting Stuff....');
  
  services.map(function(serviceId){
    console.log(url + serviceId);
    
    axios.get(url + serviceId)
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
    
  });
}

getStuff();
setInterval(getStuff, 10000);