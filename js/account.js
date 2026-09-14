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
// Same custom alphabet/algorithm as generateActivationCode() in activationHelper.ino.
const ACTIVATION_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const ACTIVATION_CODE_PATTERN = /^[23456789A-HJ-NP-Z]{3}-[23456789A-HJ-NP-Z]{4}-[23456789A-HJ-NP-Z]{3}$/i;
const t = (key) => window.PDO_I18N.t(key);

// Reverses generateActivationCode()/decodeActivationCodeToMac() to recover the
// device's MAC-based ID (the key used for devices/{deviceId} in Firestore).
function decodeActivationCode(code) {
  const compact = code.toUpperCase().replace(/-/g, "");
  if (compact.length !== 10) return null;

  const base = BigInt(ACTIVATION_CODE_ALPHABET.length);
  let reversedMac = 0n;
  for (const ch of compact) {
    const value = ACTIVATION_CODE_ALPHABET.indexOf(ch);
    if (value < 0) return null;
    reversedMac = reversedMac * base + BigInt(value);
  }

  let mac = 0n;
  for (let i = 0; i < 6; i++) {
    const b = (reversedMac >> BigInt(8 * i)) & 0xffn;
    mac = (mac << 8n) | b;
  }

  const hex = mac.toString(16).toUpperCase().padStart(12, "0");
  const bytes = [];
  for (let i = 0; i < 12; i += 2) bytes.push(hex.slice(i, i + 2));
  return bytes.join(":");
}

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
  const userData = userSnap.exists() ? userSnap.data() : {};
  const linkedDeviceId = userData.linkedDeviceId || null;

  if (!linkedDeviceId) {
    linkStatusEl.textContent = t("link_status_none");
    statsSection.hidden = true;
    return;
  }

  deviceIdInput.value = userData.linkedActivationCode || "";
  linkStatusEl.textContent = t("link_status_linked");

  const deviceSnap = await getDoc(doc(db, "devices", linkedDeviceId));
  if (!deviceSnap.exists()) {
    linkStatusEl.textContent = t("link_status_no_stats");
    statsSection.hidden = true;
    return;
  }

  renderStats(deviceSnap.data());
}

async function linkDevice() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const activationCode = deviceIdInput.value.trim().toUpperCase();
  if (!ACTIVATION_CODE_PATTERN.test(activationCode)) {
    linkStatusEl.textContent = t("link_status_invalid");
    return;
  }

  const deviceId = decodeActivationCode(activationCode);
  if (!deviceId) {
    linkStatusEl.textContent = t("link_status_invalid");
    return;
  }

  linkStatusEl.textContent = t("link_status_linking");
  try {
    await setDoc(
      doc(db, "users", uid),
      { linkedDeviceId: deviceId, linkedActivationCode: activationCode },
      { merge: true }
    );
    await loadLinkedDevice(uid);
  } catch (err) {
    console.error(err);
    linkStatusEl.textContent = t("link_status_error");
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
