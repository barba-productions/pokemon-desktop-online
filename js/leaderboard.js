import { db, collection, query, orderBy, limit, getDocs } from "./firebase.js";

const t = (key) => window.PDO_I18N.t(key);
const listEl = document.getElementById("leaderboard-body");

function formatDate(createdAt) {
  if (!createdAt || typeof createdAt.toDate !== "function") return "-";
  const d = createdAt.toDate();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

async function loadLeaderboard() {
  listEl.innerHTML = `<tr><td colspan="3">${t("leaderboard_loading")}</td></tr>`;
  try {
    const q = query(collection(db, "leaderboard"), orderBy("streak", "desc"), limit(20));
    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.innerHTML = `<tr><td colspan="3">${t("leaderboard_empty")}</td></tr>`;
      return;
    }

    listEl.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `<td>${data.name ?? "Trainer"}</td><td>${data.streak ?? 0}</td><td>${formatDate(data.createdAt)}</td>`;
      listEl.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<tr><td colspan="3">${t("leaderboard_error")}</td></tr>`;
  }
}

loadLeaderboard();
