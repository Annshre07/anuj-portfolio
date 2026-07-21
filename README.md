# Anuj Dewan — Terminal Portfolio (Cloudflare Workers + Gemini)

Cloudflare recently unified "Pages" and "Workers" into one product. This
version is built for that newer flow, which uses a tool called **Wrangler**
and a single config file (`wrangler.jsonc`) instead of the old `/functions`
folder convention.

## Project Structure

```
anuj-portfolio/
├── wrangler.jsonc      ← tells Cloudflare how to build & run this project
├── src/
│   └── worker.js         ← one script: serves the site + handles /api/chat
├── public/
│   └── index.html        ← the whole terminal portfolio (UI + logic)
└── README.md
```

---

## Step 1 — Get a free Gemini API key
1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **Create API key** → copy it and save it somewhere safe

(Permanent free tier — roughly 1,500 requests/day, no credit card, no expiry.)

---

## Step 2 — Upload the files to GitHub
1. github.com/new → name it `anuj-portfolio` → **Create repository** (empty, no README)
2. On the repo page → **uploading an existing file**
3. Drag in `wrangler.jsonc`, `README.md`, the whole `src` folder, and the whole `public` folder
4. Commit

Afterward, click into `src` and `public` on GitHub to confirm `worker.js` and
`index.html` landed at the right paths.

---

## Step 3 — Fill in the "Set up your application" screen on Cloudflare

If you're connecting this repo via **Workers & Pages → Create → Import a
repository**, you'll land on a screen with these fields — here's exactly what
goes in each:

| Field | What to enter |
|---|---|
| **Project name** | leave as `anuj-portfolio` or whatever you'd like the subdomain to be |
| **Build command** | leave **empty** — there's no build step |
| **Deploy command** | leave the default: `npx wrangler deploy` |
| **Builds for non-production branches** | leave checked (default) |
| **Non-production branch deploy command** | leave the default: `npx wrangler versions upload` |
| **Path** | leave as `/` (the repo root, where `wrangler.jsonc` lives) |
| **API token** | click **Create new token** — this is Cloudflare's own deploy permission token, not your Gemini key. Give it any name (e.g. "anuj-portfolio-deploy") and let Cloudflare generate it; you don't type a value in yourself |
| **Variable name** | `GEMINI_API_KEY` |
| **Variable value** | paste your **Gemini** key from Step 1 (not a Cloudflare token) |

Click **Save and Deploy**.

---

## Step 4 — Done
Your site goes live at something like `https://anuj-portfolio.<your-subdomain>.workers.dev`.
Type a question into the terminal to confirm the chat replies.

## How it works

```
Visitor's browser
      │
      │  POST /api/chat  (no API key)
      ▼
Cloudflare Worker (src/worker.js)
      │  ├─ serves public/index.html for everything else
      │  └─ for /api/chat: adds secret GEMINI_API_KEY, calls Gemini
      ▼
Gemini API → returns AI reply → worker returns { reply: "..." } to the browser
```

## Making changes later
Edit or re-upload a file on GitHub, commit, and Cloudflare automatically
redeploys within a minute or two.
