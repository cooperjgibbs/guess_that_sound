let guessCount = 0;
const maxGuesses = 5;

function submitGuess() {
  const guess = document.getElementById("guessInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  const guessesLeft = document.getElementById("guessesLeft");
  const submitButton = document.querySelector("button");

  // Define the ideal answer and acceptable variations
  const idealAnswer = "dog barking";
  const acceptableAnswers = [
    "dog barking",
    "barking",
    "dog",
    "bark",
    "puppy barking"
  ];

  // Increment guess count
  guessCount++;
  const remaining = maxGuesses - guessCount;

  // Check for exact or close match
  let isCorrect = false;
  for (let answer of acceptableAnswers) {
    if (guess === answer || guess.includes(answer) || answer.includes(guess)) {
      isCorrect = true;
      break;
    }
  }

  // Update UI
  result.classList.remove("correct", "wrong");
  if (isCorrect) {
    result.textContent = `Good guess! It’s ${idealAnswer}.`;
    result.classList.add("correct");
    guessesLeft.textContent = `You got it in ${guessCount} guess${guessCount > 1 ? "es" : ""}!`;
    submitButton.disabled = true; // End game
  } else if (remaining > 0) {
    result.textContent = `Nope, not "${guess}". Try again!`;
    result.classList.add("wrong");
    guessesLeft.textContent = `Guesses remaining: ${remaining}`;
  } else {
    result.textContent = `Game over! It was ${idealAnswer}.`;
    result.classList.add("wrong");
    guessesLeft.textContent = "No guesses left.";
    submitButton.disabled = true; // End game
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