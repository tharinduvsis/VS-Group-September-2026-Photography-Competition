/* ============================================================
   App logic. You shouldn't need to edit this file —
   all the settings you need live in config.js.
   ============================================================ */

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const PENDING_BALLOT_KEY = "vsisVotePendingBallot";
const MAX_VOTES = SITE_CONFIG.maxVotesPerPerson || 3;

let voteCounts = {};        // { photoId: number }  — deduped tally for the leaderboard
let myBallot = [];          // photoIds the signed-in user is currently selecting (pre-submit)
let mySubmittedVotes = null;// photoIds already submitted for this user, once known
let activePhoto = null;

const galleryEl = document.getElementById("gallery");
const emptyStateEl = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const totalVotesEl = document.getElementById("total-votes");
const totalPhotosEl = document.getElementById("total-photos");
const leaderboardSlotsEl = document.getElementById("leaderboard-slots");
const voteStatusEl = document.getElementById("vote-status");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalFrameNumber = document.getElementById("modal-frame-number");
const modalCaption = document.getElementById("modal-caption");
const voteBtn = document.getElementById("vote-btn");
const messageArea = document.getElementById("message-area");

const ballotBar = document.getElementById("ballot-bar");
const ballotCount = document.getElementById("ballot-count");
const ballotList = document.getElementById("ballot-list");
const ballotSubmitBtn = document.getElementById("ballot-submit-btn");

document.getElementById("competition-title").textContent = SITE_CONFIG.competitionTitle;
document.getElementById("max-votes-note").textContent =
  `Pick up to ${MAX_VOTES} favorites, then submit once. Sign in with your Google account to confirm your vote — one vote per account.`;
totalPhotosEl.textContent = PHOTOS.length;

/* ---------------- Gallery rendering ---------------- */

function renderGallery(filterText = "") {
  galleryEl.innerHTML = "";
  const filtered = PHOTOS.filter((p) => p.id.includes(filterText.trim()));
  emptyStateEl.hidden = filtered.length !== 0;

  filtered.forEach((photo) => {
    const btn = document.createElement("button");
    btn.className = "frame";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", `Frame ${photo.id}${photo.title ? ", " + photo.title : ""}`);
    btn.innerHTML = `
      <img src="${photo.file}" alt="${photo.title || "Submission " + photo.id}" loading="lazy" />
      <span class="frame-number">No. ${photo.id}</span>
      <span class="frame-votes" data-vote-badge="${photo.id}">${voteCounts[photo.id] || 0} votes</span>
    `;
    btn.addEventListener("click", () => openModal(photo));
    galleryEl.appendChild(btn);
  });
}

searchInput.addEventListener("input", (e) => renderGallery(e.target.value));

/* ---------------- Leaderboard (live) ---------------- */

function renderLeaderboard() {
  const ranked = Object.entries(voteCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (ranked.length === 0) {
    leaderboardSlotsEl.innerHTML = `<p class="leaderboard-empty">No votes yet — be the first.</p>`;
    return;
  }

  leaderboardSlotsEl.innerHTML = ranked
    .map(([photoId, count], i) => {
      const photo = PHOTOS.find((p) => p.id === photoId);
      return `
        <div class="leaderboard-slot ${i === 0 ? "rank-1" : ""}">
          <span class="slot-rank">${i + 1}</span>
          <div class="slot-info">
            <div class="slot-frame">Frame No. ${photoId}${photo && photo.title && photo.title !== `Submission ${photoId}` ? " — " + photo.title : ""}</div>
            <div class="slot-count">${count} vote${count === 1 ? "" : "s"}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function refreshVoteBadges() {
  PHOTOS.forEach((p) => {
    const badge = document.querySelector(`[data-vote-badge="${p.id}"]`);
    if (badge) badge.textContent = `${voteCounts[p.id] || 0} votes`;
  });
}

// Live listener: each doc is one person's ballot (deduped array of up to
// MAX_VOTES photoIds). Tally client-side. Bounded by employee headcount.
db.collection("votes").onSnapshot((snapshot) => {
  voteCounts = {};
  let total = 0;
  let mine = null;
  snapshot.forEach((doc) => {
    const data = doc.data();
    const unique = Array.from(new Set(data.photoIds || []));
    unique.forEach((id) => {
      voteCounts[id] = (voteCounts[id] || 0) + 1;
      total++;
    });
    if (auth.currentUser && doc.id === auth.currentUser.uid) mine = unique;
  });
  mySubmittedVotes = mine;
  totalVotesEl.textContent = total;
  renderLeaderboard();
  refreshVoteBadges();
  if (activePhoto) updateVoteArea();
  renderBallotBar();
});

/* ---------------- Modal ---------------- */

function openModal(photo) {
  activePhoto = photo;
  modalImage.src = photo.file;
  modalImage.alt = photo.title || `Submission ${photo.id}`;
  modalFrameNumber.textContent = `No. ${photo.id}`;
  modalTitle.textContent = photo.title || `Submission ${photo.id}`;
  modalCaption.textContent = photo.caption || "";
  messageArea.hidden = true;
  modalBackdrop.hidden = false;
  updateVoteArea();
}

function closeModal() {
  modalBackdrop.hidden = true;
  activePhoto = null;
}

document.getElementById("modal-close").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalBackdrop.hidden) closeModal();
});

function updateVoteArea() {
  if (!activePhoto) return;

  if (mySubmittedVotes) {
    voteBtn.disabled = true;
    voteBtn.textContent = mySubmittedVotes.includes(activePhoto.id)
      ? "One of your submitted picks"
      : "You've already submitted your votes";
    return;
  }

  const inBallot = myBallot.includes(activePhoto.id);
  voteBtn.disabled = false;
  voteBtn.textContent = inBallot ? "Remove from your picks" : "Add to your picks";
}

voteBtn.addEventListener("click", () => {
  if (!activePhoto || mySubmittedVotes) return;

  const idx = myBallot.indexOf(activePhoto.id);
  if (idx >= 0) {
    myBallot.splice(idx, 1);
  } else {
    if (myBallot.length >= MAX_VOTES) {
      showMessage(`You can only pick ${MAX_VOTES}. Remove one first if you'd like to swap it.`, "error");
      return;
    }
    myBallot.push(activePhoto.id);
  }
  updateVoteArea();
  renderBallotBar();
});

