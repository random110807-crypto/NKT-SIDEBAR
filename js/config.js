// NKT sidebar configuration — edit only the links and event schedules below.
export const CONFIG = {
  clubSlug: "nashediyon-ki-toli-nkt",
  apiBase: "https://api.chess.com/pub",
  cacheTtlMs: 30 * 60 * 1000,
  recentMemberCount: 3,
  clubLogoPath: "assets/images/nkt-club-logo.png",
  sidebarBackgroundPath: "assets/images/nkt-sidebar-background.jpg",
  links: {
    feedback: "",
    adminApplication: ""
  },
  // NEXT CLASH OF CLUBS EVENT — edit only url and startAt for each new event.
  // Use an ISO 8601 date/time with an explicit timezone, e.g. 2026-12-01T19:30:00+05:30.
  // endAt is optional; add it only when you want an automatic EVENT COMPLETE state.
  // Weekday/date text and the live countdown are generated automatically.
  events: {
    mca: {
      title: "NKT Clash of Clubs",
      url: "",
      startAt: "",
      endAt: ""
    },
    // Supporting event cards retain their existing link-first configuration.
    voteChess: { title: "NKT Vote Chess", opponent: "", url: "", startAt: "", endAt: "" },
    dailyChess: { title: "NKT Daily Chess", opponent: "", url: "", startAt: "", endAt: "" }
  },
  tracks: [
    { title: "7 Years", file: "assets/music/7 Years.mp3" },
    { title: "Broken World", file: "assets/music/Broken World.mp3" },
    { title: "Carmen Habanera", file: "assets/music/Carmen Habanera.mp3" },
    { title: "Golden Hour", file: "assets/music/Golden Hour.mp3" },
    { title: "Loser", file: "assets/music/Loser.mp3" }
  ]
};
