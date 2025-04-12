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
    submitButton.disabled = true;
    localStorage.setItem(`soundHistory_day${currentDayIndex}`, guessCount);
    document.body.classList.remove("wrong");
    document.body.classList.add("correct");
    triggerCorrectEffect(); // Green fill + confetti + popup
    refreshDropdown();
    ensureDayButtonClickable();
  } else if (remaining > 0) {
    result.textContent = `Nope, not "${guess}". Try again!`;
    result.classList.add("wrong");
    guessesLeft.textContent = `Guesses remaining: ${remaining}`;
    addWrongOverlay();
  } else {
    result.textContent = `Game over! It was ${idealAnswer}.`;
    result.classList.add("wrong");
    guessesLeft.textContent = "No guesses left.";
    submitButton.disabled = true;
    localStorage.setItem(`soundHistory_day${currentDayIndex}`, -1);
    document.body.classList.remove("correct");
    document.body.classList.add("wrong");
    addWrongOverlay();
    refreshDropdown();
    ensureDayButtonClickable();
    setTimeout(() => showPopup(false), 500); // Popup after red overlay
  }

  document.getElementById("guessInput").value = "";
}

function addWrongOverlay() {
  const overlays = document.getElementById("wrongOverlays");
  const overlay = document.createElement("div");
  overlay.className = "wrong-overlay";
  overlay.style.top = `${(guessCount - 1) * 20}%`;
  overlays.appendChild(overlay);
}

function triggerCorrectEffect() {
  triggerConfetti();
  const overlays = document.getElementById("wrongOverlays");
  overlays.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const overlay = document.createElement("div");
    overlay.className = "green-overlay";
    overlay.style.bottom = `${i * 20}%`;
    overlays.appendChild(overlay);
    setTimeout(() => overlay.classList.add("active"), i * 1000);
  }
  setTimeout(() => {
    overlays.innerHTML = "";
    showPopup(true); // Popup after green animation
  }, 5000);
}

function triggerConfetti() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  script.onload = () => {
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  };
  document.head.appendChild(script);
}

function showPopup(isCorrect) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popupMessage");
  if (isCorrect) {
    popupMessage.textContent = `Day ${currentDayIndex + 1}: Correct!\nYou got "${idealAnswer}" in ${guessCount} guess${guessCount > 1 ? "es" : ""}!`;
  } else {
    popupMessage.textContent = `Day ${currentDayIndex + 1}: Game Over!\nThe answer was "${idealAnswer}".`;
  }
  popup.style.display = "flex";
  setTimeout(() => popup.classList.add("active"), 10); // Trigger animation
}

function showCompletedPopup(dayIndex, status) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popupMessage");
  const answer = soundsData[dayIndex].answer;
  if (status > 0) {
    popupMessage.textContent = `Day ${dayIndex + 1}: Correct!\nYou got "${answer}" in ${status} guess${status > 1 ? "es" : ""}!`;
  } else {
    popupMessage.textContent = `Day ${dayIndex + 1}: Game Over!\nThe answer was "${answer}".`;
  }
  popup.style.display = "flex";
  setTimeout(() => popup.classList.add("active"), 10);
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.classList.remove("active");
  setTimeout(() => popup.style.display = "none", 300); // Match transition
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
  audio.currentTime = 0;
  document.getElementById("wrongOverlays").innerHTML = "";
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
  resetGame();

  const status = parseInt(localStorage.getItem(`soundHistory_day${dayIndex}`)) || 0;
  document.body.classList.remove("correct", "wrong");
  if (status > 0) {
    document.body.classList.add("correct");
  } else if (status === -1) {
    document.body.classList.add("wrong");
  }
  ensureDayButtonClickable();
}

function ensureDayButtonClickable() {
  const dayButton = document.getElementById("dayButton");
  const dayDropdown = document.getElementById("dayDropdown");
  dayButton.style.pointerEvents = "auto";
  dayButton.onclick = () => {
    dayDropdown.style.display = dayDropdown.style.display === "none" ? "block" : "none";
  };
}

function refreshDropdown() {
  const dayList = document.getElementById("dayList");
  dayList.innerHTML = "";
  soundsData.forEach((sound, index) => {
    const dayItem = document.createElement("div");
    dayItem.textContent = `Day ${index + 1}`;
    const status = parseInt(localStorage.getItem(`soundHistory_day${index}`)) || 0;
    dayItem.className = status === -1 ? "wrong" : status > 0 ? "correct" : "not-played";
    dayItem.onclick = () => {
      if (status !== 0) {
        showCompletedPopup(index, status); // Popup for completed days
      }
      loadSound(index);
      document.getElementById("dayDropdown").style.display = "none";
    };
    dayList.appendChild(dayItem);
  });
}

function loadDailySound() {
  const dayButton = document.getElementById("dayButton");
  const dayDropdown = document.getElementById("dayDropdown");
  const dayList = document.getElementById("dayList");

  fetch("sounds.json")
    .then(response => response.json())
    .then(data => {
      soundsData = data;

      const startDate = new Date("2025-04-06");
      const today = new Date();
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      currentDayIndex = daysSinceStart % data.length;

      loadSound(currentDayIndex);

      refreshDropdown();
      ensureDayButtonClickable();
      document.getElementById("popupClose").onclick = closePopup;
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
      ensureDayButtonClickable();
      document.getElementById("popupClose").onclick = closePopup;
    });
}

document.addEventListener("DOMContentLoaded", loadDailySound);