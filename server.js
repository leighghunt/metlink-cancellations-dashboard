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

var vehicles = {};

let services = ['KPL', 60, 220, 210, 226, 236, 230, 250, 260];
let url = 'https://www.metlink.org.nz/api/v1/ServiceLocation/';

function callAPI(){
    console.log('Calling API....');
  
  services.map(function(serviceId){
    console.log(url + serviceId);
    
    axios.get(url + serviceId)
    .then(function (response) {
      
      handleResponse(response.data);      
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    
  });
}

function handleResponse(data){    
  //console.log(data);
  data.Services.forEach(function(service){
   console.log(service.ServiceID + ': ' + service.VehicleRef);
    
    vehicles[service.VehicleRef] = {
      ServiceId: service.ServiceID,
      Lat: service.Lat,
      Long: service.Long,
      
    }
    
  });
  
  console.log(vehicles);


}


// Short cut the API call so we don't get banned from the API :-)
// Get this from https://www.metlink.org.nz/api/v1/ServiceLocation/KPL
const KPL_JSON = '{"LastModified":"2019-07-18T15:00:09+12:00","Services":[{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4157","ServiceID":"KPL","HasStarted":true,"DepartureTime":"2019-07-18T14:13:00+12:00","OriginStopID":"WELL","OriginStopName":"WgtnStn","DestinationStopID":"WAIK","DestinationStopName":"WaikanaeStn","Direction":"Outbound","Bearing":"24","BehindSchedule":true,"VehicleFeature":null,"DelaySeconds":81,"Lat":"-40.9897385","Long":"174.9504089","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Wellington - Waikanae)","Mode":"Train","Link":"/timetables/train/KPL"}},{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4225","ServiceID":"KPL","HasStarted":true,"DepartureTime":"2019-07-18T14:40:00+12:00","OriginStopID":"WAIK","OriginStopName":"WaikanaeStn","DestinationStopID":"WELL","DestinationStopName":"WgtnStn","Direction":"Inbound","Bearing":"210","BehindSchedule":true,"VehicleFeature":null,"DelaySeconds":56,"Lat":"-41.0158081","Long":"174.9170685","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Waikanae - Wellington)","Mode":"Train","Link":"/timetables/train/KPL"}},{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4228","ServiceID":"KPL","HasStarted":false,"DepartureTime":"2019-07-18T15:02:00+12:00","OriginStopID":"WAIK","OriginStopName":"WaikanaeStn","DestinationStopID":"WELL","DestinationStopName":"WgtnStn","Direction":"Inbound","Bearing":"336","BehindSchedule":false,"VehicleFeature":null,"DelaySeconds":0,"Lat":"-40.8765984","Long":"175.0662384","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Waikanae - Wellington)","Mode":"Train","Link":"/timetables/train/KPL"}},{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4231","ServiceID":"KPL","HasStarted":true,"DepartureTime":"2019-07-18T14:00:00+12:00","OriginStopID":"WAIK","OriginStopName":"WaikanaeStn","DestinationStopID":"WELL","DestinationStopName":"WgtnStn","Direction":"Inbound","Bearing":"174","BehindSchedule":true,"VehicleFeature":null,"DelaySeconds":25,"Lat":"-41.2746086","Long":"174.7841187","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Waikanae - Wellington)","Mode":"Train","Link":"/timetables/train/KPL"}},{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4237","ServiceID":"KPL","HasStarted":false,"DepartureTime":"2019-07-18T15:01:00+12:00","OriginStopID":"WELL","OriginStopName":"WgtnStn","DestinationStopID":"PORI2","DestinationStopName":"PoriruaStn","Direction":"Outbound","Bearing":"336","BehindSchedule":false,"VehicleFeature":null,"DelaySeconds":0,"Lat":"-41.2777481","Long":"174.7813416","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Wellington - Waikanae)","Mode":"Train","Link":"/timetables/train/KPL"}},{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4266","ServiceID":"KPL","HasStarted":true,"DepartureTime":"2019-07-18T14:20:00+12:00","OriginStopID":"WAIK","OriginStopName":"WaikanaeStn","DestinationStopID":"WELL","DestinationStopName":"WgtnStn","Direction":"Inbound","Bearing":"186","BehindSchedule":false,"VehicleFeature":null,"DelaySeconds":-35,"Lat":"-41.1474113","Long":"174.8428192","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Waikanae - Wellington)","Mode":"Train","Link":"/timetables/train/KPL"}},{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4288","ServiceID":"KPL","HasStarted":true,"DepartureTime":"2019-07-18T14:53:00+12:00","OriginStopID":"WELL","OriginStopName":"WgtnStn","DestinationStopID":"WAIK","DestinationStopName":"WaikanaeStn","Direction":"Outbound","Bearing":"348","BehindSchedule":false,"VehicleFeature":null,"DelaySeconds":0,"Lat":"-41.2520447","Long":"174.8046417","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Wellington - Waikanae)","Mode":"Train","Link":"/timetables/train/KPL"}},{"RecordedAtTime":"2019-07-18T14:59:25+12:00","VehicleRef":"4293","ServiceID":"KPL","HasStarted":true,"DepartureTime":"2019-07-18T14:33:00+12:00","OriginStopID":"WELL","OriginStopName":"WgtnStn","DestinationStopID":"WAIK","DestinationStopName":"WaikanaeStn","Direction":"Outbound","Bearing":"354","BehindSchedule":true,"VehicleFeature":null,"DelaySeconds":112,"Lat":"-41.1112137","Long":"174.8609009","Service":{"Code":"KPL","TrimmedCode":"KPL","Name":"Kapiti Line (Wellington - Waikanae)","Mode":"Train","Link":"/timetables/train/KPL"}}]}';
// handleResponse(JSON.parse(KPL_JSON));

setTimeout(callAPI, 10000); // Avoid firing immediately so we don't balst the API and get throttled.
//callAPI();
setInterval(callAPI, 60000);

console.log(vehicles);
