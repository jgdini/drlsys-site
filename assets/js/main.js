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

  /* ---------- portfolio: mosaic grid + lightbox with prev/next slider ----------
   * Mirrors taotajima.jp's per-project page: big title, media, and a bottom
   * "← #prev / #next →" bar to flip straight to the neighboring case without
   * closing. Case content lives here (not duplicated in the HTML) since the
   * lightbox is a single reused panel populated on open. */
  var CASES = [
    {
      num: "#001", name: "Metalloys · Schem · Nicomo", kind: "client work",
      desc: "Grupo com infraestrutura complexa unificada entre as três empresas: rede UniFi, virtualização Proxmox, backup Veeam e em nuvem, e-mail corporativo Zimbra, 3 Active Directories, firewall dedicado, VPN site-to-site IPSec entre todas as unidades, links de internet redundantes e OpenVPN para acesso remoto.",
      media: "video", src: "assets/video/unit0-servidores.mp4", poster: "assets/video/posters/unit0-servidores.jpg",
      logos: [
        { src: "assets/images/logos/metalloys.jpg", name: "Metalloys" },
        { src: "assets/images/logos/schemgroup.png", name: "Schem Group" }
      ]
    },
    {
      num: "#002", name: "Sulmedic", kind: "client work",
      desc: "Infraestrutura de rede Wi-Fi Ubiquiti de alta densidade em galpão industrial.",
      media: "image", src: "assets/images/sulmedic-ubiquiti.jpg",
      logos: [{ src: "assets/images/logos/sulmedic.svg", name: "Sulmedic" }]
    },
    {
      num: "#003", name: "Studio Vero", kind: "client work",
      desc: "Storage de backup corporativo, redundante e monitorado.",
      media: "video", src: "assets/video/unit3-backup.mp4", poster: "assets/video/posters/unit3-backup.jpg",
      logos: [{ src: "assets/images/logos/studiovero.jpg", name: "Studio Vero" }]
    },
    {
      num: "#004", name: "OnStage Academy", kind: "client work",
      desc: "Cliente internacional — implantação de Office 365 e OneDrive para todo o grupo.",
      media: "video", src: "assets/video/unit2-seguranca.mp4", poster: "assets/video/posters/unit2-seguranca.jpg",
      logos: [
        { src: "assets/images/logos/microsoft.svg", name: "Microsoft" },
        { src: "assets/images/logos/office365.svg", name: "Office 365" }
      ]
    },
    {
      num: "#005", name: "Sites", kind: "desenvolvimento web",
      desc: 'Sites e landing pages sob medida, pensados para Google e para IAs. <a href="#sites">Veja os modelos e navegue neles</a>.',
      media: "link", href: "#sites", thumb: "assets/images/hanaoka.jpg"
    }
  ];

  var PLAY_ICON = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5z" fill="currentColor"/></svg>';
  var LINK_ICON = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var lightbox = document.getElementById("portfolioLightbox");
  if (lightbox && CASES.length) {
    var lbNum = document.getElementById("lightboxNum");
    var lbTitle = document.getElementById("lightboxTitle");
    var lbMedia = document.getElementById("lightboxMedia");
    var lbDesc = document.getElementById("lightboxDesc");
    var lbLogos = document.getElementById("lightboxLogos");
    var lbPrev = document.getElementById("lightboxPrev");
    var lbNext = document.getElementById("lightboxNext");
    var lbPrevNum = document.getElementById("lightboxPrevNum");
    var lbPrevName = document.getElementById("lightboxPrevName");
    var lbNextNum = document.getElementById("lightboxNextNum");
    var lbNextName = document.getElementById("lightboxNextName");
    var currentIndex = 0;
    var lastFocused = null;

    function mediaHtml(item) {
      if (item.media === "self") {
        return '<span class="portfolio-lightbox__media-placeholder">' + PLAY_ICON + "<em>Você está nele agora ↑</em></span>";
      }
      if (item.media === "link") {
        var bg = item.thumb ? '<img class="portfolio-lightbox__photo" src="' + item.thumb + '" alt="' + item.name + '">' : "";
        var external = item.href.charAt(0) !== "#";
        return '<a href="' + item.href + '"' + (external ? ' target="_blank" rel="noopener"' : "") + ">" + bg + '<span class="portfolio-lightbox__media-placeholder portfolio-lightbox__media-placeholder--tag">' + LINK_ICON + "<em>" + item.href.replace(/^https?:\/\//, "") + " ↗</em></span></a>";
      }
      if (item.media === "video") {
        return '<video class="portfolio-lightbox__video" src="' + item.src + '" poster="' + item.poster + '" autoplay muted loop playsinline preload="auto"></video>';
      }
      if (item.media === "image") {
        return '<img class="portfolio-lightbox__photo" src="' + item.src + '" alt="' + item.name + '">';
      }
      return '<span class="portfolio-lightbox__media-placeholder">' + PLAY_ICON + "<em>Vídeo em breve</em></span>";
    }

    // Small logo chips — the real client/partner brand(s) behind a case. On a
    // light chip so it reads regardless of whether the source logo file is
    // designed for light or dark backgrounds.
    function logosHtml(item) {
      if (!item.logos || !item.logos.length) return "";
      return item.logos.map(function (logo) {
        return '<span class="portfolio-logo-chip"><img src="' + logo.src + '" alt="' + logo.name + '"></span>';
      }).join("");
    }

    function render(index) {
      currentIndex = (index + CASES.length) % CASES.length;
      var item = CASES[currentIndex];
      var prevItem = CASES[(currentIndex - 1 + CASES.length) % CASES.length];
      var nextItem = CASES[(currentIndex + 1) % CASES.length];

      lbNum.textContent = item.num;
      lbTitle.textContent = item.name;
      lbDesc.innerHTML = item.desc;
      lbMedia.innerHTML = mediaHtml(item);
      lbMedia.classList.toggle("is-self", item.media === "self");
      lbLogos.innerHTML = logosHtml(item);

      lbPrevNum.textContent = prevItem.num;
      lbPrevName.textContent = prevItem.name;
      lbNextNum.textContent = nextItem.num;
      lbNextName.textContent = nextItem.name;
    }

    function openLightbox(index) {
      lastFocused = document.activeElement;
      render(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // Grid thumbnails preview the same real media the lightbox uses (playing
    // video / an actual photo) instead of a static icon-on-gradient card —
    // only the "self" case (no real footage to show) keeps the plain gradient.
    function thumbMediaHtml(item) {
      if (item.media === "video") {
        return '<video class="portfolio-card__media" src="' + item.src + '" poster="' + item.poster + '" autoplay muted loop playsinline preload="metadata"></video>';
      }
      if (item.media === "image") {
        return '<img class="portfolio-card__media" src="' + item.src + '" alt="' + item.name + '">';
      }
      if (item.media === "link" && item.thumb) {
        return '<img class="portfolio-card__media" src="' + item.thumb + '" alt="' + item.name + '">';
      }
      return "";
    }

    Array.prototype.slice.call(document.querySelectorAll(".portfolio-card")).forEach(function (card) {
      var btn = card.querySelector(".portfolio-card__open");
      var index = parseInt(card.getAttribute("data-case"), 10) || 0;
      if (btn) btn.addEventListener("click", function () { openLightbox(index); });

      var item = CASES[index];
      var thumb = card.querySelector(".portfolio-card__thumb");
      if (item && thumb) {
        var media = thumbMediaHtml(item);
        if (media) {
          thumb.insertAdjacentHTML("afterbegin", media);
          thumb.classList.add("has-media");
          // A still photo isn't playable — the play-triangle icon only belongs
          // on real video thumbnails, so drop it for static images.
          if (item.media === "image") {
            var icon = thumb.querySelector("svg");
            if (icon) icon.remove();
          }
        }
      }

      // Description shows right on the grid card now — no click needed to
      // read what each case is about, the lightbox is just for the bigger view.
      var meta = card.querySelector(".portfolio-card__meta");
      if (item && meta) {
        var descEl = card.querySelector(".portfolio-card__desc");
        if (!descEl) {
          descEl = document.createElement("p");
          descEl.className = "portfolio-card__desc";
          descEl.innerHTML = item.desc;
          meta.insertAdjacentElement("afterend", descEl);
        }

        var logos = logosHtml(item);
        if (logos) descEl.insertAdjacentHTML("afterend", '<div class="portfolio-card__logos">' + logos + "</div>");
      }
    });

    Array.prototype.slice.call(lightbox.querySelectorAll("[data-close]")).forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    lightbox.addEventListener("click", function (e) {
      var link = e.target.closest ? e.target.closest("a") : null;
      if (link && (link.getAttribute("href") || "").charAt(0) === "#") closeLightbox();
    });
    lbPrev.addEventListener("click", function () { render(currentIndex - 1); });
    lbNext.addEventListener("click", function () { render(currentIndex + 1); });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") render(currentIndex - 1);
      if (e.key === "ArrowRight") render(currentIndex + 1);
    });
  }
})();
