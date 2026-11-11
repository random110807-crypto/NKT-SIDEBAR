import { CONFIG } from "./config.js";
import { fetchClub, fetchMembers, fetchPlayerBundle, getUniqueMembers, getHighestElo } from "./chess-api.js";
import { renderClub, renderRecentMembers, showClubError, showMembersError, applyBrandAssets, applyConfiguredLinks } from "./ui.js";
import { renderDailyQuote } from "./quotes.js";
import { initWorldClock } from "./world-clock.js";
import { initMusicPlayer } from "./music-player.js";
import { initEventCards } from "./event-cards.js";
import { initEasterEggs } from "./easter-eggs.js";

async function loadClubData() {
  try { const club = await fetchClub(); renderClub(club.data, club.cached); }
  catch (error) { showClubError(error.message.includes('404') ? 'Club profile not found. Check the club ID in js/config.js.' : 'Chess.com club profile is temporarily unavailable.'); }
  try {
    const result = await fetchMembers();
    const roster = getUniqueMembers(result.data);
    if (!roster.length) { renderRecentMembers([], new Map()); return; }
    const recent = roster.slice(0, CONFIG.recentMemberCount);
    const bundles = new Map();
    for (let i = 0; i < recent.length; i += 4) {
      const batch = recent.slice(i, i + 4);
      const rows = await Promise.all(batch.map(async member => {
        try { const bundle = await fetchPlayerBundle(member.username); return [member.username.toLowerCase(), { ...bundle, best: getHighestElo(bundle.stats) }]; }
        catch { return [member.username.toLowerCase(), { profile:{}, stats:{}, best:null }]; }
      }));
      rows.forEach(([name, bundle]) => bundles.set(name, bundle));
    }
    renderRecentMembers(recent, bundles);
  } catch (error) { showMembersError(error.message.includes('404') ? 'Chess.com did not return a public member list for this club.' : 'Member data is temporarily unavailable. Try again later.'); }
}

applyBrandAssets(CONFIG);
applyConfiguredLinks(CONFIG);
renderDailyQuote();
initWorldClock();
initMusicPlayer();
initEventCards(CONFIG.events);
initEasterEggs();
loadClubData();

// Music view navigation only; all competition/features navigation has been removed.
const musicView = document.getElementById('music-view');
const homeView = document.getElementById('home-view');
const openMusic = document.getElementById('open-music');
const backHome = document.getElementById('back-home');
openMusic?.addEventListener('click', () => { homeView.hidden = true; musicView.hidden = false; window.scrollTo(0,0); });
backHome?.addEventListener('click', () => { musicView.hidden = true; homeView.hidden = false; window.scrollTo(0,0); });
const audio = document.getElementById('audio-player');
if (audio && openMusic) {
  audio.addEventListener('play', () => openMusic.classList.add('is-playing'));
  ['pause','emptied','ended','error'].forEach(type => audio.addEventListener(type, () => openMusic.classList.remove('is-playing')));
}

// ---- Smoothness polish: scroll-reveal + pointer spotlight (both optional, never block content) ----
(function polish() {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.home-view .panel, .home-view .event-card, .home-view .footer');
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    targets.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return;           // already on screen: leave untouched
      el.classList.add('will-reveal'); io.observe(el);
    });
  }
  document.querySelectorAll('.panel').forEach(panel => {
    panel.addEventListener('pointermove', e => {
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
      panel.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  });
})();