/* ---------------- Ballot bar ---------------- */

function renderBallotBar() {
  if (mySubmittedVotes) {
    ballotBar.hidden = false;
    ballotCount.textContent = "Votes submitted";
    ballotList.textContent = mySubmittedVotes.map((id) => "No. " + id).join("  ·  ");
    ballotSubmitBtn.hidden = true;
    return;
  }

  ballotBar.hidden = myBallot.length === 0;
  ballotCount.textContent = `${myBallot.length}/${MAX_VOTES} selected`;
  ballotList.textContent = myBallot.map((id) => "No. " + id).join("  ·  ");
  ballotSubmitBtn.hidden = false;
  ballotSubmitBtn.disabled = myBallot.length === 0;
}

ballotSubmitBtn.addEventListener("click", async () => {
  if (myBallot.length === 0 || mySubmittedVotes) return;

  if (auth.currentUser) {
    submitBallot();
    return;
  }

  // Not signed in yet — popup, then submit
  ballotSubmitBtn.disabled = true;
  try {
    window.localStorage.setItem(PENDING_BALLOT_KEY, JSON.stringify(myBallot));
    await signInWithGoogle();
    // onAuthStateChanged will pick up the pending ballot and call submitBallot()
  } catch (err) {
    console.error("Google sign-in failed:", err);
    alert("Google sign-in failed: " + (err.message || err.code || "unknown error"));
    ballotSubmitBtn.disabled = false;
  }
});

/* ---------------- Google sign-in ---------------- */

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return auth.signInWithPopup(provider);
}

async function submitBallot() {
  if (!auth.currentUser || myBallot.length === 0) return;

  const email = (auth.currentUser.email || "").toLowerCase();
  const domains = SITE_CONFIG.allowedEmailDomains || [];
  if (domains.length > 0) {
    const allowed = domains.some((d) => email.endsWith("@" + d));
    if (!allowed) {
      showMessage("That Google account isn't on a recognized company domain, so it can't be used to vote.", "error");
      await auth.signOut();
      return;
    }
  }

  ballotSubmitBtn.disabled = true;
  try {
    await db.collection("votes").doc(auth.currentUser.uid).set({
      photoIds: Array.from(new Set(myBallot)).slice(0, MAX_VOTES),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    window.localStorage.removeItem(PENDING_BALLOT_KEY);
    showMessage("Your votes are in. Thanks for taking part!", "success");
  } catch (err) {
    showMessage("Couldn't submit — you may have already voted, or your session expired.", "error");
    ballotSubmitBtn.disabled = false;
  }
}

function showMessage(text, type) {
  messageArea.hidden = false;
  messageArea.textContent = text;
  messageArea.className = "message-area " + (type || "");
}

/* ---------------- Auth state / redirect completion ---------------- */

auth.getRedirectResult().catch((err) => {
  showMessage(err.message || "Google sign-in didn't complete. Please try again.", "error");
});

auth.onAuthStateChanged((user) => {
  if (user) {
    voteStatusEl.textContent = `Signed in as ${user.email}`;

    const pending = window.localStorage.getItem(PENDING_BALLOT_KEY);
    if (pending && !mySubmittedVotes) {
      try {
        myBallot = JSON.parse(pending);
      } catch (e) {
        myBallot = [];
      }
      renderBallotBar();
      submitBallot();
    }
  } else {
    voteStatusEl.textContent = "";
  }
  if (activePhoto) updateVoteArea();
});

/* ---------------- Init ---------------- */

renderGallery();
renderBallotBar();
