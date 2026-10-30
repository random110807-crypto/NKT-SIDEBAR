// ==UserScript==
// @name         NKT Club Sidebar
// @namespace    https://github.com/YOUR-USERNAME/nkt-sidebar
// @version      1.0
// @description  Floating NKT sidebar on chess.com club pages (for members who install it)
// @match        https://www.chess.com/club/nashediyon-ki-toli*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://YOUR-USERNAME.github.io/nkt-sidebar/config.js
// @require      https://YOUR-USERNAME.github.io/nkt-sidebar/app.js
// @resource     NKT_CSS https://YOUR-USERNAME.github.io/nkt-sidebar/style.css
// ==/UserScript==
(function () {
  GM_addStyle(GM_getResourceText("NKT_CSS"));
  const wrap = document.createElement("div");
  wrap.id = "nkt";
  wrap.dataset.manual = "1";
  Object.assign(wrap.style, { position: "fixed", top: "70px", right: "16px", zIndex: 9999, maxHeight: "calc(100vh - 90px)", overflowY: "auto" });
  document.body.appendChild(wrap);

  const tab = document.createElement("button");
  tab.textContent = "♞ NKT";
  Object.assign(tab.style, { position: "fixed", top: "70px", right: "0", zIndex: 10000, display: "none", padding: "8px 12px", background: "#0b1226", color: "#e8c26a", border: "1px solid #e8c26a", borderRadius: "10px 0 0 10px", cursor: "pointer", fontWeight: 700 });
  document.body.appendChild(tab);
  tab.onclick = () => { wrap.style.display = "block"; tab.style.display = "none"; };

  window.NKT_mount(wrap);
  const close = document.createElement("button");
  close.textContent = "✕";
  Object.assign(close.style, { position: "absolute", top: "8px", right: "10px", background: "none", border: 0, color: "#93a0c0", cursor: "pointer", fontSize: "14px" });
  close.onclick = () => { wrap.style.display = "none"; tab.style.display = "block"; };
  wrap.firstElementChild.style.position = "relative";
  wrap.prepend(close);
})();
