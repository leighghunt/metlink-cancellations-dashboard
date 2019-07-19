// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o');

var porirua = [-41.135461, 174.839714]
var poriruaCollege = [-41.141636, 174.873872]

console.log(L); 
var L = window.L;
var map = L.map('map').setView(porirua, 11);

var tileLayerOSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Available Thundermap themes:
var theme = 'transport'; // Others: cycle, landscape, outdoors, transport-dark, spinal-map, pioneer, mobile-atlas, neighbourhood
// theme = 'cycle';
theme = 'transport-dark';
// theme = 'outdoors;
// theme = 'neighbourhood';

var tileLayerThunderforest = 'https://{s}.tile.thunderforest.com/' + theme + '/{z}/{x}/{y}{r}.png?apikey=7dd44766c60140818b8816a0d8521fc2';

var tileLayerUrl = tileLayerThunderforest;

L.tileLayer(tileLayerUrl, {
  opacity: 0.3,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker(poriruaCollege).addTo(map)
    .bindPopup('Porirua College')
    // .openPopup();

map.locate({setView: false, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy;

    // L.marker(e.latlng).addTo(map)

    L.circle(e.latlng, radius).addTo(map)
          .bindPopup("You are within " + radius + " meters from this point");

}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);
map.on('locationfound', onLocationFound);


console.log('About to connect to sockets');
console.log(window.location.hostname);
var io = window.io;

var socket = io.connect(window.location.hostname);
var vehicles = {};
var markers= {};
var trails = {};
console.log(vehicles);
socket.on('location', function (data) {
  console.log(data);

  if(vehicles[data.VehicleRef] && vehicles[data.VehicleRef].RecordedAtTime == data.RecordedAtTime){
    console.log('no update');
    return;
  }
  
  vehicles[data.VehicleRef] = data;
  let colour = 'green';
    let fillColour = '#3f0';
    if(data.DelaySeconds>60){
      colour = 'orange';
      fillColour = '#FF9933';
      if(data.DelaySeconds>300){
        colour = 'red';
        fillColour = '#FF0033';
      }      
    }

  if(markers[data.VehicleRef]){
    // let historyMarker = L.circle(markers[data.VehicleRef].getLatLng(), {
    //   color: colour,
    //   fillColor: fillColour,
    //   fillOpacity: 0.5,
    //   radius: 10}).addTo(map);

    let historyLine = L.polyline([markers[data.VehicleRef].getLatLng(), [data.Lat, data.Long]], {
      color: colour,
      dashArray: '1',
      width: 10}).addTo(map);

    if(!trails[data.VehicleRef]){
      trails[data.VehicleRef] = [];
    }
    trails[data.VehicleRef].push(historyLine);

    var newLatLng = new L.LatLng(data.Lat, data.Long);
    markers[data.VehicleRef].setLatLng(newLatLng);
    // markers[data.VehicleRef].setColor(colour);
    markers[data.VehicleRef]._popup.setContent(popupText(data));
  } else
  {
    markers[data.VehicleRef] = (L.circle([data.Lat, data.Long], {
      color: colour,
      fillColor: fillColour,
      fillOpacity: 0.5,
      radius: 30}).addTo(map)
      .bindPopup(popupText(data)));
    
  }

  
  // markers[data.VehicleRef] = L.marker([data.Lat, data.Long]);
  // console.log(markers[data.VehicleRef]);
  // markers[data.VehicleRef].addToMap(map);
  console.log(vehicles);
});

function popupText(data){
  // let now = new Date();
  // var seconds = (new Date(now) - new Date(data.RecordedAtTime))/1000;
  // let age = Math.round(seconds) + 's';
  // if (seconds > 60){
  //   age = Math.round(seconds/60) + 'm';
  // }
  // return data.ServiceID + ': ' + data.VehicleRef + ' ' + age
  
  let time = new Date(data.RecordedAtTime).toLocaleTimeString();
  let delay = data.DelaySeconds > 60? ' (Delayed ' + data.DelaySeconds + 's)':'';
  return data.ServiceID + ': ' + data.VehicleRef + ' ' + time + delay;
}