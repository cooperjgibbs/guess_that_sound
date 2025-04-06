function submitGuess() {
  const guess = document.getElementById("guessInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  const correctAnswer = "dog barking"; // Replace with your actual answer

  result.classList.remove("correct", "wrong"); // Clear previous classes
  if (guess === correctAnswer) {
    result.textContent = `Nice one! It’s ${correctAnswer}!`;
    result.classList.add("correct");
  } else {
    result.textContent = `Nope! It’s ${correctAnswer}, not "${guess}".`;
    result.classList.add("wrong");
  }
  document.getElementById("guessInput").value = ""; // Clear input
}

// Limit audio to 5 seconds
const audio = document.getElementById("soundClip");
audio.addEventListener("timeupdate", () => {
  if (audio.currentTime > 5) {
    audio.pause();
    audio.currentTime = 0;
  }
});