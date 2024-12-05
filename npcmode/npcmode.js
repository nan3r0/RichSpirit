
var input = document.getElementById("input");
function clr(){
   input.value = '';
}
function typing(x){
   input.value += x;
}

const timerElement = document.getElementById('timer');

let timeLeft = 30; // Adjust the time in seconds as needed

const timerInterval = setInterval(() => {
  timerElement.textContent = `Time remaining: ${timeLeft} seconds`;
  timeLeft--;

  if (timeLeft < 0) {
    clearInterval(timerInterval);
    window.location.href = '../modes/modeselection.html'; // Replace with the actual URL
  }
}, 1000);