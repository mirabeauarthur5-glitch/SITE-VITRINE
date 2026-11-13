/* CALVIN HOME — fonctions communes : icônes, WhatsApp, menu, animations */
(function () {
  'use strict';
  var CFG = window.CH_CONFIG = {
    brand: 'CALVIN HOME',
    // Numéro officiel tel que fourni dans les documents du projet (fiches produit + LISEZ-MOI)
    phoneDisplay: '+242 06 452 27 22',
    phoneIntl: '242064522722',
    place: 'Showroom KM4 · Pointe-Noire · République du Congo'
  };

  var ICONS = {
    aluminium: '<rect x="3" y="3" width="18" height="18"/><rect x="5.5" y="5.5" width="13" height="13"/><path d="M12 5.5v13M5.5 12h13"/>',
    bois: '<rect x="4" y="3" width="16" height="16"/><path d="M4 9h16M4 14h16M10.5 6h3M10.5 11.5h3M10.5 16.5h3M6.5 19v2M17.5 19v2"/>',
    garnissage: '<path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/><path d="M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M5.5 19v2M18.5 19v2"/>',
    decoration: '<path d="M8 3h8l3 9H5z"/><path d="M12 12v7M8.5 21h7"/>',
    construction: '<path d="M4 16a8 8 0 0 1 16 0"/><path d="M2.5 16h19v2.5h-19z"/><path d="M10 8.3V16M14 8.3V16"/>',
    general: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
    photo: '<rect x="3" y="4" width="18" height="16"/><circle cx="9" cy="10" r="1.6"/><path d="M3 17l5-4 4 3 3-2 6 4"/>',
    film: '<rect x="3" y="4" width="18" height="16"/><path d="M10 9.5v5l4.5-2.5z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    star: '<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'
  };
  var FILLED = { play: '<path d="M7 4.5v15l13-7.5z"/>', starfill: '<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    whatsapp: '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.17-3.48-8.41z"/>' };

  window.icon = function (name, cls) {
    var f = FILLED[name];
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
      (f ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"') +
      '>' + (f || ICONS[name] || '') + '</svg>';
  };
  // Remplace les <i data-ic="nom"> par des SVG en ligne
  window.hydrateIcons = function (root) {
    (root || document).querySelectorAll('i[data-ic]').forEach(function (el) {
      var t = document.createElement('span');
      t.innerHTML = window.icon(el.getAttribute('data-ic'), el.className);
      el.replaceWith(t.firstChild);
    });
  };

  window.waLink = function (msg) {
    return 'https://wa.me/' + CFG.phoneIntl + '?text=' + encodeURIComponent(msg);
  };
  // Messages prédéfinis
  window.WA_MSG = {
    general: 'Bonjour CALVIN HOME, je visite votre site et je souhaite des renseignements.',
    devis: 'Bonjour CALVIN HOME, je souhaite recevoir un devis pour un projet. Pouvez-vous me contacter ?',
    visite: 'Bonjour CALVIN HOME, je souhaite visiter votre showroom KM4 à Pointe-Noire. Quels sont vos jours et horaires d’ouverture, et l’adresse exacte ?',
    service: function (s) { return 'Bonjour CALVIN HOME, je souhaite des renseignements sur votre service « ' + s + ' ».'; },
    produit: function (t, ref) { return 'Bonjour CALVIN HOME, je suis intéressé(e) par cet article de votre catalogue : « ' + t + ' » (réf. ' + ref + '). Pouvez-vous me donner le prix, les dimensions et les délais ?'; }
  };
  // Tous les liens [data-wa="general|devis|visite"] et [data-wa-service="Nom"]
  function wireWhatsApp() {
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      var k = a.getAttribute('data-wa');
      a.href = waLink(WA_MSG[k] || WA_MSG.general);
      a.target = '_blank'; a.rel = 'noopener';
    });
    document.querySelectorAll('[data-wa-service]').forEach(function (a) {
      a.href = waLink(WA_MSG.service(a.getAttribute('data-wa-service')));
      a.target = '_blank'; a.rel = 'noopener';
    });
    document.querySelectorAll('[data-phone]').forEach(function (a) {
      a.textContent = CFG.phoneDisplay; a.href = 'tel:+' + CFG.phoneIntl;
    });
  }

  function menu() {
    var btn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
    if (!btn || !nav) return;
    function set(open) {
      nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.documentElement.classList.toggle('lock', open);
    }
    btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) set(false); });
  }

  function header() {
    var h = document.querySelector('.site-header'); if (!h) return;
    function f() { h.classList.toggle('scrolled', window.scrollY > 24); }
    f(); window.addEventListener('scroll', f, { passive: true });
  }

  function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (e) { e.classList.add('in'); }); return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    hydrateIcons(); wireWhatsApp(); menu(); header(); reveal();
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  });
})();
