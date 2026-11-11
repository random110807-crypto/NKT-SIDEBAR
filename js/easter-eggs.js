export function initEasterEggs() {
  const crest = document.getElementById('brand-crest');
  const canvas = document.getElementById('nkt-chaos-canvas');
  const toast = document.getElementById('nkt-chaos-toast');
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const timers = new Map();
  const time = (key, callback, delay) => {
    window.clearTimeout(timers.get(key));
    timers.set(key, window.setTimeout(() => {
      timers.delete(key);
      callback();
    }, delay));
  };
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let clicks = 0, clickTimer = 0, frame = 0, active = false, particles = [];
  let originalToast = toast?.textContent || 'THE TOLI HAS LOST THE PLOT';

  // ---------- Secrets-found tracker (persisted, optional) ----------
  const TOTAL = 11;
  const STORE = 'nkt-secrets-found';
  let found = new Set();
  try { found = new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch { found = new Set(); }
  const countEl = document.getElementById('secret-count');
  const dotsEl = document.getElementById('secret-dots');
  const readout = document.getElementById('secret-readout');
  const paintFound = () => {
    if (countEl) countEl.textContent = found.size >= TOTAL ? 'ALL FOUND ✦' : `${found.size} / ${TOTAL} FOUND`;
    if (dotsEl) {
      if (!dotsEl.children.length) for (let i = 0; i < TOTAL; i++) dotsEl.append(document.createElement('i'));
      [...dotsEl.children].forEach((dot, i) => dot.classList.toggle('is-on', i < found.size));
    }
    document.getElementById('secret-corner')?.classList.toggle('is-complete', found.size >= TOTAL);
  };
  const say = (message, tone = '') => {
    if (!readout) return;
    readout.classList.remove('is-swap'); void readout.offsetWidth;
    readout.textContent = message;
    readout.dataset.tone = tone;
    readout.classList.add('is-swap');
  };
  function markFound(id) {
    if (found.has(id)) return false;
    found.add(id);
    try { localStorage.setItem(STORE, JSON.stringify([...found])); } catch { /* storage optional */ }
    paintFound();
    if (found.size >= TOTAL) {
      time('grand', () => {
        say('GRANDMASTER OF SECRETS — every secret found. The Toli salutes you.', 'gold');
        burst({ glyphs: ['♛', '✦', '♚', '★'], hues: [43, 48, 52], count: 90 });
      }, 900);
    }
    return true;
  }
  paintFound();

  function showSecret(message, duration = 2100) {
    if (!toast) return;
    originalToast = originalToast || toast.textContent;
    toast.textContent = message;
    toast.classList.remove('is-chaotic');
    toast.classList.add('is-secret-message');
    time('toast', () => {
      toast.classList.remove('is-secret-message');
      toast.textContent = originalToast;
    }, duration);
  }

  function temporaryClass(className, duration) {
    sidebar.classList.remove(className);
    void sidebar.offsetWidth;
    sidebar.classList.add(className);
    time(className, () => sidebar.classList.remove(className), duration);
  }

  // Five quick crest taps reveal the original NKT particle burst.
  function launch() {
    if (active || !canvas || !toast) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    active = true;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const glyphs = ['♞', '♟', '♜', '✦', '✧', 'NKT', '?!', '404'];
    const count = reduced ? 18 : 115;
    particles = Array.from({ length: count }, (_, i) => ({
      x: w * (0.18 + Math.random() * 0.64), y: h * (0.2 + Math.random() * 0.6),
      vx: (Math.random() - .5) * (reduced ? 1.2 : 8), vy: (Math.random() - .8) * (reduced ? 1.2 : 9),
      spin: (Math.random() - .5) * .2, angle: Math.random() * 6.28,
      size: 5 + Math.random() * 13, life: 70 + Math.random() * 70,
      hue: [43, 92, 135, 155][i % 4], glyph: glyphs[i % glyphs.length], shape: i % 3
    }));
    toast.textContent = originalToast;
    toast.classList.remove('is-secret-message');
    toast.classList.add('is-chaotic');
    canvas.classList.add('is-active');
    sidebar.classList.add('nkt-chaos-mode');
    let tick = 0;
    const draw = () => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += reduced ? .02 : .075;
        p.vx *= .994; p.angle += p.spin; p.life--;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.fillStyle = `hsla(${p.hue},82%,68%,${Math.max(0, Math.min(1, p.life / 30))})`;
        if (p.shape === 0) ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .65);
        else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.font = `900 ${p.size}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.glyph, 0, 0); }
        ctx.restore();
      });
      particles = particles.filter(p => p.life > 0 && p.y < height + 50);
      tick++;
      if (particles.length && tick < (reduced ? 75 : 175)) frame = requestAnimationFrame(draw);
      else cleanupChaos();
    };
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  }

  function cleanupChaos() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const ctx = canvas?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    canvas?.classList.remove('is-active');
    toast?.classList.remove('is-chaotic');
    sidebar.classList.remove('nkt-chaos-mode');
    active = false;
    particles = [];
    if (toast) toast.textContent = originalToast;
  }

  // Generic particle burst used by the new secrets (no screen wobble).
  let burstParticles = [], burstFrame = 0;
  function burst({ glyphs = ['✦', '✧'], hues = [43, 92], count = 40, from } = {}) {
    if (!canvas || active) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(rect.width * dpr)) {
      canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let ox = rect.width / 2, oy = rect.height / 2;
    if (from) { const r = from.getBoundingClientRect(); ox = r.left + r.width / 2 - rect.left; oy = r.top + r.height / 2 - rect.top; }
    const n = reduced ? Math.min(count, 14) : count;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (reduced ? 1 : 2 + Math.random() * 5.5);
      burstParticles.push({
        x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2.2, angle: Math.random() * 6.28,
        spin: (Math.random() - .5) * .25, size: 8 + Math.random() * 12, life: 55 + Math.random() * 45,
        hue: hues[i % hues.length], glyph: glyphs[i % glyphs.length]
      });
    }
    canvas.classList.add('is-active');
    if (burstFrame) return;
    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      burstParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .09; p.vx *= .99; p.angle += p.spin; p.life--;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.fillStyle = `hsla(${p.hue},88%,70%,${Math.max(0, Math.min(1, p.life / 25))})`;
        ctx.font = `800 ${p.size}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.glyph, 0, 0); ctx.restore();
      });
      burstParticles = burstParticles.filter(p => p.life > 0 && p.y < h + 40);
      if (burstParticles.length) burstFrame = requestAnimationFrame(draw);
      else { burstFrame = 0; ctx.clearRect(0, 0, w, h); if (!active) canvas.classList.remove('is-active'); }
    };
    burstFrame = requestAnimationFrame(draw);
  }

  crest?.addEventListener('click', () => {
    clicks++;
    window.clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => { clicks = 0; }, 2200);
    if (clicks >= 5) { clicks = 0; window.clearTimeout(clickTimer); launch(); markFound('chaos'); }
  });

  // Keyboard secret remains available, but typing in forms/search fields is ignored.
  let typed = '';
  document.addEventListener('keydown', event => {
    const target = event.target;
    if (target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) return;
    typed = (typed + event.key.toLowerCase()).slice(-8);
    if (typed === 'nktchaos') { typed = ''; launch(); markFound('chaos'); }
  });

  document.querySelector('[data-easter-egg="spark"]')?.addEventListener('click', () => {
    temporaryClass('nkt-spark-secret', 1900);
    if (markFound('spark')) say('✦ The quote star twinkled. Secret found.', 'gold');
  });
  document.querySelector('[data-easter-egg="knight"]')?.addEventListener('click', () => {
    temporaryClass('nkt-knight-secret', 2200);
    if (markFound('knight')) say('♞ The knight galloped off. Secret found.', 'gold');
  });

  // New discovery: tap the three live stats in order — Members, Avg. Daily, Founded.
  const statStrip = document.getElementById('nkt-stat-triad');
  const statOrder = ['member-count', 'daily-rating', 'club-year'];
  let statStep = 0;
  let statTimer = 0;
  statStrip?.addEventListener('click', event => {
    const stat = event.target.closest('.stat');
    if (!stat) return;
    const value = stat.querySelector('strong')?.id;
    if (value !== statOrder[statStep]) statStep = value === statOrder[0] ? 1 : 0;
    else statStep++;
    window.clearTimeout(statTimer);
    if (statStep === statOrder.length) {
      statStep = 0;
      temporaryClass('nkt-triad-secret', 2200);
      showSecret('THREE PILLARS · ONE TOLI');
      if (markFound('triad')) say('♛ Three Pillars unlocked. Secret found.', 'gold');
    } else statTimer = window.setTimeout(() => { statStep = 0; }, 2600);
  });

  // New discovery: triple-click the motto for a brief, word-by-word highlight.
  const motto = document.getElementById('nkt-motto');
  let mottoClicks = 0;
  let mottoTimer = 0;
  motto?.addEventListener('click', () => {
    mottoClicks++;
    window.clearTimeout(mottoTimer);
    if (mottoClicks >= 3) {
      mottoClicks = 0;
      temporaryClass('nkt-motto-secret', 2400);
      showSecret('NEXUS · KNOWLEDGE · TRIUMPH');
      if (markFound('motto')) say('✧ The motto glowed. Secret found.', 'gold');
    } else mottoTimer = window.setTimeout(() => { mottoClicks = 0; }, 1500);
  });

  // New discovery: double-click the daily quote to reveal a temporary archive line.
  const quote = document.getElementById('daily-quote');
  const credit = document.getElementById('quote-credit');
  quote?.addEventListener('dblclick', () => {
    if (!credit) return;
    const oldQuote = quote.textContent;
    const oldCredit = credit.textContent;
    quote.textContent = '“The quietest move can change the whole position.”';
    credit.textContent = '— A note from the NKT Archive';
    temporaryClass('nkt-quote-secret', 3600);
    if (markFound('quote')) say('❝ A line from the NKT Archive. Secret found.', 'gold');
    time('quote-copy', () => { quote.textContent = oldQuote; credit.textContent = oldCredit; }, 3600);
  });


  // ---------- NEW: visible secret buttons ----------
  // 1) Pawn promotion — tap repeatedly: Pawn → Knight → Bishop → Rook → Queen.
  const promoBtn = document.getElementById('egg-promote');
  const promoGlyph = document.getElementById('egg-promote-glyph');
  const promoLabel = document.getElementById('egg-promote-label');
  const ladder = [
    { g: '♟', n: 'PAWN', l: 'PROMOTE ME', m: 'A humble pawn. Tap again — it has dreams.' },
    { g: '♞', n: 'KNIGHT', l: 'KEEP GOING', m: 'A knight! It jumped the queue.' },
    { g: '♝', n: 'BISHOP', l: 'ALMOST…', m: 'Bishop! Diagonally ambitious.' },
    { g: '♜', n: 'ROOK', l: 'ONE MORE', m: 'A rook. Solid. Reliable. Not done yet.' },
    { g: '♛', n: 'QUEEN', l: 'LONG LIVE THE QUEEN', m: 'PROMOTED! The most powerful piece on the board.' }
  ];
  let rung = 0;
  promoBtn?.addEventListener('click', () => {
    if (rung >= ladder.length - 1) return;
    rung++;
    const step = ladder[rung];
    promoGlyph.textContent = step.g;
    promoLabel.textContent = step.l;
    promoBtn.classList.remove('is-pop'); void promoBtn.offsetWidth; promoBtn.classList.add('is-pop');
    say(step.m, rung === ladder.length - 1 ? 'gold' : '');
    if (rung === ladder.length - 1) {
      promoBtn.classList.add('is-queen');
      burst({ glyphs: ['♛', '✦', '♕', '✧'], hues: [43, 48, 38], count: 55, from: promoBtn });
      if (markFound('promote')) say('PROMOTED! ♛ The most powerful piece on the board. Secret found.', 'gold');
      time('promo-reset', () => {
        rung = 0; promoGlyph.textContent = ladder[0].g; promoLabel.textContent = ladder[0].l;
        promoBtn.classList.remove('is-queen');
      }, 4200);
    }
  });

  // 2) Fortune — a fresh chess fortune every tap, never the same twice in a row.
  const fortuneBtn = document.getElementById('egg-fortune');
  const fortunes = [
    'You will find a fork today. Not in the kitchen.',
    'Castle early. Overthink later.',
    'A quiet move beats a loud blunder.',
    'Your next opponent will hang a queen. Do not gloat.',
    'The pawn you ignored is about to matter.',
    'En passant: because some chances only exist for one move.',
    'A draw today is a win against tilt.',
    'Trade the bishop. Keep the dream.',
    'Zugzwang is just life asking you to pick a move.',
    'Someone in the Toli is thinking of you. They want a rematch.',
    'Time is the one piece you cannot sacrifice.',
    'The best move is the one you checked twice.'
  ];
  let lastFortune = -1, fortuneTaps = 0;
  fortuneBtn?.addEventListener('click', () => {
    let i; do { i = Math.floor(Math.random() * fortunes.length); } while (i === lastFortune);
    lastFortune = i; fortuneTaps++;
    fortuneBtn.classList.remove('is-pop'); void fortuneBtn.offsetWidth; fortuneBtn.classList.add('is-pop');
    burst({ glyphs: ['✦', '✧'], hues: [270, 285, 43], count: 22, from: fortuneBtn });
    say(`✦ ${fortunes[i]}`, 'violet');
    if (fortuneTaps >= 1) markFound('fortune');
  });

  // 3) Do Not Press — escalates over three presses, then the king topples.
  const kingBtn = document.getElementById('egg-king');
  const kingGlyph = document.getElementById('egg-king-glyph');
  const kingLabel = document.getElementById('egg-king-label');
  const kingLines = [
    ['I SAID… DON’T', 'Hey. The button literally says do not press.'],
    ['LAST WARNING', 'The king is nervous. Do not press again.'],
    ['CHECKMATE.', 'You pressed it anyway. The king has fallen.']
  ];
  let kingStep = 0;
  kingBtn?.addEventListener('click', () => {
    if (kingBtn.classList.contains('is-fallen')) return;
    const [lab, msg] = kingLines[kingStep];
    kingLabel.textContent = lab;
    kingBtn.dataset.lean = String(kingStep + 1);
    kingBtn.classList.remove('is-shake'); void kingBtn.offsetWidth; kingBtn.classList.add('is-shake');
    say(msg, 'red');
    kingStep++;
    if (kingStep >= kingLines.length) {
      kingStep = 0;
      kingBtn.classList.add('is-fallen');
      temporaryClass('nkt-king-secret', 900);
      burst({ glyphs: ['♚', '✕', '♔'], hues: [0, 8, 20], count: 38, from: kingBtn });
      if (markFound('king')) say('CHECKMATE. ♚ You pressed it anyway. Secret found.', 'red');
      time('king-reset', () => {
        kingBtn.classList.remove('is-fallen', 'is-shake'); delete kingBtn.dataset.lean;
        kingLabel.textContent = 'DO NOT PRESS';
        say('The king stood back up. He never learns.');
      }, 3600);
    }
  });

  // 4) Golden pawn — drifts across the part of the sidebar you are currently looking at.
  let goldenSpawned = false;
  function spawnGolden() {
    if (goldenSpawned || found.has('golden') || reduced) return;
    // Don't spawn while the music view is open (home view hidden).
    if (document.getElementById('home-view')?.hidden) { time('golden-next', spawnGolden, 8000); return; }
    goldenSpawned = true;
    const pawn = document.createElement('button');
    pawn.type = 'button'; pawn.className = 'golden-pawn';
    pawn.setAttribute('aria-label', 'A golden pawn — catch it!');
    pawn.textContent = '♟';
    // Place it inside the visible viewport, in sidebar coordinates.
    const rect = sidebar.getBoundingClientRect();
    const viewTop = Math.max(0, -rect.top);
    const span = Math.max(120, Math.min(window.innerHeight, rect.height) - 160);
    pawn.style.top = `${Math.round(viewTop + 80 + Math.random() * span)}px`;
    sidebar.append(pawn);
    const retry = () => { if (!found.has('golden')) time('golden-next', spawnGolden, 25000); };
    const leave = () => { pawn.remove(); goldenSpawned = false; retry(); };
    pawn.addEventListener('animationend', event => { if (event.animationName === 'golden-drift') leave(); });
    pawn.addEventListener('click', () => {
      burst({ glyphs: ['♟', '✦', '★'], hues: [45, 50, 38], count: 45, from: pawn });
      if (markFound('golden')) say('★ You caught the Golden Pawn! Secret found.', 'gold');
      pawn.remove(); goldenSpawned = false;
    }, { once: true });
  }
  time('golden-first', spawnGolden, 6000 + Math.random() * 4000);

  // 5) Konami code — ↑ ↑ ↓ ↓ ← → ← → B A rains gold.
  const konami = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', event => {
    if (event.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
    const k = event.key.toLowerCase();
    konamiIdx = k === konami[konamiIdx] ? konamiIdx + 1 : (k === konami[0] ? 1 : 0);
    if (konamiIdx === konami.length) {
      konamiIdx = 0;
      for (let n = 0; n < 4; n++) time(`gold-${n}`, () => burst({ glyphs: ['♛', '✦', '♞', '★', '♟'], hues: [43, 48, 52], count: 40 }), n * 350);
      showSecret('↑↑↓↓←→←→BA · GOLD RAIN');
      if (markFound('konami')) say('★ The old code still works. Secret found.', 'gold');
    }
  });

  window.addEventListener('resize', () => { if (active) cleanupChaos(); });
  window.addEventListener('pagehide', () => {
    window.clearTimeout(clickTimer);
    window.clearTimeout(statTimer);
    window.clearTimeout(mottoTimer);
    for (const timer of timers.values()) window.clearTimeout(timer);
    timers.clear();
    cleanupChaos();
    ['nkt-spark-secret', 'nkt-knight-secret', 'nkt-triad-secret', 'nkt-motto-secret', 'nkt-quote-secret', 'nkt-king-secret'].forEach(name => sidebar.classList.remove(name));
  }, { once: true });
}
