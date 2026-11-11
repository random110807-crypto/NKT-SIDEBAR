const $ = id => document.getElementById(id);

const trustedUrl = value => {
  try { const u = new URL(String(value || '').trim()); return u.protocol === 'https:' ? u.href : ''; }
  catch { return ''; }
};
const validTime = value => { const n = Date.parse(value || ''); return Number.isFinite(n) ? n : null; };
const dateText = n => new Date(n).toLocaleString(undefined, {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
});

const DEFAULT_TITLES = { mca: 'NKT Clash of Clubs', vote: 'NKT Vote Chess', daily: 'NKT Daily Chess' };
const PREFIX = { mca: 'mca', voteChess: 'vote', dailyChess: 'daily' };

// Chess.com tournament URLs contain the tournament URL-ID in their path.
function tournamentIdFromUrl(value) {
  try {
    const url = new URL(value);
    if (url.hostname !== 'www.chess.com' && url.hostname !== 'chess.com') return '';
    const parts = url.pathname.split('/').filter(Boolean);
    const marker = parts.findIndex(part => part === 'tournament');
    if (marker < 0 || !parts[marker + 1]) return '';
    return decodeURIComponent(parts[parts.length - 1]);
  } catch { return ''; }
}

async function fetchTournamentDetails(url) {
  const id = tournamentIdFromUrl(url);
  if (!id) return null;
  const endpoint = `https://api.chess.com/pub/tournament/${encodeURIComponent(id)}`;
  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Tournament API returned ${response.status}`);
  return response.json();
}

// One engine drives every card format (Clash of Clubs, Vote Chess, Daily Chess).
// Rule: the countdown, its caption and the date line appear ONLY when a real
// start date has been configured. With no schedule the card is just a clean
// title + join button — no placeholder text.
function createCard(prefix, config, key) {
  const card = $(`event-${prefix}`);
  const url = trustedUrl(config?.url);
  if (!card || !url) return null;

  const el = name => $(`${prefix}-${name}`);
  const join = el('join'), title = el('title'), opponent = el('opponent'), date = el('date');
  const countdown = el('countdown'), label = el('count-label');
  const state = el('state'), stateText = el('state-text'), status = el('status');

  card.hidden = false;
  join.href = url;
  join.setAttribute('aria-label', `Join ${config.title || DEFAULT_TITLES[prefix]} on Chess.com`);
  title.textContent = config.title || DEFAULT_TITLES[prefix];
  if (config.opponent) { opponent.textContent = `VS · ${config.opponent}`; opponent.hidden = false; }

  const start = validTime(config.startAt);
  const parsedEnd = validTime(config.endAt);
  const end = parsedEnd !== null && (start === null || parsedEnd > start) ? parsedEnd : null;

  let timer = null;
  let lastSeconds = null;

  const show = mode => { // mode: 'none' | 'countdown' | 'live' | 'complete'
    card.dataset.schedule = mode === 'none' ? 'none' : 'set';
    card.dataset.eventState = mode;
    countdown.hidden = mode !== 'countdown';
    label.hidden = mode !== 'countdown';
    state.hidden = mode !== 'live' && mode !== 'complete';
    state.classList.toggle('is-live', mode === 'live');
    state.classList.toggle('is-complete', mode === 'complete');
  };
  const setDate = text => { date.textContent = text || ''; date.hidden = !text; };
  const setJoin = text => { join.querySelector('b').textContent = text; };

  const setLive = (caption = 'LIVE NOW') => { show('live'); stateText.textContent = caption; if (status) status.textContent = 'LIVE'; };
  const setComplete = () => { show('complete'); stateText.textContent = 'EVENT COMPLETE'; setJoin('VIEW EVENT'); };

  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const now = Date.now();
    if (end !== null && now >= end) { setComplete(); stop(); return; }
    if (start !== null && now >= start) { setLive(); return; }
    if (start === null) { show('none'); return; }
    show('countdown');
    label.textContent = prefix === 'mca' ? 'THE SHOWDOWN BEGINS IN' : 'NEXT GAME BEGINS IN';
    const ms = Math.max(0, start - now);
    const values = {
      days: Math.floor(ms / 86400000),
      hours: Math.floor(ms % 86400000 / 3600000),
      minutes: Math.floor(ms % 3600000 / 60000),
      seconds: Math.floor(ms % 60000 / 1000)
    };
    for (const [unit, value] of Object.entries(values)) {
      const node = el(unit);
      if (!node) continue;
      const text = pad(value);
      if (node.textContent !== text) {
        node.textContent = text;
        if (unit === 'seconds') { // soft tick on the seconds digit
          node.classList.remove('is-tick'); void node.offsetWidth; node.classList.add('is-tick');
        }
      }
    }
    lastSeconds = values.seconds;
  };
  const stop = () => { if (timer !== null) window.clearInterval(timer); timer = null; };
  const run = () => {
    tick();
    if (start !== null || end !== null) {
      timer = window.setInterval(tick, 1000);
      window.addEventListener('pagehide', stop, { once: true });
    }
  };

  // Initial paint: nothing schedule-related until a start date exists.
  show('none');
  if (start !== null) { setDate(dateText(start)); }
  else if (end !== null) { setDate(`Ends · ${dateText(end)}`); }
  else setDate('');

  return { card, join, setDate, setLive, setComplete, setJoin, run, show, status, label, start, end, key, lastSeconds };
}

async function enrichDaily(handle, config) {
  // Daily Chess may use the documented public tournament endpoint for status only.
  try {
    const details = await fetchTournamentDetails(trustedUrl(config.url));
    if (!details) return false;
    const title = $('daily-title');
    if (details.name && title) title.textContent = details.name;
    const apiStatus = String(details.status || '').toLowerCase();
    if (apiStatus === 'in_progress' && handle.start === null) {
      handle.setLive('LIVE NOW'); handle.setDate('Live on Chess.com'); return true;
    }
    if (apiStatus === 'finished') {
      handle.setComplete();
      handle.setDate(details.finish_time ? `Finished · ${dateText(Number(details.finish_time) * 1000)}` : 'Tournament finished');
      return true;
    }
    if (apiStatus === 'registration' && handle.status) handle.status.textContent = 'REGISTRATION OPEN';
  } catch (error) {
    console.info('NKT daily metadata unavailable:', error.message);
  }
  return false;
}

async function initOne(key, config) {
  const prefix = PREFIX[key];
  const handle = createCard(prefix, config, key);
  if (!handle) return;
  if (key === 'dailyChess') {
    const finalState = await enrichDaily(handle, config);
    if (finalState) return;
  }
  handle.run();
}

export function initEventCards(events = {}) {
  initOne('mca', events.mca);
  initOne('voteChess', events.voteChess);
  initOne('dailyChess', events.dailyChess);
}
