/* globals moment */

var routes = [];

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
//     var active = false;
//     elem.alert.active_period.forEach((active_period) => {
//       var startDate = new Date(active_period.start * 1000)
//       var endDate = new Date(active_period.end * 1000)
//       // console.log(startDate)
//       // console.log(endDate)
      
//       var now = new Date()
//       if(startDate <= now && endDate >= now){
//         active = true;
//       }
//       // console.log(active)
//     })

//     if(elem.alert.effect == "NO_SERVICE"){

//       if(active){
//       // console.log(elem)
//       // console.log(elem.alert.cause)
//       // console.log(elem.alert.effect)
      

        var displayMessage = alertToText(elem)
       
        console.log(elem.alert.effect)
        let node = document.createElement("LI");
        node.className = 'list-group-item list-group-item-action';
        var textnode = document.createTextNode(displayMessage);         // Create a text node
        node.appendChild(textnode);                              // Append the text to <li>
        listResults.appendChild(node);

//       } else {
//       console.log("NOT ACTIVE")
//       console.log(elem)
        
//       }
    }
  })

}


const getRoutesListener = function() {

  var data = JSON.parse(this.responseText)
  
  routes = data;
  
  console.log(routes)

  
  const cancellationsRequest = new XMLHttpRequest();
  cancellationsRequest.onload = getCancellationsListener;
  cancellationsRequest.open('get', '/cancellations');
  cancellationsRequest.send();


}


const routesRequest = new XMLHttpRequest();
routesRequest.onload = getRoutesListener;
routesRequest.open('get', '/routes');
routesRequest.send();



