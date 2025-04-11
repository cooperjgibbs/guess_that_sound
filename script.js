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
  const guessWords = guess.split(/\s+/);
  for (let answer of acceptableAnswers) {
    const answerWords = answer.split(/\s+/);
    if (guess === answer || (guess.includes(answer) && answer.length >= 3)) {
      isCorrect = true;
      break;
    }
    for (let guessWord of guessWords) {
      if (answerWords.includes(guessWord) && guessWord.length >= 3) {
        isCorrect = true;
        break;
      }
    }
  }

  // Update UI
  result.classList.remove("correct", "wrong");
  if (isCorrect) {
    result.textContent = `Good guess! It’s ${idealAnswer}.`;
    result.classList.add("correct");
    guessesLeft.textContent = `You got it in ${guessCount} guess${guessCount > 1 ? "es" : ""}!`;
    submitButton.disabled = true;
    // Celebrate!
    triggerGreenFlash();
    triggerConfetti();
  } else if (remaining > 0) {
    result.textContent = `Nope, not "${guess}". Try again!`;
    result.classList.add("wrong");
    guessesLeft.textContent = `Guesses remaining: ${remaining}`;
  } else {
    result.textContent = `Game over! It was ${idealAnswer}.`;
    result.classList.add("wrong");
    guessesLeft.textContent = "No guesses left.";
    submitButton.disabled = true;
  }

  document.getElementById("guessInput").value = "";
}

// Green flash effect
function triggerGreenFlash() {
  document.body.classList.add("green-flash");
  setTimeout(() => {
    document.body.classList.remove("green-flash");
  }, 2000); // Flash for 1 second
}

// Confetti effect
function triggerConfetti() {
  // Dynamically load canvas-confetti
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  script.onload = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  document.head.appendChild(script);
}

// Limit audio to 5 seconds
const audio = document.getElementById("soundClip");
audio.addEventListener("timeupdate", () => {
  if (audio.currentTime > 5) {
    audio.pause();
    audio.currentTime = 0;
  }
});