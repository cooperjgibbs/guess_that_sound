let guessCount = 0;
const maxGuesses = 5;
let idealAnswer = "";
let acceptableAnswers = [];
let soundsData = [];
let currentDayIndex = 0;
let currentGuess = [];

// Map extensions to MIME types
const audioFormats = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav"
};

function submitGuess() {
  const guess = currentGuess.join("").toLowerCase();
  const result = document.getElementById("result");
  const guessesLeft = document.getElementById("guessesLeft");

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
    localStorage.setItem(`soundHistory_day${currentDayIndex}`, guessCount);
    document.body.classList.remove("wrong");
    document.body.classList.add("correct");
    updateBadges(true);
    triggerCorrectEffect();
    refreshDropdown();
    ensureDayButtonClickable();
    disableKeyboard();
  } else if (remaining > 0) {
    result.textContent = `Nope, not "${guess}". Try again!`;
    result.classList.add("wrong");
    guessesLeft.textContent = `Guesses remaining: ${remaining}`;
    addWrongOverlay();
    updateBadges(false);
    clearGuess();
  } else {
    result.textContent = `Game over! It was ${idealAnswer}.`;
    result.classList.add("wrong");
    guessesLeft.textContent = "No guesses left.";
    localStorage.setItem(`soundHistory_day${currentDayIndex}`, -1);
    document.body.classList.remove("correct");
    document.body.classList.add("wrong");
    addWrongOverlay();
    updateBadges(false);
    refreshDropdown();
    ensureDayButtonClickable();
    disableKeyboard();
    setTimeout(() => showPopup(false), 500);
  }
}

function addWrongOverlay() {
  const overlays = document.getElementById("wrongOverlays");
  const overlay = document.createElement("div");
  overlay.className = "wrong-overlay";
  overlay.style.top = `${(guessCount - 1) * 20}%`;
  overlays.appendChild(overlay);
}

function updateBadges(isCorrect) {
  const badges = document.querySelectorAll(".badge");
  if (isCorrect) {
    badges.forEach(badge => badge.classList.add("correct"));
  } else {
    if (guessCount <= maxGuesses) {
      badges[guessCount - 1].classList.add("wrong");
    }
  }
}

function resetBadges() {
  const badges = document.querySelectorAll(".badge");
  badges.forEach(badge => badge.classList.remove("wrong", "correct"));
}

function triggerCorrectEffect() {
  triggerConfetti();
  const overlays = document.getElementById("wrongOverlays");
  const wrongOverlays = document.querySelectorAll(".wrong-overlay");
  for (let i = 0; i < 5; i++) {
    const greenOverlay = document.createElement("div");
    greenOverlay.className = "green-overlay";
    greenOverlay.style.bottom = `${i * 20}%`;
    overlays.appendChild(greenOverlay);
    setTimeout(() => {
      greenOverlay.classList.add("active");
      const redIndex = wrongOverlays.length - 1 - i;
      if (wrongOverlays[redIndex]) {
        wrongOverlays[redIndex].remove();
      }
    }, i * 1000);
  }
  setTimeout(() => {
    overlays.innerHTML = "";
    showPopup(true);
  }, 1000);
}

function triggerConfetti() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  script.onload = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
  setTimeout(() => popup.classList.add("active"), 10);
}

function showCompletedPopup(dayIndex, status) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popupMessage");
  const answer = soundsData[dayIndex]?.answer || "Unknown";
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
  setTimeout(() => popup.style.display = "none", 300);
}

function handleKeyPress(key) {
  if (key === "Enter") {
    if (currentGuess.length > 0) {
      submitGuess();
    }
    return;
  }
  if (key === "Backspace") {
    currentGuess.pop();
    updateGuessDisplay();
    return;
  }
  if (key === "Space") {
    if (currentGuess.length < 20) {
      currentGuess.push(" ");
      updateGuessDisplay();
    }
    return;
  }
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    if (currentGuess.length < 20) {
      currentGuess.push(key.toUpperCase());
      updateGuessDisplay();
    }
  }
}

