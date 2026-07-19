# THE LAST HUMAN ($LAST)

Static, framework-free website for **THE LAST HUMAN ($LAST)** — a Solana
community token. Built with HTML5, CSS3 and vanilla JavaScript only. No
build step, no npm, no dependencies to install. Deploys straight to
GitHub Pages.

---

## 1. Before you deploy — 3 things to fill in

### a) Your real logo & hero video
This package ships with **placeholder** assets so the site works the
moment you upload it:
- `assets/logo/LASTLOGO.png` — a generated placeholder mark (also used
  for the favicon and PWA icons).
- `assets/videos/last.mp4` — a generated dark circuit-grid animation
  used as a stand-in hero background.

Replace them with your real files, **keeping the exact same filenames
and folders**, and the site picks them up automatically:
- `assets/logo/LASTLOGO.png` (also regenerate `favicon-32.png`,
  `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` from your real
  logo for a consistent favicon/homescreen icon)
- `assets/videos/last.mp4`

If `last.mp4` is ever missing or fails to load, the hero automatically
falls back to a live animated canvas background instead of breaking.

### b) `data/config.json`
This is the single file that turns on live data:

```json
{
  "token": { "contractAddress": "" },
  "dex": { "dexscreenerPairAddress": "" },
  "social": { "telegram": "https://t.me/thelasthuman1", "twitter": "" }
}
```

- **`token.contractAddress`** — once the mint exists, paste it here.
  This activates the "Buy $LAST" button, the Copy CA button, and the
  AI assistant's contract-address answer.
- **`dex.dexscreenerPairAddress`** — once a liquidity pool exists on
  Raydium/Orca, paste the DexScreener pair address here. This activates
  the live price/market-cap/liquidity/volume ticker, the stats
  dashboard, and the embedded chart. Until it's set, those sections
  show an honest "pending" state instead of fake numbers.
- **`social.twitter`** — add your X profile URL to reveal the X icon
  (it stays hidden until filled in, as requested).

### c) Your X (Twitter) URL
Not included in the brief, so the X icon is present in the markup but
hidden via `social.twitter` in `data/config.json` until you add it.

---

## 2. Deploying to GitHub Pages

1. Create a new GitHub repository.
2. Upload every file in this project, keeping the folder structure.
3. Go to **Settings → Pages**, set the source to the `main` branch,
   root folder.
4. Your site is live at `https://<username>.github.io/<repo>/`.

No build step. No install step. It works as static files.

---

## 3. What's genuinely live vs. what's a demo

Being upfront about this matters for a token site:

**Live / real:**
- Price, market cap, liquidity, 24h volume, FDV, buy/sell counts and
  the embedded chart — fetched directly from the public **DexScreener
  API**, no key required, once you set `dexscreenerPairAddress`.
- **Wallet connect** — detects and connects to Phantom/Solflare via
  `window.solana`, a real browser wallet handshake.
- **Copy contract address**, scroll reveals, mobile menu, FAQ
  accordion, tokenomics chart (pure SVG, no chart library) — all fully
  functional.

**Clearly-labeled demos (no backend exists for these, by design —
this is a static site):**
- **Leaderboard** — local demo data plus your own points, stored in
  `localStorage` on your device only. Not a shared, cross-user
  leaderboard.
- **Daily rewards** — same, `localStorage`-based streak tracker.
- **Airdrop checker** — a deterministic client-side demo, *not* a real
  snapshot lookup. It's labeled "Demo" in the UI.
- **AI assistant** — a lightweight rule-based FAQ bot that runs
  entirely in the browser (no external AI API calls, since a static
  GitHub Pages site has nowhere to keep an API key safe).

If you later want any of these to be real and shared across users,
you'll need a small backend (even a serverless function) — flagging
that now so nothing here overpromises.

**Holders, whale activity, treasury and burn tracking** are shown as
placeholders in the stats grid — these require an indexer (e.g.
Helius) with a server-side API key, which a purely static site can't
hold securely. Wire these up once you have a backend or a public,
key-less endpoint for them.

---

## 4. File structure

```
index.html
css/style.css
js/script.js
manifest.json
robots.txt
sitemap.xml
data/config.json          ← contract address, DEX pair, socials
assets/logo/LASTLOGO.png  ← replace with your real logo
assets/videos/last.mp4    ← replace with your real hero video
```

## 5. Notes

- Update the placeholder domain (`thelasthuman.example`) in
  `index.html` (Open Graph tags), `sitemap.xml` and `robots.txt` once
  you know your real domain.
- The site respects `prefers-reduced-motion` and keeps visible
  keyboard focus states throughout for accessibility.
- Everything runs client-side — there is no server, so no user data is
  ever transmitted anywhere except the public DexScreener API call and
  the wallet handshake, both of which are standard and read-only.
