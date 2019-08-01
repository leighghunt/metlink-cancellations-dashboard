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





const populateVoiceList = () => {
  console.log('populateVoiceList');
  console.log(speechSynthesis.getVoices());
  if(voices.length !== speechSynthesis.getVoices().length){
    voices = speechSynthesis.getVoices();
    
    voices.map((voice, i) => {
      if(voice.lang == 'en-GB' || voice.lang == 'en-NZ' ){
      console.log(voice);
      console.log(voice.name);
        if(voice.name == 'Google UK English Female'){
          selectedVoice = voice;
          console.log(voice.name);
        }
      }
    })
  }
}

populateVoiceList();



const getStopDeparturesListener = function() {
  // parse our response to convert to JSON
  console.log('getStopDeparturesListener')
  let stopDepartures = JSON.parse(this.responseText);
  
  let nextDeparture = null;

  let announced = false;
  let announcementCutoffSeconds = 600;
  let now = new moment();

  
  stopDepartures.Services.forEach(function(stopDeparture){
    
    let expectedDeparture = new moment(stopDeparture.DisplayDeparture);

    if(!nextDeparture || expectedDeparture < nextDeparture){
      nextDeparture = expectedDeparture;
    }

    let calculatedDepartureSeconds = (expectedDeparture - now)/1000;

    // console.log('calculatedDepartureSeconds');
    // console.log(calculatedDepartureSeconds);
    // console.log('stopDeparture.DisplayDepartureSeconds')
    // console.log(stopDeparture.DisplayDepartureSeconds)
    
    if(calculatedDepartureSeconds < announcementCutoffSeconds){
      
      let message = describeService(stopDeparture);
    
      const speech = new SpeechSynthesisUtterance(message);
      speech.voice = selectedVoice;
      speechSynthesis.speak(speech);
      
      announced = true;
      
    }    
    
  });
  
  if(!announced){
    message = 'There are no departures in the next ' + moment.duration(announcementCutoffSeconds , "seconds").humanize();
    message += '.\n The next service is in ' + moment.duration((nextDeparture - new moment())/1000, "seconds").humanize();
    console.log(message);
    const speech = new SpeechSynthesisUtterance(message);
    speech.voice = selectedVoice;
    speechSynthesis.speak(speech);

  }
}


function describeService(service){

  let now = new moment();
  let expectedDeparture = new moment(service.DisplayDeparture);
  let calculatedDepartureSeconds = (expectedDeparture - now)/1000;

  let message = 'The '  + service.Service.Mode + ' from ' + service.OriginStopName + ' to ' + service.DestinationStopName + ' is departing in ' + moment.duration(calculatedDepartureSeconds, "seconds").humanize();

  console.log(message);

  message = message.replace('WgtnStn', 'Wellington')
  message = message.replace('WELL-All stops', 'Wellington (all stops)')
  message = message.replace('JOHN-All stops', 'Johnsonville (all stops)')
  message = message.replace('UPPE', 'Upper Hutt')
  message = message.replace('WaikanaeStn', 'Whycan-i')
  message = message.replace('WAIK - All stops', 'Whycan-i (all stops)')
  message = message.replace('Waikanae', 'whycan-i')
  message = message.replace('Papakowhai', 'pahpah-co fi')
  message = message.replace('Paremata', 'Para-mata')
  message = message.replace('Whitby-NavigationDr', 'Whitby, Navigation Drive')

  console.log(message);
  
  return message;
}


function getStopDepartures(){
  populateVoiceList();
  const speech = new SpeechSynthesisUtterance("Checking...");
  speech.voice = selectedVoice;
  speechSynthesis.speak(speech);

  const stopNumber = $('#stopNumber').val().toUpperCase();
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



