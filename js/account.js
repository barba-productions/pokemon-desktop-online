import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
} from "./firebase.js";

const POKEDEX_TOTAL = 1025;
const DEVICE_ID_PATTERN = /^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/i;

const authCard = document.getElementById("auth-card");
const dashboardCard = document.getElementById("dashboard-card");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const authErrorEl = document.getElementById("auth-error");
const logoutBtn = document.getElementById("logout-btn");
const userEmailEl = document.getElementById("user-email");

const deviceIdInput = document.getElementById("device-id-input");
const linkDeviceBtn = document.getElementById("link-device-btn");
const linkStatusEl = document.getElementById("link-status");
const statsSection = document.getElementById("stats-section");
const pokedexGrid = document.getElementById("pokedex-grid");

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isCaught(bytes, id) {
  const index = id - 1;
  const byteIndex = index >> 3;
  const bitMask = 1 << (index & 7);
  return byteIndex < bytes.length && (bytes[byteIndex] & bitMask) !== 0;
}

function renderStats(device) {
  document.getElementById("stat-score").textContent = device.lifetimeScore ?? 0;
  document.getElementById("stat-caught").textContent = `${device.caughtCount ?? 0} / ${POKEDEX_TOTAL}`;
  document.getElementById("stat-correct").textContent = device.totalCorrect ?? 0;
  document.getElementById("stat-wrong").textContent = device.totalWrong ?? 0;
  document.getElementById("stat-days").textContent = device.totalDaysPlayed ?? 0;
  document.getElementById("stat-trainer").textContent = device.trainerName || "-";

  pokedexGrid.innerHTML = "";
  const bytes = device.caughtBits ? base64ToBytes(device.caughtBits) : new Uint8Array(0);

  for (let id = 1; id <= POKEDEX_TOTAL; id++) {
    const cell = document.createElement("div");
    cell.className = "entry" + (isCaught(bytes, id) ? " caught" : "");
    cell.title = "#" + id;
    cell.textContent = isCaught(bytes, id) ? "#" + id : "";
    pokedexGrid.appendChild(cell);
  }

  statsSection.hidden = false;
}

async function loadLinkedDevice(uid) {
  const userSnap = await getDoc(doc(db, "users", uid));
  const linkedDeviceId = userSnap.exists() ? userSnap.data().linkedDeviceId : null;

  if (!linkedDeviceId) {
    linkStatusEl.textContent = "No device linked yet.";
    statsSection.hidden = true;
    return;
  }

  deviceIdInput.value = linkedDeviceId;
  linkStatusEl.textContent = `Linked to ${linkedDeviceId}`;

  const deviceSnap = await getDoc(doc(db, "devices", linkedDeviceId));
  if (!deviceSnap.exists()) {
    linkStatusEl.textContent = `Linked to ${linkedDeviceId}, but no stats received yet. Finish a game on your device first.`;
    statsSection.hidden = true;
    return;
  }

  renderStats(deviceSnap.data());
}

async function linkDevice() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const deviceId = deviceIdInput.value.trim().toUpperCase();
  if (!DEVICE_ID_PATTERN.test(deviceId)) {
    linkStatusEl.textContent = "That doesn't look like a valid Device ID (format AA:BB:CC:DD:EE:FF).";
    return;
  }

  linkStatusEl.textContent = "Linking...";
  try {
    await setDoc(doc(db, "users", uid), { linkedDeviceId: deviceId }, { merge: true });
    await loadLinkedDevice(uid);
  } catch (err) {
    console.error(err);
    linkStatusEl.textContent = "Could not link device. Try again.";
  }
}

async function login() {
  authErrorEl.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
  } catch (err) {
    authErrorEl.textContent = err.message;
  }
}

async function signup() {
  authErrorEl.textContent = "";
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
  } catch (err) {
    authErrorEl.textContent = err.message;
  }
}

async function logout() {
  await signOut(auth);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    authCard.hidden = true;
    dashboardCard.hidden = false;
    userEmailEl.textContent = user.email;
    loadLinkedDevice(user.uid);
  } else {
    authCard.hidden = false;
    dashboardCard.hidden = true;
  }
});

loginBtn.addEventListener("click", login);
signupBtn.addEventListener("click", signup);
logoutBtn.addEventListener("click", logout);
linkDeviceBtn.addEventListener("click", linkDevice);
