import { auth, db, onAuthStateChanged, doc, getDoc } from "./firebase.js";

const syncTitleEl = document.getElementById("sync-card-title");
const syncTextEl = document.getElementById("sync-card-text");
const syncBtnEl = document.getElementById("sync-card-btn");
const pokedexBtnEl = document.getElementById("sync-card-pokedex-btn");

function setSyncTitleKey(key) {
  syncTitleEl.setAttribute("data-i18n", key);
  window.PDO_I18N.applyI18n();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    setSyncTitleKey("card_sync_title");
    syncTextEl.hidden = false;
    syncBtnEl.hidden = false;
    pokedexBtnEl.hidden = true;
    return;
  }

  // Logged in: the descriptive text/login button are no longer relevant, link straight to the Pokedex.
  syncTextEl.hidden = true;
  syncBtnEl.hidden = true;
  pokedexBtnEl.hidden = false;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    const linked = snap.exists() && Boolean(snap.data().linkedDeviceId);
    setSyncTitleKey(linked ? "card_sync_title_synced" : "card_sync_title");
  } catch (err) {
    console.error(err);
    setSyncTitleKey("card_sync_title");
  }
});
