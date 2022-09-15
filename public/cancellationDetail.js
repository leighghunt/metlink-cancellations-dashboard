/* globals moment Chart */

// var io = window.io;
// var socket = io.connect(window.location.hostname);
// var cancellationsDuringPeriod = 0;
var cancellation = {}
// var otherEvents = []

// var reviewPeriodDays = document.querySelector('#period').value;
// var serviceFilter = ''


// $('#period').on('change', function(event) {
//   reviewPeriodDays = document.querySelector('#period').value;
//   console.log(reviewPeriodDays)
//   refreshCancellations()
// });


// $('#btnFilterServices').on('click', function(event) {
//   serviceFilter = document.getElementById('filterServices').value

//   if(serviceFilter==''){
//     document.getElementById('filterDescription').innerText = 'Metlink'
//     document.getElementById('servicesSummary').style.display = 'block'
//   } else {
//     document.getElementById('filterDescription').innerText = serviceFilter
//     document.getElementById('servicesSummary').style.display = 'none'
//   }

//   console.log(event)
//   refreshCancellations()
// });


// // $('#filterServices').on('change', function(event) {
// //   console.log(event)
// //   refreshCancellations()
// // });





function displayCancellation(){
  console.log(cancellation)
  
  document.getElementById('routeId').innerText = cancellation.routeId
  document.getElementById('startDate').innerText = new Date(cancellation.startDate).toLocaleString()
  document.getElementById('endDate').innerText = new Date(cancellation.endDate).toLocaleString()
  document.getElementById('description').innerText = cancellation.description
    
//   let listResults = document.getElementById('listResults');
//   listResults.style.display = 'block';
//   while (listResults.firstChild) {
//     listResults.removeChild(listResults.firstChild);
//   }

//   cancellationsDuringPeriod = cancellations.length;

//   if(serviceFilter==''){
//     document.getElementById('filterDescription').innerText = 'Metlink'
//   } else {
//     document.getElementById('filterDescription').innerText = serviceFilter
//   }


//   document.getElementById('howmany').innerText=cancellationsDuringPeriod
//   document.getElementById('period').innerText=(reviewPeriodDays==1?" 24 hours":reviewPeriodDays + " days")


//   cancellations.forEach((cancellation) => {
//     displayCancellation(cancellation)     
//   })

  
//   let listOtherEvents = document.getElementById('listOtherEvents');
//   listOtherEvents.style.display = 'block';
//   while (listOtherEvents.firstChild) {
//     listOtherEvents.removeChild(listOtherEvents.firstChild);
//   }

//   otherEvents.forEach((otherEvent) => {
//     displayOtherEvent(otherEvent)     
//   })


  
  
  
  // updateGraph();  
}





const getCancellationListener = function() {
  var data = JSON.parse(this.responseText)

  cancellation = data;
  
  displayCancellation();
}



function refreshCancellation(){
  
  const params = new URLSearchParams(location.search);
  const cancellationId = params.get('cancellationId');
  const cancellationRequest = new XMLHttpRequest();
  cancellationRequest.onload = getCancellationListener;
  
  cancellationRequest.open('get', '/cancellation/' + cancellationId);
  cancellationRequest.send();  
}

refreshCancellation()

