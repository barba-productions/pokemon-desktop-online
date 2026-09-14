import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const logoutBtn = document.getElementById("footer-logout-btn");
const navAccountLink = document.getElementById("nav-account-link");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
}

onAuthStateChanged(auth, (user) => {
  if (logoutBtn) logoutBtn.hidden = !user;

  if (navAccountLink) {
    navAccountLink.setAttribute("data-i18n", user ? "nav_account" : "nav_account_login");
    window.PDO_I18N.applyI18n();
  }
});
