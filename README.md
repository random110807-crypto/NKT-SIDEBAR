# NKT Sidebar — Nashediyon Ki Toli

A responsive Chess.com club sidebar for NKT. This project retains the existing dark emerald-and-gold identity, Chess.com public club/member data, music player, event cards, world clock, quote rotation and Easter eggs.

## Configure the next Clash of Clubs event

Open **`js/config.js`** and edit only these two fields inside `CONFIG.events.mca`:

```js
mca: {
  title: "NKT Clash of Clubs",
  url: "https://www.chess.com/...",
  startAt: "2026-12-01T19:30:00+05:30",
  endAt: ""
},
```

- `url`: the full HTTPS Chess.com arena/event URL.
- `startAt`: event start date and time in ISO 8601 format. Include the timezone offset. India example: `+05:30`.
- `endAt`: optional. Add an ISO 8601 end date/time if the card should switch to **EVENT COMPLETE** automatically. Leave it as an empty string if no end time is configured.

**All three cards (Clash of Clubs, Vote Chess, Daily Chess) follow the same rule:** the countdown, its caption and the date line appear **only when a valid `startAt` is configured**. With just a `url`, the card shows a clean title and a JOIN EVENT button — no placeholder text. The Clash of Clubs card automatically formats the weekday/date and runs a live days/hours/minutes/seconds countdown. It changes to **LIVE NOW** at the configured start and to **EVENT COMPLETE** at the configured end. The JOIN EVENT link stays available in every state. The manually configured start/end times are authoritative; no automatic Chess.com schedule extraction is claimed or used for this card. If the URL is empty or invalid, the unconfigured featured card stays hidden rather than showing a broken link.

## Other event cards

Vote Chess and Daily Chess remain supporting cards and retain their existing link-first configuration in `CONFIG.events`. The Daily Chess card can still use Chess.com's documented public tournament endpoint for available tournament metadata/status. This API enrichment does not control the Clash of Clubs card.

## Other live sections

- Membership count, average daily rating and recent joiners are fetched from Chess.com public club/player endpoints.
- The milestone target is the next 500-member threshold; progress is current members divided by the next target, clamped to 0–100%.
- The quote rotates through ten short author-attributed quotations, changing every ten days.
- Music files belong in `assets/music/` using the exact filenames listed in `assets/music/README.txt` and configured in `js/config.js`.
- Feedback/admin links can be configured in `CONFIG.links`.

## Easter eggs

New in 3.1 — a visible **Secret Corner** panel above the footer with three glowing buttons and a "found" tracker (saved in the visitor's browser, 11 secrets in total):

- **PROMOTE ME** — tap repeatedly: Pawn → Knight → Bishop → Rook → Queen, then a gold burst.
- **DRAW FORTUNE** — a random chess fortune on every tap.
- **DO NOT PRESS** — escalates over three presses until the king topples.
- **Golden Pawn** — a rare shimmering pawn drifts across the sidebar a few seconds after load. Catch it!
- **Konami code** — ↑ ↑ ↓ ↓ ← → ← → B A on a keyboard for a gold rain.

Original secrets (still included):

- Click the NKT crest five times quickly, or type `nktchaos` outside an input field, for the temporary NKT particle burst.
- Click the tiny star beside the quote heading for the quote constellation.
- Click the knight in the footer for its short gallop.
- Click the three live stats in order — Members, Avg. Daily, Founded — to reveal the Three Pillars detail.
- Triple-click the NKT motto for a brief motto highlight.
- Double-click the daily quote for a temporary line from the NKT Archive.

All effects are temporary and clean up their classes, timers and animation frames. Reduced-motion preferences are respected by the moving visual effects.

## Run locally

Serve this directory over HTTP (ES modules do not work reliably from `file://`). With Node.js installed, you can use a static file server, or run:

```bash
npx serve .
```

## Project contents and media note

The supplied source archive did not include the five MP3 files. The music player and its configured paths are preserved; add your own audio files using the exact names in `assets/music/README.txt` to enable playback. The logo and background assets are included.
