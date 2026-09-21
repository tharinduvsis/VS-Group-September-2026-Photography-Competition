/* ============================================================
   EDIT THIS FILE ONLY — everything you need to configure lives here.
   See README.md for the full setup walkthrough.
   ============================================================ */

const SITE_CONFIG = {
  // Leave this empty to allow any Google account to vote (the current
  // setup, since staff use personal Gmail accounts). If VSIS ever moves
  // to Google Workspace company accounts, list the domains here and
  // voting will automatically restrict to them — no other code changes
  // needed. Example: ["vsis.lk", "vsone.lk"]
  allowedEmailDomains: [],

  competitionTitle: "Photography Competition",

  // Maximum number of photos each person can vote for.
  maxVotesPerPerson: 3,
};

// Paste the config object from Firebase Console →
// Project settings → General → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0yZTkhbbShfSUbOHCGFdc3JBqAMcGkB0",
  authDomain: "vs-group-picture-competition.firebaseapp.com",
  projectId: "vs-group-picture-competition",
  storageBucket: "vs-group-picture-competition.firebasestorage.app",
  messagingSenderId: "519220421902",
  appId: "1:519220421902:web:f7afb5556a011b4435a35f",
};

/* ------------------------------------------------------------
   PHOTOS
   ------------------------------------------------------------
   Copy your photo files into an "images" folder next to this file —
   no renaming needed, keep whatever filenames and extensions they
   already have (.jpg, .png, .jpeg, all fine, even mixed).

   Then list each filename below, one per line, in the order you'd
   like them numbered on-site. The site auto-numbers them "No. 001",
   "No. 002", etc. based on this list's order — that display number
   is separate from the filename, so it doesn't matter what your
   files are called.

   Optional: add a title/caption after the filename if you want one
   shown (e.g. an entrant's name) — otherwise leave it as "".
   ------------------------------------------------------------ */

const PHOTO_FILES = [
  // { file: "images/YOUR-FILENAME-HERE.jpg", title: "", caption: "" },
  { file: "images/IMG_0019 - Binura Samarawickrama.jpeg", title: "", caption: "" },
  { file: "images/Kumbalwela - Thiwanka Prabath.png", title: "", caption: "" },
  // ...add one line per photo, then delete these two example lines
];

const PHOTOS = PHOTO_FILES.map((p, i) => {
  const num = String(i + 1).padStart(3, "0");
  return {
    id: num,               // the frame number shown on-site — just the order in the list above
    file: p.file,
    title: p.title || `Submission ${num}`,
    caption: p.caption || "",
  };
});