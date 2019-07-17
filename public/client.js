// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o');

var porirua = [-41.135461, 174.839714]
var poriruaCollege = [-41.141636, 174.873872]

var L = window.L;
var map = L.map('map').setView(porirua, 13);

var tileLayerOSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var tileLayerOpenCycleMap = 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey=7dd44766c60140818b8816a0d8521fc2';

// var tileLayerUrl = tileLayerOSM;
var tileLayerUrl = tileLayerOpenCycleMap;

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
