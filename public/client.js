// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o');

var porirua = [-41.135461, 174.839714]
var poriruaCollege = [-41.141636, 174.873872]

console.log(L); 
var L = window.L;
var map = L.map('map').setView(porirua, 13);

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
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker(poriruaCollege).addTo(map)
    .bindPopup('Porirua College')
    .openPopup();

map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
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
console.log(vehicles);
socket.on('location', function (data) {
  console.log(data);

  // console.log(L); 
  // // var L = window.L;
  // console.log(L); 
  
  vehicles[data.VehicleRef] = data;
  if(markers[data.VehicleRef]){
    var newLatLng = new L.LatLng(data.Lat, data.Long);
    markers[data.VehicleRef].setLatLng(newLatLng);
    markers[data.VehicleRef]._popup.setContent(popupText(data));
  } else
  {
    markers[data.VehicleRef] = (L.marker([data.Lat, data.Long]).addTo(map)
      .bindPopup(popupText(data)));
    
  }

  
  // markers[data.VehicleRef] = L.marker([data.Lat, data.Long]);
  // console.log(markers[data.VehicleRef]);
  // markers[data.VehicleRef].addToMap(map);
  console.log(vehicles);
});

function popupText(data){
  let now = new Date();
  var seconds = new Date(now-data.RecordedAtTime).getSeconds();
  let age = seconds + 's';
  if (seconds > 60){
    age = seconds/60 + 'm';
  }
  return data.ServiceID + ': ' + data.VehicleRef + ' ' + age
}