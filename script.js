/* =========================================================
   Fake Treasure Hunt — script
   Plays a fake "decrypting your clue" sequence, then reveals the joke.
   ========================================================= */

// ---------- Settings (all times in milliseconds) ----------
const SETTINGS = {
  verifyTime: 2000,      // "Verifying QR Code..."
  verifiedBarTime: 1600, // bar after "QR Verified"
  decryptBarTime: 2400,  // bar during "Decrypting first clue..."
  grantedPause: 1000,    // pause on "Access Granted"
  particleCount: 28
};

// ---------- Grab the page elements we need ----------
const loadingStage  = document.getElementById("loadingStage");
const revealStage   = document.getElementById("revealStage");
const statusBlock   = document.getElementById("statusBlock");
const statusIcon    = document.getElementById("statusIcon");
const statusText    = document.getElementById("statusText");
const cipherLine    = document.getElementById("cipher");
const progressBox   = document.getElementById("progress");
const progressFill  = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const retryButton   = document.getElementById("retryBtn");
const particleLayer = document.getElementById("particles");

let isRunning = false;   // stops the sequence from starting twice
let cipherTimer = null;  // interval id for the scrambling text

// ---------- Small helpers ----------

// Pause inside an async function: await wait(1000)
function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

// Change the status text/icon and replay the fade animation
// tone: "working" (cyan), "success" (green) or "gold"
function setStatus(text, icon, tone) {
  statusText.textContent = text;
  statusIcon.textContent = icon;
  statusBlock.dataset.tone = tone;

  statusBlock.classList.remove("swap");
  void statusBlock.offsetWidth; // forces the browser to restart the animation
  statusBlock.classList.add("swap");
}

// Fill the progress bar from 0% to 100% over `duration` ms
function runProgressBar(duration) {
  progressBox.hidden = false;
  progressLabel.hidden = false;

  return new Promise(function (resolve) {
    const startTime = performance.now();

    function updateFrame(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease-in-out
      const percent = Math.round(eased * 100);

      progressFill.style.width = percent + "%";
      progressLabel.textContent = percent + "%";

      if (t < 1) {
        requestAnimationFrame(updateFrame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(updateFrame);
  });
}

function hideProgressBar() {
  progressBox.hidden = true;
  progressLabel.hidden = true;
  progressFill.style.width = "0%";
}

// Random scrambling characters to look like decryption
function startCipher() {
  const characters = "01ABCDEF#$%&@";
  cipherLine.hidden = false;
  cipherTimer = setInterval(function () {
    let scrambled = "";
    for (let i = 0; i < 16; i++) {
      scrambled += characters[Math.floor(Math.random() * characters.length)];
    }
    cipherLine.textContent = scrambled;
  }, 70);
}

function stopCipher() {
  clearInterval(cipherTimer);
  cipherLine.hidden = true;
}

// ---------- The main fake-loading sequence ----------
async function runSequence() {
  if (isRunning) return;
  isRunning = true;

  // Reset the screen
  revealStage.hidden = true;
  loadingStage.hidden = false;
  hideProgressBar();

  // 1) Verifying
  setStatus("Verifying QR Code...", "📱", "working");
  await wait(SETTINGS.verifyTime);

  // 2) Verified + first bar
  setStatus("✓ QR Verified", "✓", "success");
  await runProgressBar(SETTINGS.verifiedBarTime);
  hideProgressBar();

  // 3) Decrypting + second bar
  setStatus("Decrypting first clue...", "🔐", "working");
  startCipher();
  await runProgressBar(SETTINGS.decryptBarTime);
  stopCipher();
  hideProgressBar();

  // 4) Access granted (pause 1 second)
  setStatus("Access Granted", "🔓", "gold");
  await wait(SETTINGS.grantedPause);

  // 5) The joke!
  loadingStage.hidden = true;
  revealStage.hidden = false; // un-hiding replays the fade-in animations
  isRunning = false;
}

// ---------- Retry button ----------
retryButton.addEventListener("click", function () {
  // Click "pop" animation (class is removed when it finishes so it can replay)
  retryButton.classList.add("pop");
  retryButton.addEventListener("animationend", function () {
    retryButton.classList.remove("pop");
  }, { once: true });

  // Short delay so the pop is visible before the screen changes
  setTimeout(runSequence, 250);
});

// ---------- Floating glowing particles ----------
function createParticles() {
  const colors = ["#3de8ff", "#8b6bff", "#ffc94d"];

  for (let i = 0; i < SETTINGS.particleCount; i++) {
    const particle = document.createElement("span");
    const size = 3 + Math.random() * 5; // 3–8px

    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.setProperty("--particle-color", colors[i % colors.length]);
    particle.style.setProperty("--duration", 9 + Math.random() * 10 + "s");
    particle.style.setProperty("--delay", -Math.random() * 15 + "s"); // negative = already mid-flight at load
    particle.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");

    particleLayer.appendChild(particle);
  }
}

// ---------- Start everything ----------
createParticles();
runSequence();
