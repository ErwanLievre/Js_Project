function hudSetLives(lives) {
  const el = document.getElementById("hudLives");
  if (!el) return;
  el.innerHTML = "";
  for (let i = 0; i < lives; i++) el.innerHTML += "❤️";
  if (lives === 0) el.textContent = "💀";
}

function hudSetScore(score) {
  const el = document.getElementById("hudScore");
  if (el) el.textContent = `Score: ${score}`;
}

function hudSetTime(sec) {
  const el = document.getElementById("hudTime");
  if (el) el.textContent = `⏱ ${fmtTime(sec)}`;
}

function hudSetKills(n) {
  const el = document.getElementById("hudKills");
  if (el) el.textContent = `☠ ${n}`;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
