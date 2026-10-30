/* ============================================================
   NKT SIDEBAR — EDIT THIS FILE ONLY
   Everything the sidebar shows is controlled from here.
   ============================================================ */
window.NKT_CONFIG = {
  club: {
    name: "NKT",
    fullName: "Nashediyon Ki Toli",
    tagline: ["Play", "Learn", "Compete", "Vibe"],
    // The part after chess.com/club/ in your club URL  <-- CHANGE IF DIFFERENT
    slug: "nashediyon-ki-toli",
  },

  // Rotating quote slideshow
  quoteIntervalMs: 6000,
  quotes: [
    { text: "Not just stronger players, but stronger minds.", by: "NKT" },
    { text: "Chess is life in miniature.", by: "Garry Kasparov" },
    { text: "Every chess master was once a beginner.", by: "Irving Chernev" },
    { text: "Tactics flow from a superior position.", by: "Bobby Fischer" },
    { text: "The pawns are the soul of chess.", by: "Philidor" },
    { text: "Play the opponent, not just the board.", by: "NKT" },
    { text: "Lose gracefully. Learn greedily.", by: "NKT" },
  ],

  // Deep links into your real club pages (chess.com does the heavy lifting)
  links: [
    { icon: "🏠", title: "Home",        sub: "Club updates & announcements", path: "" },
    { icon: "👥", title: "Members",     sub: "Meet the toli",               path: "/members" },
    { icon: "🏆", title: "Events",      sub: "Tournaments & activities",    path: "/events" },
    { icon: "📖", title: "Resources",   sub: "Guides, openings, tools",     path: "/resources" },
    { icon: "💬", title: "Discussions", sub: "Share, learn, vibe",          path: "/forum" },
  ],

  // Events — the sidebar counts down to the next upcoming one.
  // date = local time of your club (ISO). url = the real event/tournament page.
  events: [
    { title: "NKT Friday Blitz Arena", date: "2026-11-06T20:00:00+05:30", url: "https://www.chess.com/club/nashediyon-ki-toli/events" },
    { title: "Sunday Rapid Showdown",  date: "2026-11-08T19:00:00+05:30", url: "https://www.chess.com/club/nashediyon-ki-toli/events" },
  ],

  // "Opening of the Day" rotates by date. Link them to your resources posts.
  openings: [
    { name: "Italian Game",        moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4", vibe: "Classic & friendly",   url: "https://www.chess.com/openings/Italian-Game" },
    { name: "Sicilian Defense",    moves: "1.e4 c5",                  vibe: "Fighting chess",       url: "https://www.chess.com/openings/Sicilian-Defense" },
    { name: "London System",       moves: "1.d4 d5 2.Bf4",            vibe: "Solid & easy to learn", url: "https://www.chess.com/openings/London-System" },
    { name: "Queen's Gambit",      moves: "1.d4 d5 2.c4",             vibe: "Timeless",             url: "https://www.chess.com/openings/Queens-Gambit" },
    { name: "King's Indian",       moves: "1.d4 Nf6 2.c4 g6",         vibe: "Attack the king!",     url: "https://www.chess.com/openings/Kings-Indian-Defense" },
    { name: "French Defense",      moves: "1.e4 e6 2.d4 d5",          vibe: "Rock solid",           url: "https://www.chess.com/openings/French-Defense" },
    { name: "Caro-Kann",           moves: "1.e4 c6",                  vibe: "Safe but sharp",       url: "https://www.chess.com/openings/Caro-Kann-Defense" },
  ],

  // Chess.com username of whoever should be mentioned in the footer (optional)
  footer: "Made with ♟ by NKT",
};