function updateGuessDisplay() {
  const guessDisplay = document.getElementById("guessDisplay");
  guessDisplay.textContent = currentGuess.join("") || "";
}

function clearGuess() {
  currentGuess = [];
  updateGuessDisplay();
}

function disableKeyboard() {
  document.querySelectorAll(".key").forEach(key => key.disabled = true);
  document.getElementById("enterButton").disabled = true;
}

function enableKeyboard() {
  document.querySelectorAll(".key").forEach(key => key.disabled = false);
  document.getElementById("enterButton").disabled = false;
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
  currentGuess = [];
  document.getElementById("guessesLeft").textContent = `Guesses remaining: ${maxGuesses}`;
  document.getElementById("result").textContent = "";
  document.getElementById("result").classList.remove("correct", "wrong");
  updateGuessDisplay();
  audio.currentTime = 0;
  document.getElementById("wrongOverlays").innerHTML = "";
  resetBadges();
  enableKeyboard();
}

function loadSound(dayIndex) {
  const sound = soundsData[dayIndex];
  if (!sound) {
    console.error(`No sound data for day ${dayIndex}`);
    return;
  }

  audio.innerHTML = "";
  const source = document.createElement("source");
  source.src = sound.file;
  const extension = sound.file.split('.').pop().toLowerCase();
  source.type = audioFormats[extension] || "audio/mp4";
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
    updateBadges(true);
    disableKeyboard();
  } else if (status === -1) {
    document.body.classList.add("wrong");
    for (let i = 0; i < maxGuesses; i++) {
      document.querySelectorAll(".badge")[i].classList.add("wrong");
    }
    disableKeyboard();
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
        showCompletedPopup(index, status);
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

      const startDate = new Date("2025-04-10");
      const today = new Date();
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      currentDayIndex = daysSinceStart % data.length;

      loadSound(currentDayIndex);

      refreshDropdown();
      ensureDayButtonClickable();
      document.getElementById("popupClose").onclick = closePopup;
      document.getElementById("viewDays").onclick = () => {
        closePopup();
        document.getElementById("dayDropdown").style.display = "block";
      };

      // Enter button handler
      document.getElementById("enterButton").onclick = () => {
        if (currentGuess.length > 0) {
          submitGuess();
        }
      };

      // Keyboard click handlers
      document.querySelectorAll(".key").forEach(key => {
        key.onclick = () => handleKeyPress(key.dataset.key || key.textContent);
      });

      // Physical keyboard support
      document.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === "Backspace" || e.key === " " || /[a-zA-Z]/.test(e.key)) {
          handleKeyPress(e.key === " " ? "Space" : e.key);
        }
      });
    })
    .catch(error => {
      console.error("Error loading sounds:", error);
      idealAnswer = "dog barking";
      acceptableAnswers = ["dog barking", "barking", "dog", "bark"];
      audio.innerHTML = "";
      const source = document.createElement("source");
      source.src = "sounds/day1.m4a";
      source.type = "audio/mp4";
      audio.appendChild(source);
      audio.load();
      dayButton.textContent = "Day 1";
      ensureDayButtonClickable();
      document.getElementById("popupClose").onclick = closePopup;
      document.getElementById("viewDays").onclick = () => {
        closePopup();
        document.getElementById("dayDropdown").style.display = "block";
      };

      document.getElementById("enterButton").onclick = () => {
        if (currentGuess.length > 0) {
          submitGuess();
        }
      };

      document.querySelectorAll(".key").forEach(key => {
        key.onclick = () => handleKeyPress(key.dataset.key || key.textContent);
      });

      document.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === "Backspace" || e.key === " " || /[a-zA-Z]/.test(e.key)) {
          handleKeyPress(e.key === " " ? "Space" : e.key);
        }
      });
    });
}

document.addEventListener("DOMContentLoaded", loadDailySound);