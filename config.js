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
   IMPORTANT: rename each photo file to something plain (001.jpg,
   002.png, etc.) BEFORE copying it into the "images" folder — do
   not keep the original filename if it contains an entrant's name
   or anything identifying. The site displays "No. 001" on-screen,
   but the actual filename you list below still appears in the
   page's HTML source and in each image's network request, so an
   identifying filename leaks the entrant's identity regardless of
   what the on-screen label says. Also strip EXIF metadata (GPS
   location, camera/device info) from the original files first —
   see README.md Step 4 for how.

   Then list each (renamed) filename below, one per line, in the
   order you'd like them numbered on-site. The site auto-numbers
   them "No. 001", "No. 002", etc. based on this list's order.

   Optional: add a title/caption after the filename if you want one
   shown (e.g. an entrant's name, if that's intentional and allowed
   for this competition) — otherwise leave it as "".
   ------------------------------------------------------------ */

const PHOTO_FILES = [
  // { file: "images/YOUR-FILENAME-HERE.jpg", title: "", caption: "" },
  { file: "images/001.jpeg", title: "", caption: "" },
  { file: "images/002.png", title: "", caption: "" },
  // ...add one line per photo, then delete these two example lines.
  // Remember: rename the actual files on disk to match (001.jpeg,
  // 002.png) — these two entries currently point at real files
  // named with entrants' names, so those files need renaming too.
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