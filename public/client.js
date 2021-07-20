/* globals moment */

var routes = [];

const getCancellationsListener = function() {

  let listResults = document.getElementById('listResults');
  listResults.style.display = 'block';
  while (listResults.firstChild) {
    listResults.removeChild(listResults.firstChild);
  }

  var data = JSON.parse(this.responseText)
  
  document.getElementById('howmany').innerText=data.length

  data.forEach((elem) => {

        var displayMessage = elem.description
       
        let node = document.createElement("LI");
        node.className = 'list-group-item list-group-item-action';
        var textnode = document.createTextNode(displayMessage);         // Create a text node
        node.appendChild(textnode);                              // Append the text to <li>
        listResults.appendChild(node);
    })
}

  
const cancellationsRequest = new XMLHttpRequest();
cancellationsRequest.onload = getCancellationsListener;
cancellationsRequest.open('get', '/cancellations');
cancellationsRequest.send();