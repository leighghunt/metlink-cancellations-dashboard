const findMeButton = document.querySelector('.findMe');
findMeButton.addEventListener('click', findMe);

var x = document.getElementById("demo");
var synth = window.speechSynthesis;

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


function test(){
  const speech = new SpeechSynthesisUtterance("hello there - testing 1 2 3");
  // speech.voice = voice;
  // speech.pitch = pitchInput.value;
  // speech.rate = rateInput.value;
  speechSynthesis.speak(speech);
}
