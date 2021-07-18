/* globals moment */


console.log('hello world :o');



const getCancellationsListener = function() {
  // parse our response to convert to JSON
  console.log('getCancellationsListener')
  var data = JSON.parse(this.responseText);

  // for(var stop in data){
  //   allStops.push(data[stop]);
  // }

  
  // // iterate through every dream and add it to our page
  // allStops = st
  // for(var stop in stops){
  //   handleStopsData(stops[stop]);
  // }

}

const cancellationsRequest = new XMLHttpRequest();
cancellationsRequest.onload = getCancellationsListener;
cancellationsRequest.open('get', '/cancellations');
cancellationsRequest.send();