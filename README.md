# Anuj Dewan — Terminal Portfolio (Cloudflare Pages + Gemini, no Git required)

## Project Structure

```
anuj-portfolio/
├── index.html                  ← the whole terminal portfolio (UI + logic)
├── functions/
│   └── api/
│       └── chat.js              ← serverless function, calls Google's Gemini API (free tier)
└── README.md
```

No build step, no config file needed. Cloudflare Pages serves `index.html` as
your homepage, and automatically turns `functions/api/chat.js` into a live
route at `/api/chat`.

---

## How to Deploy — everything done in the browser

### Step 1 — Get a free Gemini API key
1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **Create API key**
4. Copy it and save it somewhere safe

This is a real permanent free tier (Gemini 2.5 Flash) — roughly 1,500
requests/day, no credit card, no expiration. Plenty for a portfolio chatbot.

---

### Step 2 — Upload the files to GitHub
1. Go to https://github.com/new → name the repo `anuj-portfolio` → **Create repository**
   (leave it empty — don't check "add a README")
2. On the new repo page, click **uploading an existing file**
3. Drag in:
   - `index.html`
   - `README.md`
   - the whole `functions` folder (drag the folder itself, so `functions/api/chat.js` lands at that exact path)
4. Commit the changes

Afterward, click into the folders on GitHub to confirm `chat.js` really
ended up at `functions/api/chat.js`.

---

### Step 3 — Create the Cloudflare Pages project
1. Go to https://dash.cloudflare.com → sign up / log in
2. Left sidebar: **Workers & Pages → Create → Pages tab → Connect to Git**
3. Authorize Cloudflare to access GitHub, then select the `anuj-portfolio` repo
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
5. Click **Save and Deploy** — the site goes live, but chat won't reply yet
   (no key set) — that's expected, continue to Step 4

---

### Step 4 — Add your secret API key
1. In the project → **Settings → Environment variables**
2. Add a variable for the **Production** environment:
   - **Variable name:** `GEMINI_API_KEY`
   - **Value:** the key from Step 1
   - Click **Encrypt** if offered
3. Save
4. Go to **Deployments** → latest one → **Retry deployment** (so it picks up the new variable)

---

### Step 5 — Done! 🎉
Your site is live at `https://anuj-portfolio.pages.dev`.

The chat works securely:
- Browser → calls `/api/chat` on Cloudflare (no key)
- Cloudflare function → adds your secret `GEMINI_API_KEY` → calls Gemini
- The key is never visible in your HTML or in GitHub

---

## Making changes later
Edit or re-upload a file on GitHub, commit the change, and Cloudflare Pages
automatically redeploys within a minute or two. No local setup, no Git, no
terminal required.

## A note on the college firewall
Deployment platforms don't need to be reachable from your college network —
they need to be reachable by whoever *visits* your portfolio. If you just
want to double check the live link works, try it over mobile data instead of
campus wifi.

## How it works (diagram)

```
Visitor's browser
      │
      │  POST /api/chat  (no API key)
      ▼
Cloudflare Pages (serves index.html + runs functions/api/chat.js at the edge)
      │
      │  POST to Gemini  (adds secret GEMINI_API_KEY from env)
      ▼
Gemini API → returns AI reply
      │
      ▼
functions/api/chat.js returns { reply: "..." } to the browser
      │
      ▼
Reply appears in the terminal ✓
```
