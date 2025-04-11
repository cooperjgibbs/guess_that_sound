let guessCount = 0;
const maxGuesses = 5;
let idealAnswer = "";
let acceptableAnswers = [];
let soundsData = [];
let currentDayIndex = 0;

function submitGuess() {
  const guess = document.getElementById("guessInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  const guessesLeft = document.getElementById("guessesLeft");
  const submitButton = document.querySelector("button[type='submit']");

  guessCount++;
  const remaining = maxGuesses - guessCount;

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

  result.classList.remove("correct", "wrong");
  if (isCorrect) {
    result.textContent = `Good guess! It’s ${idealAnswer}.`;
    result.classList.add("correct");
    guessesLeft.textContent = `You got it in ${guessCount} guess${guessCount > 1 ? "es" : ""}!`;
    submitButton.disabled = true; // Disable submit, but day selection stays active
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

function triggerGreenFlash() {
  document.body.classList.add("green-flash");
  setTimeout(() => document.body.classList.remove("green-flash"), 1000);
}

function triggerConfetti() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  script.onload = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };
  document.head.appendChild(script);
}

const audio = document.getElementById("soundClip");
audio.addEventListener("timeupdate", () => {
  if (audio.currentTime > 5) {
    audio.pause();
    audio.currentTime = 0;
  }
});

function resetGame() {
  guessCount = 0;
  document.getElementById("guessesLeft").textContent = `Guesses remaining: ${maxGuesses}`;
  document.getElementById("result").textContent = "";
  document.getElementById("result").classList.remove("correct", "wrong");
  document.querySelector("button[type='submit']").disabled = false;
  document.getElementById("guessInput").value = "";
  audio.currentTime = 0; // Reset audio to start
}

function loadSound(dayIndex) {
  const sound = soundsData[dayIndex];
  if (!sound) return;

  audio.innerHTML = "";
  const source = document.createElement("source");
  source.src = sound.file;
  source.type = "audio/mp3";
  audio.appendChild(source);
  audio.load();

  idealAnswer = sound.answer;
  acceptableAnswers = sound.acceptable;

  currentDayIndex = dayIndex;
  document.getElementById("dayButton").textContent = `Day ${dayIndex + 1}`;
  resetGame(); // Always reset, even after a correct answer
}

function loadDailySound() {
  const dayButton = document.getElementById("dayButton");
  const dayDropdown = document.getElementById("dayDropdown");
  const dayList = document.getElementById("dayList");

  fetch("sounds.json")
    .then(response => response.json())
    .then(data => {
      soundsData = data;

      // Calculate current day
      const startDate = new Date("2025-04-10");
      const today = new Date();
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      currentDayIndex = daysSinceStart % data.length;

      // Load initial sound
      loadSound(currentDayIndex);

      // Populate dropdown
      dayList.innerHTML = "";
      data.forEach((sound, index) => {
        const dayItem = document.createElement("div");
        dayItem.textContent = `Day ${index + 1}`;
        dayItem.onclick = () => {
          loadSound(index);
          dayDropdown.style.display = "none";
        };
        dayList.appendChild(dayItem);
      });

      // Ensure day button toggle works independently
      dayButton.onclick = () => {
        dayDropdown.style.display = dayDropdown.style.display === "none" ? "block" : "none";
      };
    })
    .catch(error => {
      console.error("Error loading sounds:", error);
      idealAnswer = "dog barking";
      acceptableAnswers = ["dog barking", "barking", "dog", "bark"];
      audio.innerHTML = "";
      const source = document.createElement("source");
      source.src = "sounds/day1.mp3";
      source.type = "audio/mp3";
      audio.appendChild(source);
      audio.load();
      dayButton.textContent = "Day 1";
    });
}

document.addEventListener("DOMContentLoaded", loadDailySound);