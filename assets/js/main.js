/**
 * DRLSYS — portfolio site controller
 *
 * Three small, independent pieces: (1) nav background swap + top progress rail
 * on scroll, (2) a generic scroll-reveal (IntersectionObserver, fade+rise,
 * staggered by DOM order) applied to every `.reveal` element, (3) the
 * Tajima-style numbered portfolio index — click (or hover, on pointer devices)
 * an item in the left list to swap the active case shown on the right.
 */
(function () {
  "use strict";

  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };

  /* ---------- nav + progress rail ---------- */
  var nav = document.getElementById("nav");
  var pageProgress = document.getElementById("pageProgress");
  var ticking = false;

  function pageProgressValue() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(window.scrollY / total, 0, 1);
  }

  function onScrollUpdate() {
    ticking = false;
    if (pageProgress) pageProgress.style.width = (pageProgressValue() * 100).toFixed(2) + "%";
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(onScrollUpdate);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  document.addEventListener("DOMContentLoaded", onScrollUpdate);
  onScrollUpdate();

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (revealEls.length && "IntersectionObserver" in window) {
    // stagger siblings that reveal together (same parent) by DOM order
    var staggerCounters = new WeakMap();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var count = staggerCounters.get(parent) || 0;
      el.style.transitionDelay = Math.min(count * 70, 420) + "ms";
      staggerCounters.set(parent, count + 1);
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- showcase: site viewer dropdown ---------- */
  var scSelect = document.getElementById("showcaseSelect");
  var scFrame = document.getElementById("showcaseFrame");
  if (scSelect && scFrame) {
    var scUrl = document.getElementById("showcaseUrl");
    var scOpen = document.getElementById("showcaseOpen");
    var scMobileOpen = document.getElementById("showcaseMobileOpen");
    var scViewer = document.getElementById("showcaseViewer");
    var scSync = function () {
      var url = scSelect.value;
      if (!url) { scViewer.hidden = true; scFrame.removeAttribute("src"); return; }
      scViewer.hidden = false;
      scUrl.textContent = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
      scOpen.href = url;
      scMobileOpen.href = url;
      scFrame.src = url;
    };
    scSelect.addEventListener("change", scSync);
  }

  /* ---------- stats count-up (0 → target, once, when scrolled into view) ---------- */
  var countEls = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
  function runCountUp(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    var duration = 1200;
    var start = null;
    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if (countEls.length && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCountUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    countEls.forEach(function (el) { countObserver.observe(el); });
  } else {
    countEls.forEach(function (el) { el.textContent = el.getAttribute("data-count-to"); });
  }

})();
