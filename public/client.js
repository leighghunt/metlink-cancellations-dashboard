/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);
socket.on('cancellation', function (cancellation) {
  // cancellation.description = "***" + cancellation.description;
  // console.log(cancellation);
  ++cancellationsInLast24Hours
  document.getElementById('howmany').innerText=cancellationsInLast24Hours


  displayCancellation(cancellation)
  updateGraph();
});


var cancellationsInLast24Hours = 0;

var cancellations = []

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
  
  updateGraph();
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


function updateGraph(){

  let labels = []
  let dataValues = []
  
  var now = new Date()
  let hoursOffset = now.getHours() 

  var hour = hoursOffset

  for(var i = 0; i< 24; ++i){
    // console.log(hour + ":00")
    ++hour;
    if(hour>23){
      hour= 0
    }
    labels[i] = hour + ":00"
    dataValues[i] = 0
  }
  
  cancellations.forEach(cancellation => {
    console.log(new Date(cancellation.timestamp))

    var hour = new Date(cancellation.timestamp).getHours();
    console.log(hour)
    var index = hour - hoursOffset
    if(index < 0){
      index += 24
    }
    console.log(index)

    dataValues[index]++
  })
  
  const data = {
    labels: labels,
    datasets: [{
      label: 'Cancellations/hr',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: dataValues,
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
