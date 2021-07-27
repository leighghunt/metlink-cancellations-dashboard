/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);
var cancellationsDuringPeriod = 0;
var cancellations = []
var otherEvents = []

var reviewPeriodHours = 24



function displayCancellations(){
  let listResults = document.getElementById('listResults');
  listResults.style.display = 'block';
  while (listResults.firstChild) {
    listResults.removeChild(listResults.firstChild);
  }

  cancellationsDuringPeriod = cancellations.length;
  
  document.getElementById('howmany').innerText=cancellationsDuringPeriod
  document.getElementById('period').innerText=(reviewPeriodHours < 48?reviewPeriodHours + " hours":reviewPeriodHours/24 + " days")


  cancellations.forEach((cancellation) => {
    displayCancellation(cancellation)     
  })

  
  let listOtherEvents = document.getElementById('listOtherEvents');
  listOtherEvents.style.display = 'block';
  while (listOtherEvents.firstChild) {
    listOtherEvents.removeChild(listOtherEvents.firstChild);
  }

  otherEvents.forEach((otherEvent) => {
    displayOtherEvent(otherEvent)     
  })


  
  
  
  updateGraph();  
}





const getCancellationsListener = function() {
  var data = JSON.parse(this.responseText)

  cancellations = data.filter(cancellation => isCancellationOrDelay(cancellation))
  otherEvents = data.filter(cancellation => !isCancellationOrDelay(cancellation))
  
  displayCancellations();
}



socket.on('cancellation', function (cancellation) {

  addCancellation(cancellation)

});



function addCancellation(cancellation){

  var cancellationIndex = cancellations.findIndex(elem => elem.id == cancellation.id)
  if(cancellationIndex == -1){
    cancellations.push(cancellation)
  }else{  
    cancellations.splice(cancellationIndex, 1, cancellation)
  }
  
  // Filter out non cancellations
  cancellations = cancellations.filter(cancellation => isCancellationOrDelay(cancellation))
  otherEvents = cancellations.filter(cancellation => !isCancellationOrDelay(cancellation))


  // cancellations.push(cancellation)
  // displayCancellation(cancellation)
  // updateGraph();  
  displayCancellations()
}










const displayCancellation = function(cancellation){
  let listResults = document.getElementById('listResults');

  var displayMessage = cancellation.description

  let node = document.createElement("LI");
  node.className = 'list-group-item list-group-item-danger';
  var textnode = document.createTextNode(displayMessage);         // Create a text node
  node.appendChild(textnode);                              // Append the text to <li>
  // listResults.appendChild(node);

  listResults.insertBefore(node, listResults.firstChild);


}


const displayOtherEvent = function(otherEvent){
  let listOtherEvents = document.getElementById('listOtherEvents');

  var displayMessage = otherEvent.description

  let node = document.createElement("LI");
  node.className = 'list-group-item list-group-item-info';
  var textnode = document.createTextNode(displayMessage);         // Create a text node
  node.appendChild(textnode);                              // Append the text to <li>
  // listResults.appendChild(node);

  listOtherEvents.insertBefore(node, listOtherEvents.firstChild);


}

function refreshCancellations(){
  const cancellationsRequest = new XMLHttpRequest();
  cancellationsRequest.onload = getCancellationsListener;
  
  var from = new Date()
  from.setDate(from.getDate() - 1)
  console.log(from)
  console.log(from.toUTCString())
  // console.log(from)
  // cancellationsRequest.params.from = from
  cancellationsRequest.open('get', '/cancellations?from=' + from.toUTCString());
  cancellationsRequest.send();  
}

refreshCancellations()



/*
Chart stuff
*/

var chart

function updateGraph(){

  let labels = []
  let dataValues = []
  
  var now = new Date()
  let hoursOffset = now.getHours() 

  var hour = hoursOffset

  for(var i = 0; i< reviewPeriodHours; ++i){
    // console.log(hour + ":00")
    ++hour;
    if(hour>reviewPeriodHours-1){
      hour= 0
    }
    labels[i] = hour + ":00"
    dataValues[i] = 0
  }
  
  cancellations.forEach(cancellation => {
    // if(isCancellationOrDelay(cancellation)){
      // console.log(new Date(cancellation.timestamp))

      var hour = new Date(cancellation.timestamp).getHours();
      // console.log(hour)
      var index = hour - hoursOffset
      if(index <= 0){
        index += reviewPeriodHours-1
      }
      // console.log(index)

      dataValues[index]++

     // }
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
    options: {
        animation: {
          duration:0  // prevent pesky animation, espcially on update
        }
    }
  };


  if(chart==null){
    chart = new Chart(
      document.getElementById('chart'),
      config
    )
  } else {
    chart.config.data = data;
    chart.update(/*{mode: 'none'}*/);
  } 
  
  updateSummary()
}


function updateSummary(){

  console.log("updateSummary")
  let services = []
  console.log(services)
  
  cancellations.forEach(cancellation => {

      let service = services[cancellation.route_short_name]
      if(service==null){
        service = {
          route_short_name : cancellation.route_short_name,
                  cancellations : 1}
      } else{
        ++service.cancellations;
      }
    
      services[cancellation.route_short_name] = service
      
      // console.log(service)
  })
  
  console.log(services)


}



function isCancellationOrDelay(cancellation){
  if(   
//     cancellation.cause == "STRIKE"
//      || cancellation.cause == "TECHNICAL_PROBLEM"

//      // || cancellation.cause == "OTHER_CAUSE"

//      // || cancellation.cause == "ACCIDENT"    // Kind of not really avoidable
     cancellation.effect == "NO_SERVICE"
     || cancellation.effect == "REDUCED_SERVICE"
     || cancellation.effect == "SIGNIFICANT_DELAYS"
    ) {
    console.log(cancellation.description)
    return true
  } else {
    console.log("NOT ******* " + cancellation.description)
    console.log(cancellation.cause)

    console.log(cancellation.effect)


    return false
  }
}


var lastPing = new Date()
var lastPingNo


socket.on('ping', function (pingNo) {

  // console.log('ping: ' + pingNo)
  
  if(pingNo!=null){
    
    if(pingNo > lastPingNo+1){
      console.warn("Missed ping")
      console.warn("Last pingNo:" + lastPingNo)
      console.warn("This pingNo:" + pingNo)
      console.warn("Refreshing cancellations...")
      refreshCancellations()

    }
    lastPingNo = pingNo
    lastPing = new Date()
  } 

  // console.log(lastPing)
  
});


setInterval(function(){
  var now = new Date()
  
  var timeSinceLastPing = now - lastPing
  // console.log(timeSinceLastPing);
  
  if(timeSinceLastPing >= 300000){
    // It's been more than 5 minutes since last ping
    // Let's refresh the whole page
    location.reload()
  }

}, 60000)