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

var cancellations

const getCancellationsListener = function() {

  let listResults = document.getElementById('listResults');
  listResults.style.display = 'block';
  while (listResults.firstChild) {
    listResults.removeChild(listResults.firstChild);
  }

  var data = JSON.parse(this.responseText)
  
  cancellations = data;
  
  cancellationsInLast24Hours = cancellations.length;
  
  document.getElementById('howmany').innerText=cancellationsInLast24Hours

  cancellations.forEach((cancellation) => {
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

updateGraph();

function updateGraph(){

  let labels = []
  
  var now = new Date()
  var hour = now.getHours()
  for(var i = 0; i< 24; ++i){
    console.log(hour + ":00")
    --hour;
    if(hour<0){
      hour= 23
    }
    labels[i] = hour + ":00"
  }
  
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
}
