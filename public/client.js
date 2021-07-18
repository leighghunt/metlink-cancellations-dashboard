/* globals moment */


console.log('hello world :o');



const getCancellationsListener = function() {
  // parse our response to convert to JSON
  console.log('getCancellationsListener')
  console.log(this.responseText)
  var data = JSON.parse(this.responseText)

  
  data.entity.forEach((elem) => {
    var active = false;
    elem.alert.active_period.forEach((active_period) => {
      var startDate = new Date(active_period.start * 1000)
      var endDate = new Date(active_period.end * 1000)
      console.log(startDate)
      console.log(endDate)
      
      var now = new Date()
      if(startDate <= now && endDate >= now){
        active = true;
      }
      console.log(active)
    })

    if(active){
      console.log(elem.alert.cause)
      console.log(elem.alert.effect)
      
    }

  })




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