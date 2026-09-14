import { auth, db, onAuthStateChanged, doc, getDoc } from "./firebase.js";

const syncTitleEl = document.getElementById("sync-card-title");

function setSyncTitleKey(key) {
  syncTitleEl.setAttribute("data-i18n", key);
  window.PDO_I18N.applyI18n();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    setSyncTitleKey("card_sync_title");
    return;
  }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    const linked = snap.exists() && Boolean(snap.data().linkedDeviceId);
    setSyncTitleKey(linked ? "card_sync_title_synced" : "card_sync_title");
  } catch (err) {
    console.error(err);
    setSyncTitleKey("card_sync_title");
  }
});
