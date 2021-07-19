/* globals moment */


console.log('hello world :o');



const getCancellationsListener = function() {
  // parse our response to convert to JSON
  // console.log('getCancellationsListener')
  // console.log(this.responseText)

  let listResults = document.getElementById('listResults');
  listResults.style.display = 'block';
  while (listResults.firstChild) {
    listResults.removeChild(listResults.firstChild);
  }


  var data = JSON.parse(this.responseText)

  
  data.entity.forEach((elem) => {
    var active = false;
    elem.alert.active_period.forEach((active_period) => {
      var startDate = new Date(active_period.start * 1000)
      var endDate = new Date(active_period.end * 1000)
      // console.log(startDate)
      // console.log(endDate)
      
      var now = new Date()
      if(startDate <= now && endDate >= now){
        active = true;
      }
      // console.log(active)
    })


    if(active){
      // console.log(elem)
      // console.log(elem.alert.cause)
      // console.log(elem.alert.effect)
      
      if(elem.alert.effect == "NO_SERVICE"){

        var displayMessage = alertToText(elem)
       
        console.log(elem.alert.effect)
        let node = document.createElement("LI");
        node.className = 'list-group-item list-group-item-action';
        var textnode = document.createTextNode(displayMessage);         // Create a text node
        node.appendChild(textnode);                              // Append the text to <li>
        listResults.appendChild(node);

      } 
    }
  })

}

function alertToText(elem){
  console.log(elem.alert)
  // elem.alert.informed_entity.push({route_id: "BLAH"})
  // elem.alert.informed_entity.push({route_id: "123"})
  var services = elem.alert.informed_entity.reduce((accumulator, currentValue) => {
    console.log(accumulator)
    console.log(currentValue)
    
    var route_id = currentValue.route_id
    
    if(route_id[route_id.length-1] == "0"){
      route_id = route_id.substring(0, route_id.length-1)
    }
    
    if(accumulator==""){
      return route_id
    } else
    return accumulator + ", " + route_id
  }, "")
  console.log(services)
  return "Service " + services + ": " + elem.alert.header_text.translation[0].text
}

const cancellationsRequest = new XMLHttpRequest();
cancellationsRequest.onload = getCancellationsListener;
cancellationsRequest.open('get', '/cancellations');
cancellationsRequest.send();