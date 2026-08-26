/**
 * DRLSYS — scroll controller
 *
 * Drives the "flying through the server" effect using a stack of real photo
 * layers (#photoStack, .photo-layer) crossfaded by scroll progress, plus a
 * slow Ken-Burns zoom on whichever layer is active. The right-side gallery
 * frame (#photoStack sibling, .gallery-frame__img) follows the same
 * data-unit → activeIdx pattern, so its photo always matches whichever
 * service is on screen instead of rotating independently. When/if a
 * cinematic AI-generated video is ready, this same activeIdx logic can
 * drive a canvas frame-sequence player instead — swap the target, keep
 * the progress math. Everything else (progress calc, panel activation,
 * nav, page rail) stays.
 */
(function () {
  "use strict";

  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };

  var nav = document.getElementById("nav");
  var pageProgress = document.getElementById("pageProgress");
  var scrub = document.getElementById("tour");
  var layers = Array.prototype.slice.call(document.querySelectorAll(".photo-layer"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".dot"));
  var scrubCue = document.getElementById("scrubCue");
  var galleryImgs = Array.prototype.slice.call(document.querySelectorAll(".gallery-frame__img"));
  var galleryLabel = document.getElementById("galleryLabel");

  var GALLERY_LABELS = ["INFRAESTRUTURA", "REDE", "SEGURANÇA", "CLOUD", "SUPORTE", "DEV"];

  var UNIT_COUNT = layers.length || panels.length || 6;

  var ticking = false;

  function scrubProgress() {
    if (!scrub) return 0;
    var rect = scrub.getBoundingClientRect();
    var total = scrub.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    var scrolled = -rect.top;
    return clamp(scrolled / total, 0, 1);
  }

  function pageProgressValue() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(window.scrollY / total, 0, 1);
  }

  function update() {
    ticking = false;

    // top progress rail
    if (pageProgress) pageProgress.style.width = (pageProgressValue() * 100).toFixed(2) + "%";

    // nav background
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 40);

    var p = scrubProgress();
    var activeIdx = Math.round(p * (UNIT_COUNT - 1));

    // photo crossfade + Ken Burns zoom on the active layer
    layers.forEach(function (layer, i) {
      layer.classList.toggle("is-active", i === activeIdx);
    });

    // panel crossfade (synced to the same index)
    panels.forEach(function (panel, i) {
      panel.classList.toggle("is-active", i === activeIdx);
    });

    // right-side gallery photo — matches the active section, not a random rotation
    galleryImgs.forEach(function (img, i) {
      img.classList.toggle("is-active", i === activeIdx);
    });
    if (galleryLabel && GALLERY_LABELS[activeIdx]) galleryLabel.textContent = GALLERY_LABELS[activeIdx];

    // progress dots + scroll cue (hidden right at the very start/end of the scrub)
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === activeIdx);
    });
    if (scrubCue) scrubCue.classList.toggle("is-hidden", p < 0.02 || p > 0.97);
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  document.addEventListener("DOMContentLoaded", update);
  update();

  /**
   * Tech modal — short, original explanations (not copied from any vendor
   * site) for each badge in the "Tecnologias & Plataformas" strip.
   */
  var TECH_INFO = {
    "windows-server": {
      title: "Windows Server",
      desc: "Sistema operacional da Microsoft feito para rodar servidores: gerencia usuários, arquivos, aplicações e a rede de uma empresa. É a base para Active Directory, compartilhamento de arquivos e boa parte dos sistemas corporativos do mercado."
    },
    "linux": {
      title: "Linux",
      desc: "Sistema operacional de código aberto, leve e muito estável — usado como base da maioria dos servidores do mundo. Tem várias \"distribuições\" (Ubuntu, Debian, CentOS...), cada uma otimizada para um tipo de uso, da hospedagem de sites a bancos de dados."
    },
    "vmware": {
      title: "VMware",
      desc: "Plataforma de virtualização: permite rodar vários servidores \"virtuais\" dentro de um único servidor físico. Isso otimiza o hardware, facilita backup e recuperação, e reduz custo de infraestrutura."
    },
    "proxmox": {
      title: "Proxmox",
      desc: "Alternativa de código aberto ao VMware para virtualização de servidores, com gerenciamento direto pelo navegador. Ótimo custo-benefício para empresas pequenas e médias que precisam de virtualização robusta sem licenciamento caro."
    },
    "m365": {
      title: "Microsoft 365",
      desc: "Pacote de produtividade em nuvem da Microsoft: e-mail corporativo (Outlook/Exchange), Teams, Word, Excel, PowerPoint e OneDrive, tudo integrado e acessível de qualquer lugar."
    },
    "aws": {
      title: "AWS (Amazon Web Services)",
      desc: "Plataforma de nuvem da Amazon: servidores virtuais, bancos de dados, armazenamento e dezenas de outros serviços sob demanda, pagando só pelo que se usa."
    },
    "azure": {
      title: "Microsoft Azure",
      desc: "Plataforma de nuvem da Microsoft, equivalente à AWS. Muito usada por empresas que já operam com Windows Server e Microsoft 365, pela integração nativa entre os serviços."
    },
    "gcp": {
      title: "Google Cloud",
      desc: "Plataforma de nuvem do Google, com forte oferta em armazenamento, análise de dados e machine learning, além da hospedagem tradicional de aplicações e sites."
    },
    "veeam": {
      title: "Veeam Backup",
      desc: "Software especializado em backup e recuperação de dados de servidores físicos e virtuais. Garante que, se algo der errado, a empresa recupera as informações rapidamente, sem depender de sorte."
    },
    "zimbra": {
      title: "Zimbra",
      desc: "Plataforma de e-mail corporativo, agenda e colaboração, com opção de hospedagem própria. A DRLSYS opera e protege ambientes Zimbra, incluindo backup e segurança de e-mail dedicados através do nosso serviço Synergy Mail Guardian."
    },
    "pfsense": {
      title: "pfSense",
      desc: "Sistema de firewall e roteador de código aberto, usado para proteger e controlar o tráfego de rede da empresa — com VPN, filtro de conteúdo e regras de segurança configuráveis."
    },
    "ubiquiti": {
      title: "Ubiquiti",
      desc: "Marca de equipamentos de rede — roteadores, switches e access points Wi-Fi — conhecida pelo bom custo-benefício e por permitir gerenciamento centralizado de toda a rede por um único painel."
    },
    "ad": {
      title: "Active Directory",
      desc: "Serviço da Microsoft que centraliza o controle de usuários, senhas e permissões de acesso em toda a rede da empresa: quem pode acessar o quê, de onde, e com qual nível de permissão."
    }
  };

  var techModal = document.getElementById("techModal");
  var techModalTitle = document.getElementById("techModalTitle");
  var techModalDesc = document.getElementById("techModalDesc");
  var techModalClose = document.getElementById("techModalClose");
  var techModalBackdrop = document.getElementById("techModalBackdrop");
  var techButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tech]"));

  function openTechModal(key) {
    var info = TECH_INFO[key];
    if (!info || !techModal) return;
    techModalTitle.textContent = info.title;
    techModalDesc.textContent = info.desc;
    techModal.classList.add("is-open");
    techModal.setAttribute("aria-hidden", "false");
  }

  function closeTechModal() {
    if (!techModal) return;
    techModal.classList.remove("is-open");
    techModal.setAttribute("aria-hidden", "true");
  }

  techButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { openTechModal(btn.getAttribute("data-tech")); });
  });
  if (techModalClose) techModalClose.addEventListener("click", closeTechModal);
  if (techModalBackdrop) techModalBackdrop.addEventListener("click", closeTechModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeTechModal();
  });

  /**
   * Counting-up stat animation — plays once when a [data-count-to] element
   * scrolls into view, easing from 0 to its target number. Suffix (e.g. " min",
   * "%") is preserved via data-count-suffix so the element still reads correctly
   * before JS runs / with JS disabled.
   */
  var countEls = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
  if (countEls.length && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countObserver.unobserve(el);
        var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
        var suffix = el.getAttribute("data-count-suffix") || "";
        var duration = 1200;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var t = clamp((ts - start) / duration, 0, 1);
          var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    countEls.forEach(function (el) { countObserver.observe(el); });
  }
})();
