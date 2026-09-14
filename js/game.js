import { db, collection, addDoc, serverTimestamp } from "./firebase.js";
import { POKEMON_NAMES } from "./pokemon-names.js";

const t = (key) => window.PDO_I18N.t(key);

const POKEDEX_TOTAL = 1025;
const OPTION_COUNT = 4;
const QUEUE_SIZE = 10;
const SPRITE_BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

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

// Pre-built encounters (name lookups are instant, only the sprite image needs
// a head start) so advancing to the next round never waits on the network.
const encounterQueue = [];
const preloadedImages = new Map(); // id -> Image, keeps the browser's own image cache warm

function randomId(exclude = new Set()) {
  let id;
  do {
    id = 1 + Math.floor(Math.random() * POKEDEX_TOTAL);
  } while (exclude.has(id));
  return id;
}

function pokemonName(id) {
  return POKEMON_NAMES[id - 1] || "???";
}

function preloadSprite(id) {
  if (preloadedImages.has(id)) return;
  const img = new Image();
  img.src = SPRITE_BASE_URL + id + ".png";
  preloadedImages.set(id, img);
}

function buildEncounter() {
  const correctId = randomId();
  const wrongIds = [];
  const used = new Set([correctId]);
  while (wrongIds.length < OPTION_COUNT - 1) {
    const id = randomId(used);
    used.add(id);
    wrongIds.push(id);
  }

  preloadSprite(correctId);
  return { correctId, optionIds: shuffle([correctId, ...wrongIds]) };
}

function fillQueue() {
  while (encounterQueue.length < QUEUE_SIZE) {
    encounterQueue.push(buildEncounter());
  }
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadNextEncounter() {
  optionsEl.innerHTML = "";
  nextBtn.hidden = true;
  awaitingNext = false;

  const encounter = encounterQueue.shift();
  fillQueue(); // top the buffer back up in the background for the round after this one

  currentAnswerId = encounter.correctId;

  spriteEl.classList.add("sprite-enter");
  spriteEl.src = SPRITE_BASE_URL + encounter.correctId + ".png";
  spriteEl.classList.add("silhouette");
  spriteEl.dataset.correctId = String(encounter.correctId);
  // Force the browser to register the "entering" state before removing it, so the fade-in actually plays.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => spriteEl.classList.remove("sprite-enter"));
  });

  encounter.optionIds.forEach((id, index) => {
    const btn = document.createElement("button");
    btn.textContent = pokemonName(id);
    btn.dataset.id = String(id);
    btn.className = "option-enter";
    btn.style.animationDelay = `${index * 40}ms`;
    btn.addEventListener("click", () => handleAnswer(id, btn));
    optionsEl.appendChild(btn);
  });

  stateEl.textContent = `${t("play_streak_label")} ${streak}`;
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
    stateEl.textContent = t("play_state_correct");
    setTimeout(loadNextEncounter, 900);
  } else {
    btnEl.classList.add("wrong");
    const correctBtn = buttons.find((b) => Number(b.dataset.id) === currentAnswerId);
    if (correctBtn) correctBtn.classList.add("correct");
    stateEl.textContent = t("play_state_wrong");
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
  submitStatusEl.textContent = t("play_submit_submitting");
  try {
    await addDoc(collection(db, "leaderboard"), {
      name,
      streak,
      deviceId: null,
      createdAt: serverTimestamp(),
    });
    submitStatusEl.textContent = t("play_submit_ok");
  } catch (err) {
    console.error(err);
    submitStatusEl.textContent = t("play_submit_error");
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
      shareBtn.textContent = t("play_share_copied");
      setTimeout(() => (shareBtn.textContent = t("play_share_copy_label")), 1500);
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

fillQueue();
loadNextEncounter();
