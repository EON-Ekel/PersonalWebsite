/* Michael Oktavian, portfolio. Plain JavaScript, no dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { /* storage can be blocked, the page works without it */ }
    return null;
  }

  /* ---------------------------------------------------------- theme */
  var themeBtn = $("#theme-toggle");
  var dark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function isDark() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return !!(dark && dark.matches);
  }
  function paintThemeBtn() {
    var d = isDark();
    themeBtn.setAttribute("aria-pressed", d ? "true" : "false");
    themeBtn.setAttribute("aria-label", d ? "Switch to day theme" : "Switch to night theme");
  }
  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("theme", next);
    paintThemeBtn();
  });
  if (dark && dark.addEventListener) dark.addEventListener("change", paintThemeBtn);
  paintThemeBtn();

  /* ---------------------------------------------------------- mobile menu */
  var nav = $("#top");
  var menuBtn = $("#menu-btn");
  function setMenu(open) {
    nav.setAttribute("data-open", open ? "true" : "false");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(nav.getAttribute("data-open") !== "true"); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) setMenu(false); });

  /* ---------------------------------------------------------- current section in the nav */
  var links = $$("#menu a");
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = byId[en.target.id];
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).concat(["home"]).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------------------------------------------------------- certificate filter */
  var filterBtns = $$(".chip-btn[data-filter]");
  var items = $$("#cert-grid > li");
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      items.forEach(function (li) { li.hidden = !(f === "all" || li.getAttribute("data-cat") === f); });
    });
  });

  /* ---------------------------------------------------------- lightbox */
  var box = $("#lightbox");
  var lbImg = $("#lb-img");
  var lbTitle = $("#lb-title");
  var current = -1;

  function visibleCerts() {
    return $$(".cert", $("#cert-grid")).filter(function (c) { return !c.closest("li").hidden; });
  }
  function show(list, i) {
    if (!list.length) return;
    current = (i + list.length) % list.length;
    var c = list[current];
    lbImg.src = c.getAttribute("data-full");
    lbImg.alt = c.getAttribute("data-title") + " (full certificate)";
    lbTitle.textContent = c.getAttribute("data-title");
  }
  function open(btn) {
    var list = visibleCerts();
    show(list, list.indexOf(btn));
    if (box.showModal) { box.showModal(); } else { box.setAttribute("open", ""); }
  }
  function step(d) { var list = visibleCerts(); show(list, current + d); }
  $$(".cert").forEach(function (c) { c.addEventListener("click", function () { open(c); }); });
  $("#lb-prev").addEventListener("click", function () { step(-1); });
  $("#lb-next").addEventListener("click", function () { step(1); });
  $("#lb-close").addEventListener("click", function () { box.close ? box.close() : box.removeAttribute("open"); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  box.addEventListener("close", function () { lbImg.removeAttribute("src"); });

  /* ---------------------------------------------------------- copy email */
  var copyBtn = $("#copy-mail");
  var status = $("#copy-status");
  var mail = $("#mail");
  function selectMail() {
    var r = document.createRange();
    r.selectNodeContents(mail);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  copyBtn.addEventListener("click", function () {
    var text = mail.textContent.trim();
    var done = function (ok) {
      var old = copyBtn.textContent;
      copyBtn.textContent = ok ? "Copied" : "Press Ctrl+C to copy";
      status.textContent = ok ? "Email address copied" : "Email address selected";
      setTimeout(function () { copyBtn.textContent = "Copy email"; }, 2000);
      return old;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { selectMail(); done(false); });
    } else { selectMail(); done(false); }
  });

  /* ---------------------------------------------------------- footer year */
  var y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
