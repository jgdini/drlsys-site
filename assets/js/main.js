(function () {
  "use strict";

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- navegação: sombra ao rolar e menu no celular ---------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        nav.classList.toggle("is-scrolled", window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  if (nav && navToggle && navMenu) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };
    navToggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    navMenu.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) setMenu(false); });
  }

  /* ---------- seletor de modelos de sites ---------- */
  var scSelect = document.getElementById("showcaseSelect");
  var scFrame = document.getElementById("showcaseFrame");
  if (scSelect && scFrame) {
    var scUrl = document.getElementById("showcaseUrl");
    var scOpen = document.getElementById("showcaseOpen");
    var scMobileOpen = document.getElementById("showcaseMobileOpen");
    var scViewer = document.getElementById("showcaseViewer");
    scSelect.addEventListener("change", function () {
      var url = scSelect.value;
      if (!url) { scViewer.hidden = true; scFrame.removeAttribute("src"); return; }
      scViewer.hidden = false;
      scUrl.textContent = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
      scOpen.href = url;
      scMobileOpen.href = url;
      scFrame.src = url;
    });
  }

  if (reducedMotion) return;

  /* ---------- números: contam uma vez ao entrar na tela ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
  if (counters.length && "IntersectionObserver" in window) {
    var run = function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      var start = null;
      var step = function (t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / 1100, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- linha do tempo do projeto: desenha e acende as etapas ao entrar na tela ---------- */
  var timeline = document.querySelector(".process__list");
  if (timeline && "IntersectionObserver" in window) {
    timeline.classList.add("js-anim");
    var timelineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        timeline.classList.add("is-on");
        timelineObserver.disconnect();
      });
    }, { threshold: 0.2 });
    timelineObserver.observe(timeline);
  }

  /* ---------- painel do hero: latência ilustrativa ---------- */
  var latencyEl = document.querySelector("[data-noc-latency]");
  if (latencyEl) {
    window.setInterval(function () { latencyEl.textContent = 10 + Math.floor(Math.random() * 6); }, 2200);
  }
})();
