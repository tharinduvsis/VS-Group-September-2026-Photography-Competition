# VSIS Photography Competition — Voting Site

A voting gallery: browse submissions, pick up to 3 favorites, confirm
with a Google account, and submit once. The leaderboard updates live
for everyone watching.

Total cost: **free**, using GitHub Pages (hosting) + Firebase's free
Spark plan (votes database). Everything below is self-serve — no IT
admin access needed anywhere.

---

## What you're setting up

1. A Firebase project — stores votes and handles Google sign-in
2. A GitHub repository — hosts the site, for free, at a public link
3. Your 50 photos, dropped into one folder

---

## Step 1 — Create the Firebase project

1. Go to [firebase.google.com](https://firebase.google.com/) → **Go to console** → **Add project**.
2. Name it anything (e.g. "vsis-photo-vote"). You can skip Google Analytics.
3. Click the **</> (web app)** icon to register a web app.
4. Firebase shows you a `firebaseConfig` object — copy those six values into `config.js`, replacing the `PASTE_YOUR_...` placeholders.

## Step 2 — Turn on Google sign-in

1. In the Firebase console: **Build → Authentication → Get started → Sign-in method → Add new provider → Google**.
2. Toggle it **Enable**, pick a support email (your own is fine), and **Save**. That's the whole step — Firebase handles the Google OAuth setup for you automatically, no external app registration required.
3. Still in Authentication → **Settings → Authorized domains**, add your future GitHub Pages domain (`yourusername.github.io`) — you can come back to this after Step 4 if you don't have it yet.

## Step 3 — Turn on Firestore (the votes database)

1. **Build → Firestore Database → Create database**. Choose **production mode**, a region close to Sri Lanka (e.g. `asia-south1`).
2. Go to the **Rules** tab and replace the contents with this:

   ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /votes/{voteId} {
          allow read: if true;
          allow create: if request.auth != null
                        && request.auth.uid == voteId
                        && request.resource.data.photoIds is list
                        && request.resource.data.photoIds.size() >= 1
                        && request.resource.data.photoIds.size() <= 3;
          allow update, delete: if false;
        }
      }
    }
   ```

   This is what stops one person voting more than once — a signed-in
   Google account can create **one** document (its ID must match their
   own account ID), holding at most 3 picks, and nobody can edit or
   delete a submitted ballot afterward.

   **Optional, for later:** if VSIS ever moves to Google Workspace
   company accounts, you can restrict voting to specific domains by
   adding this condition to the `allow create` line, matched to
   whatever you set in `config.js`:
   ```
   && request.auth.token.email.matches('.*@(vsis[.]lk|vsone[.]lk)$')
   ```
3. Click **Publish**.

## Step 4 — Add your photos

1. Create a folder named `images` next to `index.html`.
2. Name your 50 photo files `001.jpg`, `002.jpg`, … `050.jpg` (zero-padded to 3 digits) and put them in that `images` folder. The site auto-generates all 50 gallery entries from the filenames.
   - Different number of submissions? Change `TOTAL_PHOTOS` in `config.js`.
   - Want a caption or entrant name on a specific photo? See the example at the bottom of `config.js`.
3. Want a different number of picks than 3? Change `maxVotesPerPerson` in `config.js` **and** the `<= 3` in the Firestore rule above to match.

## Step 5 — Put it on GitHub Pages

1. Create a new **public** repository on GitHub (e.g. `photo-vote`).
2. Upload all the files (`index.html`, `style.css`, `config.js`, `app.js`, the `images` folder) — drag-and-drop in the GitHub web UI, or GitHub Desktop.
3. Repo **Settings → Pages** → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. GitHub gives you a live URL, typically `https://yourusername.github.io/photo-vote/`.
5. Go back to Firebase → Authentication → Settings → Authorized domains and confirm `yourusername.github.io` is on the list (Step 2.3).

You're live. Share the link internally — ideally through a channel only employees can see (email, internal chat), the same way you'd have shared the original Google Form.

---

## How voting works for employees

1. Browse the gallery, click a frame to preview it large.
2. Click **"Add to your picks"** on up to 3 favorites — a bar at the bottom of the screen tracks their selections.
3. Click **"Submit my votes"** — this triggers a normal Google sign-in (the same kind of prompt they already saw filling out the submission form).
4. Once signed in, their 3 picks are submitted as one action and locked — no edits, no re-voting.

## What this does and doesn't protect against

**Does:** stop the two failure modes you were worried about — no login
means unlimited repeat voting from the same person; a login-walled
third-party site violates policy. This uses your voters' own Google
accounts (which they already use for the submission form), and the
security rule guarantees one Google account can only ever submit one
ballot, ever.

**Doesn't:** cryptographically prove a Google account belongs to a
VSIS employee — a personal Gmail address isn't tied to your company
directory the way a Microsoft 365 or Workspace account would be. In
practice this is the same trust boundary your original submission
form already operates on, and creating multiple fake Google accounts
to cast extra votes is real friction most people won't bother with —
but it's not impossible. If that risk matters enough later, moving to
Google Workspace company accounts (if VSIS adopts them) or getting
Microsoft app-registration access from IT would close that gap
without changing anything else about the site.

## Costs / limits to know about

Firebase's free Spark plan comfortably covers this — Firestore's free
tier is 50,000 reads/day, far more than an internal audience of this
size will use during a voting period. Google sign-in itself is free.
