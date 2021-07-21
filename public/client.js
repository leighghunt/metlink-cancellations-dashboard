/* globals moment */

var io = window.io;
var socket = io.connect(window.location.hostname);
socket.on('cancellation', function (cancellation) {
  // cancellation.description = "***" + cancellation.description;
  // console.log(cancellation);
  ++cancellationsInLast24Hours
  document.getElementById('howmany').innerText=cancellationsInLast24Hours


  displayCancellation(cancellation)
});


var cancellationsInLast24Hours = 0;

var routes = [];

const getCancellationsListener = function() {

  let listResults = document.getElementById('listResults');
  listResults.style.display = 'block';
  while (listResults.firstChild) {
    listResults.removeChild(listResults.firstChild);
  }

  var data = JSON.parse(this.responseText)
  
  cancellationsInLast24Hours = data.length;
  
  document.getElementById('howmany').innerText=cancellationsInLast24Hours

  data.forEach((cancellation) => {
    displayCancellation(cancellation)     
  })
}

const displayCancellation = function(cancellation){
  let listResults = document.getElementById('listResults');

  var displayMessage = cancellation.description

  let node = document.createElement("LI");
  node.className = 'list-group-item list-group-item-action';
  var textnode = document.createTextNode(displayMessage);         // Create a text node
  node.appendChild(textnode);                              // Append the text to <li>
  // listResults.appendChild(node);

  listResults.insertBefore(node, listResults.firstChild);

}
  
const cancellationsRequest = new XMLHttpRequest();
cancellationsRequest.onload = getCancellationsListener;
cancellationsRequest.open('get', '/cancellations');
cancellationsRequest.send();





/*
Chart stuff
*/

const labels = [
  '14:00',

  '15:00',

  '16:00',

  '17:00',

  '18:00',

  23,
  22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1
];
const data = {
  labels: labels,
  datasets: [{
    label: 'Cancellations/hr',
    backgroundColor: 'rgb(255, 99, 132)',
    borderColor: 'rgb(255, 99, 132)',
    data: [0, 10, 5, 2, 20, 30, 45, 0, 10, 5, 2, 20, 30, 45, 0, 10, 5, 2, 20, 30, 45, 0, 10, 5, 2, 20, 30, 45],
  }]
};

const config = {
  type: 'bar',
  data,
  options: {}
};


var myChart = new Chart(
    document.getElementById('chartLast24Hours'),
    config
  );