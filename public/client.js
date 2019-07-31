const findMeButton = document.querySelector('.findMe');
// findMeButton.addEventListener('click', findMe);

var x = document.getElementById("demo");
var synth = window.speechSynthesis;
let voices = [];
let selectedVoice;

function getLocation() {
  console.log('getLocation')
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude; 
}



function findMe(){
  getLocation();
  test();
}





const getStopDeparturesListener = function() {
  // parse our response to convert to JSON
  console.log('getStopDeparturesListener')
  let stopDepartures = JSON.parse(this.responseText);

  // iterate through every dream and add it to our page
  for(var stopDeparture in stopDepartures.Services){
    console.log(stopDeparture);
    console.log(stopDeparture.ServiceID);
    console.log(stopDeparture.ServiceID);
    console.log(stopDeparture.OperatorRef); // RAIL, TZM
    console.log(stopDeparture.Service.Name);
    console.log(stopDeparture.Service.Mode);
    console.log(stopDeparture.);
    
  }
}





function getStopDepartures(){
  const stopNumber = $('#stopNumber').val();
  console.log(stopNumber);
  const stopDeparturesRequest = new XMLHttpRequest();
  stopDeparturesRequest.onload = getStopDeparturesListener;
  stopDeparturesRequest.open('get', '/stopDepartures/' + stopNumber);
  stopDeparturesRequest.send();

}

function test(){
  const speech = new SpeechSynthesisUtterance("hello there - testing 1 2 3");
  speech.voice = selectedVoice;
  // speech.pitch = pitchInput.value;
  // speech.rate = rateInput.value;
  speechSynthesis.speak(speech);
}

$('#findMe').on('click', function(event) {
  // event.preventDefault(); // To prevent following the link (optional)
  findMe();
});

$('#getStopDepartures').on('click', function(event) {
  // event.preventDefault(); // To prevent following the link (optional)
  getStopDepartures();
});




const populateVoiceList = () => {
  if(voices.length !== speechSynthesis.getVoices().length){
    voices = speechSynthesis.getVoices();
    
    voices.map((voice, i) => {
      if(voice.lang == 'en-GB' || voice.lang == 'en-NZ' ){
      console.log(voice);
      console.log(voice.name);
        if(voice.name == 'Google UK English Female'){
          selectedVoice = voice;
        }
      }
    })
  }
}

populateVoiceList();