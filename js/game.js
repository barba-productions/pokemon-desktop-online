import { db, collection, addDoc, serverTimestamp } from "./firebase.js";

const POKEDEX_TOTAL = 1025;
const OPTION_COUNT = 4;
const SPRITE_BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

const spriteEl = document.getElementById("sprite");
const optionsEl = document.getElementById("options");
const streakEl = document.getElementById("streak");
const stateEl = document.getElementById("game-state");
const nextBtn = document.getElementById("next-btn");
const gameOverCard = document.getElementById("game-over");
const finalStreakEl = document.getElementById("final-streak");
const nameInput = document.getElementById("player-name");
const submitScoreBtn = document.getElementById("submit-score-btn");
const submitStatusEl = document.getElementById("submit-status");
const shareBtn = document.getElementById("share-btn");
const playAgainBtn = document.getElementById("play-again-btn");

let streak = 0;
let currentAnswerId = null;
let awaitingNext = false;

function randomId(exclude = new Set()) {
  let id;
  do {
    id = 1 + Math.floor(Math.random() * POKEDEX_TOTAL);
  } while (exclude.has(id));
  return id;
}

function formatName(rawName) {
  return rawName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function fetchPokemonName(id) {
  const res = await fetch(POKEAPI_BASE_URL + id);
  if (!res.ok) throw new Error("PokeAPI request failed: " + res.status);
  const data = await res.json();
  return formatName(data.name);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function loadNextEncounter() {
  stateEl.textContent = "Loading...";
  optionsEl.innerHTML = "";
  nextBtn.hidden = true;
  awaitingNext = false;

  const correctId = randomId();
  currentAnswerId = correctId;

  const wrongIds = [];
  const used = new Set([correctId]);
  while (wrongIds.length < OPTION_COUNT - 1) {
    const id = randomId(used);
    used.add(id);
    wrongIds.push(id);
  }

  const allIds = shuffle([correctId, ...wrongIds]);
  const names = await Promise.all(allIds.map((id) => fetchPokemonName(id)));

  spriteEl.src = SPRITE_BASE_URL + correctId + ".png";
  spriteEl.classList.add("silhouette");
  spriteEl.dataset.correctId = String(correctId);

  optionsEl.innerHTML = "";
  allIds.forEach((id, index) => {
    const btn = document.createElement("button");
    btn.textContent = names[index];
    btn.dataset.id = String(id);
    btn.addEventListener("click", () => handleAnswer(id, btn));
    optionsEl.appendChild(btn);
  });

  stateEl.textContent = `Streak: ${streak}`;
}

function handleAnswer(chosenId, btnEl) {
  if (awaitingNext) return;
  awaitingNext = true;

  spriteEl.classList.remove("silhouette");

  const buttons = [...optionsEl.querySelectorAll("button")];
  buttons.forEach((b) => (b.disabled = true));

  const correct = chosenId === currentAnswerId;
  if (correct) {
    btnEl.classList.add("correct");
    streak += 1;
    streakEl.textContent = String(streak);
    stateEl.textContent = "Correct! Next Pokemon...";
    setTimeout(loadNextEncounter, 900);
  } else {
    btnEl.classList.add("wrong");
    const correctBtn = buttons.find((b) => Number(b.dataset.id) === currentAnswerId);
    if (correctBtn) correctBtn.classList.add("correct");
    stateEl.textContent = "Wrong! Game over.";
    endGame();
  }
}

function endGame() {
  finalStreakEl.textContent = String(streak);
  gameOverCard.hidden = false;
  submitStatusEl.textContent = "";
  submitScoreBtn.disabled = false;
}

async function submitScore() {
  const name = (nameInput.value || "Trainer").trim().slice(0, 20) || "Trainer";
  submitScoreBtn.disabled = true;
  submitStatusEl.textContent = "Submitting...";
  try {
    await addDoc(collection(db, "leaderboard"), {
      name,
      streak,
      deviceId: null,
      createdAt: serverTimestamp(),
    });
    submitStatusEl.textContent = "Score submitted! Check the leaderboard.";
  } catch (err) {
    console.error(err);
    submitStatusEl.textContent = "Could not submit score (is Firebase configured yet?).";
    submitScoreBtn.disabled = false;
  }
}

function shareScore() {
  const text = `I got a streak of ${streak} on Pokemon Desktop Online! Can you beat it?`;
  const url = window.location.origin + window.location.pathname;

  if (navigator.share) {
    navigator.share({ title: "Pokemon Desktop Online", text, url }).catch(() => {});
    return;
  }

  navigator.clipboard
    .writeText(`${text} ${url}`)
    .then(() => {
      shareBtn.textContent = "Copied!";
      setTimeout(() => (shareBtn.textContent = "Copy share text"), 1500);
    })
    .catch(() => {});
}

function restart() {
  streak = 0;
  streakEl.textContent = "0";
  gameOverCard.hidden = true;
  loadNextEncounter();
}

submitScoreBtn.addEventListener("click", submitScore);
shareBtn.addEventListener("click", shareScore);
playAgainBtn.addEventListener("click", restart);

loadNextEncounter();
