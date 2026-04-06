# Anuj Dewan — Portfolio with AI Chat

## Project Structure

```
anuj-portfolio/
├── index.html                  ← your portfolio + chat UI
├── netlify.toml                ← tells Netlify where files are
├── netlify/
│   └── functions/
│       └── chat.js             ← serverless function (keeps API key secret)
└── README.md
```

---

## How to Deploy to Netlify (Step by Step)

### Step 1 — Get an Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy and save it somewhere safe (you'll only see it once)

---

### Step 2 — Put all files in a folder
Create a folder called `anuj-portfolio` on your computer with this structure:
```
anuj-portfolio/
├── index.html
├── netlify.toml
└── netlify/
    └── functions/
        └── chat.js
```

---

### Step 3 — Push to GitHub
1. Go to https://github.com → **New repository** → name it `anuj-portfolio`
2. Upload all your files (drag & drop or use Git)

---

### Step 4 — Deploy on Netlify
1. Go to https://netlify.com → **Sign up free** (use GitHub login)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** → select your `anuj-portfolio` repo
4. Build settings will be auto-detected from `netlify.toml`
5. Click **Deploy site**

---

### Step 5 — Add your secret API key
This is the most important step — your API key must NEVER go in index.html.

1. In Netlify dashboard → your site → **Site configuration**
2. Click **Environment variables** → **Add a variable**
3. Set:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your key from Step 1)
4. Click **Save**
5. Go to **Deploys** → **Trigger deploy** → **Deploy site**

---

### Step 6 — Done! 🎉
Your site is live at `https://your-site-name.netlify.app`

The chat will now work securely:
- Browser → calls `/api/chat` on Netlify
- Netlify function → adds secret API key → calls Anthropic
- API key is NEVER visible in your HTML

---

## How it works (diagram)

```
Visitor's browser
      │
      │  POST /api/chat  (no API key)
      ▼
Netlify Edge (netlify.toml redirects /api/chat → /.netlify/functions/chat)
      │
      │  POST to Anthropic  (adds secret ANTHROPIC_API_KEY from env)
      ▼
Anthropic API → returns AI reply
      │
      ▼
Netlify function returns { reply: "..." } to browser
      │
      ▼
Chat bubble appears on your portfolio ✓
```

---

## Testing locally (optional)
If you want to test before deploying:
1. Install Netlify CLI: `npm install -g netlify-cli`
2. In your project folder: `netlify dev`
3. It will ask for your API key the first time
4. Open http://localhost:8888
