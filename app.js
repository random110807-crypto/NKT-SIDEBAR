/* NKT Sidebar — vanilla JS, no dependencies. Reads window.NKT_CONFIG. */
(function () {
  const C = window.NKT_CONFIG;
  const API = "https://api.chess.com/pub";
  const clubUrl = "https://www.chess.com/club/" + C.club.slug;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const getJSON = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });

  function build(root) {
    root.innerHTML = `
      <div class="nkt-head">
        <div class="nkt-crest">♛</div>
        <h1 class="nkt-name">${esc(C.club.name)}</h1>
        <div class="nkt-full">${esc(C.club.fullName)}</div>
        <div class="nkt-tag">${C.club.tagline.map(esc).join("<i>•</i>")}</div>
      </div>

      <div class="nkt-stats">
        <div class="nkt-chip"><b id="nkt-members">–</b><span>Members</span></div>
        <div class="nkt-chip"><b id="nkt-week">–</b><span>Joined / wk</span></div>
        <div class="nkt-chip"><b id="nkt-age">–</b><span>Club age</span></div>
      </div>

      <a class="nkt-join" href="${clubUrl}" target="_blank" rel="noopener">👥 Join the Club ›</a>

      <div class="nkt-nav">
        ${C.links.map((l) => `
          <a class="nkt-link" href="${clubUrl}${l.path}" target="_blank" rel="noopener">
            <span class="ic">${l.icon}</span>
            <span><b>${esc(l.title)}</b><small>${esc(l.sub)}</small></span>
            <span class="arr">›</span>
          </a>`).join("")}
      </div>

      <div class="nkt-card" id="nkt-event"></div>
      <div class="nkt-card" id="nkt-puzzle"><h4>Daily Puzzle</h4><div class="nkt-skel">Setting up the board…</div></div>
      <div class="nkt-card" id="nkt-spot"><h4>Member Spotlight</h4><div class="nkt-skel">Finding a star…</div></div>
      <div class="nkt-card nkt-open" id="nkt-opening"></div>

      <div class="nkt-quote" id="nkt-quote">
        <div class="nkt-bar"></div>
        ${C.quotes.map((q) => `<div class="slide"><q>${esc(q.text)}</q><cite>— ${esc(q.by)}</cite></div>`).join("")}
        <div class="nkt-dots">${C.quotes.map(() => "<i></i>").join("")}</div>
      </div>
      <div class="nkt-foot">${esc(C.footer || "")}</div>`;
  }

  /* ---------- Quote slideshow ---------- */
  function quotes() {
    const box = $("#nkt-quote"), slides = [...box.querySelectorAll(".slide")], dots = [...box.querySelectorAll(".nkt-dots i")], bar = $(".nkt-bar", box);
    let i = Math.floor(Math.random() * slides.length), timer, paused = false;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("on", k === i));
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
      bar.style.transition = "none"; bar.style.width = "0";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = "width " + C.quoteIntervalMs + "ms linear"; bar.style.width = "100%";
      }));
    }
    function loop() { clearInterval(timer); timer = setInterval(() => !paused && show(i + 1), C.quoteIntervalMs); }
    dots.forEach((d, k) => d.addEventListener("click", () => { show(k); loop(); }));
    box.addEventListener("mouseenter", () => (paused = true));
    box.addEventListener("mouseleave", () => { paused = false; show(i); });
    show(i); loop();
  }

  /* ---------- Next event countdown ---------- */
  function events() {
    const el = $("#nkt-event");
    const upcoming = C.events.map((e) => ({ ...e, t: new Date(e.date).getTime() })).filter((e) => e.t > Date.now()).sort((a, b) => a.t - b.t)[0];
    if (!upcoming) { el.innerHTML = `<h4>Next Event</h4><div class="nkt-skel">No upcoming events — check the <a href="${clubUrl}/events" target="_blank" style="color:#e8c26a">events page</a>.</div>`; return; }
    el.innerHTML = `<h4>Next Event <em>${new Date(upcoming.t).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</em></h4>
      <a class="nkt-evt-title" href="${esc(upcoming.url)}" target="_blank" rel="noopener">${esc(upcoming.title)}</a>
      <div class="nkt-count"><div><b id="c-d">0</b><span>days</span></div><div><b id="c-h">0</b><span>hrs</span></div><div><b id="c-m">0</b><span>min</span></div><div><b id="c-s">0</b><span>sec</span></div></div>`;
    const tick = () => {
      let s = Math.max(0, Math.floor((upcoming.t - Date.now()) / 1000));
      $("#c-d").textContent = Math.floor(s / 86400); s %= 86400;
      $("#c-h").textContent = String(Math.floor(s / 3600)).padStart(2, "0"); s %= 3600;
      $("#c-m").textContent = String(Math.floor(s / 60)).padStart(2, "0");
      $("#c-s").textContent = String(s % 60).padStart(2, "0");
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Daily puzzle with mini board ---------- */
  const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  function boardHTML(fen) {
    const [place, turn] = fen.split(" ");
    let html = "", r = 0;
    place.split("/").forEach((row) => {
      let f = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) { for (let k = 0; k < +ch; k++) { html += sq(r, f++, ""); } }
        else { html += sq(r, f++, ch); }
      }
      r++;
    });
    function sq(rr, ff, ch) {
      const light = (rr + ff) % 2 === 0 ? "l" : "d";
      const side = ch ? (ch === ch.toUpperCase() ? "w" : "b") : "";
      return `<div class="nkt-sq ${light} ${side}">${ch ? GLYPH[ch.toLowerCase()] : ""}</div>`;
    }
    return { html: `<div class="nkt-board">${html}</div>`, turn: turn === "w" ? "White" : "Black" };
  }
  function puzzle() {
    getJSON(API + "/puzzle").then((p) => {
      const b = boardHTML(p.fen);
      $("#nkt-puzzle").innerHTML = `<h4>Daily Puzzle <em>${b.turn} to move</em></h4>${b.html}
        <div class="nkt-puz-meta"><span>${esc(p.title)}</span><a class="nkt-btn" href="${esc(p.url)}" target="_blank" rel="noopener">Solve ›</a></div>`;
    }).catch(() => { $("#nkt-puzzle").innerHTML = `<h4>Daily Puzzle</h4><a class="nkt-btn" href="https://www.chess.com/puzzles" target="_blank">Open puzzles ›</a>`; });
  }

  /* ---------- Club stats + member spotlight ---------- */
  function clubData() {
    getJSON(API + "/club/" + C.club.slug).then((d) => {
      $("#nkt-members").textContent = d.members_count ?? "–";
      if (d.created) {
        const days = (Date.now() / 1000 - d.created) / 86400;
        $("#nkt-age").textContent = days > 365 ? (days / 365).toFixed(1) + "y" : Math.floor(days) + "d";
      }
    }).catch(() => {});

    getJSON(API + "/club/" + C.club.slug + "/members").then((m) => {
      $("#nkt-week").textContent = (m.weekly || []).length;
      const pool = [...(m.weekly || []), ...(m.monthly || []), ...(m.all_time || [])];
      if (!pool.length) throw 0;
      const pick = () => spotlight(pool[Math.floor(Math.random() * pool.length)].username);
      pick();
      document.addEventListener("click", (e) => { if (e.target.closest("#nkt-reroll")) pick(); });
    }).catch(() => { $("#nkt-spot").innerHTML = `<h4>Member Spotlight</h4><div class="nkt-skel">Open the <a href="${clubUrl}/members" target="_blank" style="color:#e8c26a">members page</a> to meet the toli.</div>`; });
  }
  function spotlight(user) {
    Promise.all([getJSON(API + "/player/" + user), getJSON(API + "/player/" + user + "/stats").catch(() => ({}))]).then(([p, s]) => {
      const rating = (s.chess_rapid || s.chess_blitz || s.chess_bullet || {}).last?.rating;
      $("#nkt-spot").innerHTML = `<h4>Member Spotlight</h4><div class="nkt-spot">
        <img src="${esc(p.avatar || "https://www.chess.com/bundles/web/images/user-image.svg")}" alt="">
        <div><a href="${esc(p.url)}" target="_blank" rel="noopener"><b>${esc(p.username)}</b></a><small>${rating ? "Rating " + rating : "Chess player"}</small></div>
        <button class="nkt-reroll" id="nkt-reroll" title="Another member">🎲</button></div>`;
    }).catch(() => {});
  }

  /* ---------- Opening of the day (rotates daily) ---------- */
  function opening() {
    const day = Math.floor(Date.now() / 86400000), o = C.openings[day % C.openings.length];
    $("#nkt-opening").innerHTML = `<h4>Opening of the Day</h4><b>${esc(o.name)}</b> <small style="color:#93a0c0">· ${esc(o.vibe)}</small>
      <code>${esc(o.moves)}</code><a class="nkt-btn" href="${esc(o.url)}" target="_blank" rel="noopener">Explore ›</a>`;
  }

  window.NKT_mount = function (root) {
    build(root); quotes(); events(); puzzle(); clubData(); opening();
  };
  const auto = document.getElementById("nkt");
  if (auto && !auto.dataset.manual) window.NKT_mount(auto);
})();
