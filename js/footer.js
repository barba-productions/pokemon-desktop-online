import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const logoutBtn = document.getElementById("footer-logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
  onAuthStateChanged(auth, (user) => {
    logoutBtn.hidden = !user;
  });
}
