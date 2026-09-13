import { db, collection, query, orderBy, limit, getDocs } from "./firebase.js";

const listEl = document.getElementById("leaderboard-body");

async function loadLeaderboard() {
  listEl.innerHTML = `<tr><td colspan="2">Loading...</td></tr>`;
  try {
    const q = query(collection(db, "leaderboard"), orderBy("streak", "desc"), limit(20));
    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.innerHTML = `<tr><td colspan="2">No scores yet. Be the first!</td></tr>`;
      return;
    }

    listEl.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `<td>${data.name ?? "Trainer"}</td><td>${data.streak ?? 0}</td>`;
      listEl.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<tr><td colspan="2">Could not load leaderboard (is Firebase configured yet?).</td></tr>`;
  }
}

loadLeaderboard();
