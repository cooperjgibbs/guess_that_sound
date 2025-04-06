function submitGuess() {
  const guess = document.getElementById("guessInput").value.trim().toLowerCase();
  const result = document.getElementById("result");

  // Define the ideal answer and acceptable variations
  const idealAnswer = "dog barking"; // The "official" answer
  const acceptableAnswers = [
    "dog barking",  // Exact match
    "barking",      // Key component
    "dog",          // Partial match
    "bark",         // Short form
    "puppy barking" // Synonym/variation
    // Add more as needed
  ];

  result.classList.remove("correct", "wrong"); // Clear previous classes

  // Check for exact or close match
  let isCorrect = false;
  for (let answer of acceptableAnswers) {
    if (guess === answer || guess.includes(answer) || answer.includes(guess)) {
      isCorrect = true;
      break;
    }
  }

  if (isCorrect) {
    result.textContent = `Good guess! It’s ${idealAnswer}.`;
    result.classList.add("correct");
  } else {
    result.textContent = `Nope! It’s ${idealAnswer}, not "${guess}".`;
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