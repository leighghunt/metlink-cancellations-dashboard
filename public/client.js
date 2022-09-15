/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);
var cancellationsDuringPeriod = 0;
var cancellations = []
var otherEvents = []

var reviewPeriodDays = document.querySelector('#period').value;
var serviceFilter = ''


$('#period').on('change', function(event) {
  reviewPeriodDays = document.querySelector('#period').value;
  console.log(reviewPeriodDays)
  refreshCancellations()
});


$('#btnFilterServices').on('click', function(event) {
  serviceFilter = document.getElementById('filterServices').value

  if(serviceFilter==''){
    document.getElementById('filterDescription').innerText = 'Metlink'
    document.getElementById('servicesSummary').style.display = 'block'
  } else {
    document.getElementById('filterDescription').innerText = serviceFilter
    document.getElementById('servicesSummary').style.display = 'none'
  }

  console.log(event)
  refreshCancellations()
});


// $('#filterServices').on('change', function(event) {
//   console.log(event)
//   refreshCancellations()
// });





function displayCancellations(){
  let listResults = document.getElementById('listResults');
  listResults.style.display = 'block';
  while (listResults.firstChild) {
    listResults.removeChild(listResults.firstChild);
  }

  cancellationsDuringPeriod = cancellations.length;

  if(serviceFilter==''){
    document.getElementById('filterDescription').innerText = 'Metlink'
  } else {
    document.getElementById('filterDescription').innerText = serviceFilter
  }


  document.getElementById('howmany').innerText=cancellationsDuringPeriod
  document.getElementById('period').innerText=(reviewPeriodDays==1?" 24 hours":reviewPeriodDays + " days")


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

  data = data.filter(cancellation => isFiltered(cancellation))

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

  cancellations = cancellations.filter(cancellation => isFiltered(cancellation))

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
  
  var a = document.createElement('a');
  console.log(cancellation)
  a.href = "/CancellationDetail/" + cancellation.id;
  a.title = ">";
  node.appendChild(a);


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
  
  var a = document.createElement('a');
  a.href = "/CancellationDetail/" + otherEvent.id;
  a.title = "Title";
  a.text = "text";
  a.textContent = "textContent";
  node.appendChild(a);

  listOtherEvents.insertBefore(node, listOtherEvents.firstChild);


}

function refreshCancellations(){
  const cancellationsRequest = new XMLHttpRequest();
  cancellationsRequest.onload = getCancellationsListener;
  
  var from = new Date()
  from.setDate(from.getDate() - reviewPeriodDays)  // A multiple of 24 hours back from now - so if <=3 days, same time in day
  console.log(from)
  console.log(from.toUTCString())
  if(reviewPeriodDays>3){
      from.setMinutes(0)
      from.setSeconds(0)
      from.setMilliseconds(0)
      from.setHours(0)
  }
  // console.log('from')
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
  
  var reviewPeriodHours = reviewPeriodDays * 24
  
  var bins = reviewPeriodHours
  var binDateDiffMiliseconds = 60 * 60 * 1000

  var displayingDays = false;
  if(reviewPeriodDays>3){
    displayingDays = true;
  }

  if(displayingDays == true){
    bins = reviewPeriodDays
    binDateDiffMiliseconds = 24 * 60 * 60 * 1000
  }
  
  console.log(bins)
  var mostRecentBinDate = new Date()
  console.log('mostRecentBinDate')
  console.log(mostRecentBinDate)
  // binDate.setHours(-5)

  mostRecentBinDate.setMinutes(0)
  mostRecentBinDate.setSeconds(0)
  mostRecentBinDate.setMilliseconds(0)

  console.log(mostRecentBinDate)
  if(displayingDays){
    mostRecentBinDate.setHours(0)
  }

  var binDate = new Date(mostRecentBinDate.getTime() - bins * binDateDiffMiliseconds)


  // Set up bins
  // var lastBinHours = 0;
  for(var binIndex = 0; binIndex < bins; ++binIndex){
    binDate = new Date(binDate.getTime() + binDateDiffMiliseconds)
    // console.log('binIndex: ' + binIndex)
    // console.log(binDate)

    
      if(displayingDays){
        labels[binIndex] = binDate.getDate()
      } else {
        // if(binDate.getHours() == 0){
        //   labels[binIndex] = "> " + binDate.getHours()
        // } else {
          labels[binIndex] = binDate.getHours() + ":00"
        // }
      }
    dataValues[binIndex] = 0
  }

  // Populate data in each bin
  cancellations.forEach(cancellation => {

    var targetBinDate = new Date(cancellation.timestamp)
    targetBinDate.setMinutes(0)
    targetBinDate.setSeconds(0)
    targetBinDate.setMilliseconds(0)
    // console.log(targetBinDate)

    if(displayingDays){
      targetBinDate.setHours(0)
    }
    // console.log(targetBinDate)

    var targetBinIndex = bins -1 - (mostRecentBinDate.getTime() - targetBinDate.getTime())/ binDateDiffMiliseconds
    
    // console.log((mostRecentBinDate.getTime() - targetBinDate.getTime())/ binDateDiffMiliseconds)
    console.log(cancellation.timestamp)
    console.log(targetBinIndex)
    dataValues[targetBinIndex]++

  })

  
  const data = {
    labels: labels,
    datasets: [{
      label: displayingDays?'Cancellations/day':'Cancellations/hr',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: dataValues,
    }]
  };

  const config = {
    type: 'bar',
    data,
    options: {
      
      
//       scales: {
//       x: {
//         offset: true
//         }
//       },
      
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
  
  cancellations.forEach(cancellation => {

      let service = services[cancellation.routeId]
      if(service==null){
        service = {
          route_short_name : cancellation.route_short_name,
          cancellations : 1
        }
      } else{
        ++service.cancellations;
      }
    
      services[cancellation.routeId] = service
      
  })
  
  console.log(services)
  services.sort((a, b) => {return b.cancellations - a.cancellations})
  console.log(services)

  var servicesSummarised = 0;
  var summary = ""
  services.forEach(service => {
    if(servicesSummarised++ < 5){
      summary += service.route_short_name + " (" + service.cancellations + "), "
      console.log(service.route_short_name + ": " + service.cancellations)
    }
  })
  
  if(summary.length>2){
    summary = summary.substring(0, summary.length-2)
  }
  
  document.querySelector('#cancellationsSummary').textContent = summary
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
    // console.log(cancellation.description)
    return true
  } else {
    // console.log("NOT ******* " + cancellation.description)
    // console.log(cancellation.cause)
    // console.log(cancellation.effect)


    return false
  }
}


function isFiltered(cancellation){
  
  if( serviceFilter == ''){
    return true;
  }
  
  if( cancellation.route_short_name == serviceFilter){
    // console.log(cancellation.description)
    return true
  } else {
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

