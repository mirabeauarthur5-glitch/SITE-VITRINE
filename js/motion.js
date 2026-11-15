/* CALVIN HOME — Motion design (GSAP + ScrollTrigger)
   Amélioration progressive : sans GSAP, avec « réduire les animations » activé, ou en cas d'erreur,
   le site reste entièrement visible et utilisable grâce à css/style.css + js/common.js.
   - N'anime que transform / opacity / clip-path (pas de layout).
   - Toutes les instances GSAP sont créées dans gsap.matchMedia() : elles sont nettoyées automatiquement
     si l'utilisateur active « réduire les animations » ou change de taille d'écran.
   - Aucune animation permanente (tout se joue une seule fois, à l'entrée dans l'écran). */
(function () {
  'use strict';
  var g = window.gsap, ST = window.ScrollTrigger;
  if (!g || !ST) return;                 // GSAP absent : le site fonctionne sans
  g.registerPlugin(ST);
  g.defaults({ ease: 'power3.out' });
  ST.config({ ignoreMobileResize: true }); // évite les recalculs quand la barre d'adresse Android se rétracte

  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CLEAR = 'opacity,visibility,transform';
  var undo = [];                         // restaure le DOM (mots découpés, classes .reveal) au nettoyage
  var observers = [];

  /* ---------- utilitaires ---------- */
  // Découpe un titre en mots (masque + glissement) en conservant <em>. Le titre garde son texte lisible.
  function splitWords(el) {
    var saved = el.innerHTML, label = el.textContent.replace(/\s+/g, ' ').trim(), out = [];
    function walkNodes(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'), i = document.createElement('span');
            o.className = 'mw'; o.setAttribute('aria-hidden', 'true');
            i.className = 'mw-i'; i.textContent = t; o.appendChild(i); frag.appendChild(o); out.push(i);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walkNodes(n);
      });
    }
    walkNodes(el);
    el.setAttribute('aria-label', label);
    undo.push(function () { el.innerHTML = saved; el.removeAttribute('aria-label'); });
    return out;
  }
  // Les boutons ont une transition CSS sur transform : on la coupe pendant l'animation GSAP.
  function noTrans(els) {
    els.forEach(function (e) { e.classList.add('mo-anim'); });
    return function () { els.forEach(function (e) { e.classList.remove('mo-anim'); }); };
  }
  function enter(el, fn, start) { ST.create({ trigger: el, start: start || 'top 88%', once: true, onEnter: fn }); }
  function release(el) {            // l'élément reste visible si on retire .reveal
    var cls = el.className;
    el.classList.remove('reveal', 'd1', 'd2');
    undo.push(function () { el.className = cls; el.classList.add('in'); });
  }

  /* ---------- Accueil : hero ---------- */
  function heroIntro() {
    var hero = $('#accueil'); if (!hero) return;
    var h1 = $('h1', hero), words = splitWords(h1), btns = $$('.cta .btn', hero), restore = noTrans(btns);
    var tl = g.timeline({ delay: 0.1, onComplete: restore });
    tl.from('.slides', { scale: 1.16, duration: 2.6, ease: 'power2.out', clearProps: 'transform' }, 0)
      .from('.hero .shade', { opacity: 0, duration: 1.4, clearProps: 'opacity' }, 0)
      .from('.hero .eyebrow', { autoAlpha: 0, y: 16, duration: 0.9, clearProps: CLEAR }, 0.3)
      .from(words, { yPercent: 115, duration: 1.2, stagger: 0.09, ease: 'power4.out', clearProps: 'transform' }, 0.45)
      .from('.hero .sub', { autoAlpha: 0, y: 22, duration: 1, clearProps: CLEAR }, 1.0)
      .from(btns, { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.14, clearProps: CLEAR }, 1.25)
      .from('.hero-ctl', { autoAlpha: 0, y: 14, duration: 0.8, clearProps: CLEAR }, 1.6);
  }

  /* ---------- Révélations au défilement ---------- */
  function scrollReveals() {
    var all = $$('.reveal'), grids = [], vids = [], plain = [];
    all.forEach(function (el) {
      var d = el.classList.contains('d2') ? 0.2 : el.classList.contains('d1') ? 0.1 : 0;
      el._d = d;
      if (el.classList.contains('tz-grid') || el.classList.contains('nv-grid')) grids.push(el);
      else if (el.classList.contains('vid')) vids.push(el);
      else if (el.classList.contains('svc')) { /* traité à part */ }
      else plain.push(el);
    });
    all.forEach(release);

    // Blocs simples : titres, textes, formulaires, avis
    plain.forEach(function (el) {
      g.set(el, { autoAlpha: 0, y: 34 });
      enter(el, function () { g.to(el, { autoAlpha: 1, y: 0, duration: 1.1, delay: el._d, clearProps: CLEAR }); });
    });

    // Grilles de vignettes : apparition séquencée
    grids.forEach(function (grid) {
      var kids = $$(':scope > a', grid);
      g.set(kids, { autoAlpha: 0, y: 42 });
      enter(grid, function () { g.to(kids, { autoAlpha: 1, y: 0, duration: 0.95, stagger: 0.09, clearProps: CLEAR }); }, 'top 85%');
    });

    // Vidéo du showroom : révélation par masque
    vids.forEach(function (vid) {
      g.set(vid, { clipPath: 'inset(0% 0% 100% 0%)' });
      enter(vid, function () { g.to(vid, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power3.inOut', clearProps: 'clipPath' }); }, 'top 85%');
    });

    // Cinq expertises : texte séquencé, photo révélée par masque + zoom subtil au défilement
    $$('.svc').forEach(function (svc) {
      var parts = $$('.num, .si, h3, p, .tags, .acts', svc), photo = $('.photo', svc), img = photo && $('img', photo);
      g.set(parts, { autoAlpha: 0, y: 26 });
      if (photo) g.set(photo, { clipPath: 'inset(0% 0% 100% 0%)' });
      enter(svc, function () {
        var tl = g.timeline();
        if (photo) tl.to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath' }, 0);
        tl.to(parts, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, clearProps: CLEAR }, 0.1);
      }, 'top 82%');
      if (img) g.fromTo(img, { scale: 1.16 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });

    // Bandeau de chiffres : apparition + compteurs
    var strip = $('.strip');
    if (strip) {
      var its = $$('.it', strip);
      g.set(its, { autoAlpha: 0, y: 24 });
      enter(strip, function () { g.to(its, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, clearProps: CLEAR }); }, 'top 92%');
      ['#nPhotos', '#nVideos'].forEach(function (sel) {
        var el = $(sel); if (!el) return;
        var end = parseInt(el.textContent, 10); if (!end) return;
        var o = { v: 0 };
        enter(strip, function () {
          g.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); }, onComplete: function () { el.textContent = end; } });
        }, 'top 92%');
      });
    }

    // Atelier + pied de page
    var ct = $('.craft-txt');
    if (ct) { g.set(ct, { autoAlpha: 0, y: 30 }); enter(ct, function () { g.to(ct, { autoAlpha: 1, y: 0, duration: 1.2, clearProps: CLEAR }); }, 'top 90%'); }
    var cols = $$('.footer .top > div');
    if (cols.length) { g.set(cols, { autoAlpha: 0, y: 24 }); enter($('.footer'), function () { g.to(cols, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, clearProps: CLEAR }); }, 'top 92%'); }

    // Showroom : mise en valeur ponctuelle (2 impulsions, une seule fois) du bouton de visite
    var visit = $('.showroom .cta .btn-wa');
    if (visit) enter(visit, function () { visit.classList.add('hl'); }, 'top 92%');

    // Formulaires : champs révélés l'un après l'autre
    ['#rvForm', '#qForm'].forEach(function (sel) {
      var f = $(sel); if (!f) return;
      var parts = $$('.field, .btn, .hint', f), btns = $$('.btn', f), restore = noTrans(btns);
      g.set(parts, { autoAlpha: 0, y: 18 });
      enter(f, function () { g.to(parts, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07, delay: 0.2, clearProps: CLEAR, onComplete: restore }); }, 'top 85%');
    });
  }

  /* ---------- Avis : les cartes ajoutées dynamiquement apparaissent en douceur ---------- */
  function reviewCards() {
    var list = $('#rvList'); if (!list || !window.MutationObserver) return;
    var mo = new MutationObserver(function () {
      var cards = $$('.rv-card', list); if (!cards.length) return;
      g.from(cards, { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.1, clearProps: CLEAR });
    });
    mo.observe(list, { childList: true }); observers.push(mo);
  }

  /* ---------- Catalogue ---------- */
  function catalogue() {
    var hero = $('.cat-hero'); if (!hero) return;
    var h1 = $('h1', hero), words = splitWords(h1);
    g.timeline({ delay: 0.05 })
      .from('.cat-hero .eyebrow', { autoAlpha: 0, y: 14, duration: 0.8, clearProps: CLEAR }, 0)
      .from(words, { yPercent: 115, duration: 1.1, stagger: 0.09, ease: 'power4.out', clearProps: 'transform' }, 0.15)
      .from('.cat-hero p', { autoAlpha: 0, y: 18, duration: 0.9, clearProps: CLEAR }, 0.7)
      .from('.toolbar', { autoAlpha: 0, y: 16, duration: 0.8, clearProps: CLEAR }, 0.95);

    // Cartes : apparition à chaque (ré)affichage de la grille (filtres, recherche, pagination)
    var masonry = $('#masonry'), triggers = [];
    if (masonry && window.MutationObserver) {
      var build = function () {
        triggers.forEach(function (t) { t.kill(); }); triggers = [];
        var cards = $$('.card', masonry); if (!cards.length) return;
        g.set(cards, { autoAlpha: 0, y: 28 });
        triggers = ST.batch(cards, {
          start: 'top 95%', once: true,
          onEnter: function (b) { g.to(b, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, overwrite: true, clearProps: CLEAR }); }
        });
      };
      var mo = new MutationObserver(build);
      mo.observe(masonry, { childList: true }); observers.push(mo);
      build();
      var t; masonry.addEventListener('load', function () { clearTimeout(t); t = setTimeout(function () { ST.refresh(); }, 120); }, true);
    }

    // Visionneuse : ouverture en fondu
    var lb = $('#lb');
    if (lb && window.MutationObserver) {
      var was = false;
      var mo2 = new MutationObserver(function () {
        var now = lb.classList.contains('open');
        if (now && !was) {
          g.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.35, clearProps: 'opacity' });
          g.fromTo('#lbStage', { scale: 0.97 }, { scale: 1, duration: 0.5, clearProps: 'transform' });
        }
        was = now;
      });
      mo2.observe(lb, { attributes: true, attributeFilter: ['class'] }); observers.push(mo2);
    }
  }

  /* ---------- Parallaxe légère (écrans larges uniquement) ---------- */
  function parallax() {
    var hero = $('#accueil');
    if (hero) {
      var sc = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      g.to('.slides', { yPercent: 12, ease: 'none', scrollTrigger: sc });
      g.to('.hero-in', { yPercent: -6, ease: 'none', scrollTrigger: sc });
    }
    var col = $('.collage');
    if (col) {
      var cs = { trigger: col, start: 'top bottom', end: 'bottom top', scrub: 0.8 };
      g.fromTo('.collage .a', { yPercent: -4 }, { yPercent: 5, ease: 'none', scrollTrigger: cs });
      g.fromTo('.collage .b', { yPercent: 6 }, { yPercent: -5, ease: 'none', scrollTrigger: cs });
    }
  }

  /* ---------- Transition entre pages : rideau court, navigation native conservée ---------- */
  function pageTransitions() {
    var cv = document.createElement('div');
    cv.className = 'ptr'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var busy = false;
    function same(u) {
      var norm = function (p) { return p.replace(/index\.html$/, ''); };
      return norm(u.pathname) === norm(location.pathname) && u.search === location.search;
    }
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || same(u) || busy) return; // ancres, liens externes, WhatsApp, tel: → natif
      busy = true; e.preventDefault();
      var go = function () { location.href = u.href; };
      var failsafe = setTimeout(go, 900);            // la navigation ne dépend jamais de l'animation
      g.to(cv, { yPercent: 0, duration: 0.45, ease: 'power3.inOut', onComplete: function () { clearTimeout(failsafe); go(); } });
    }
    function onShow(ev) { if (ev.persisted) { busy = false; g.set(cv, { yPercent: -100 }); } } // retour arrière (cache navigateur)
    document.addEventListener('click', onClick);
    window.addEventListener('pageshow', onShow);
    return function () { document.removeEventListener('click', onClick); window.removeEventListener('pageshow', onShow); cv.remove(); };
  }

  /* ---------- Interactions de validation (appelées par home.js) ---------- */
  window.CH_motion = {
    invalid: function (field) {
      if (!root.classList.contains('mo') || !field) return;
      g.fromTo(field, { x: 0 }, { keyframes: { x: [-8, 8, -5, 5, 0] }, duration: 0.42, ease: 'power2.out', clearProps: 'transform' });
    }
  };

  /* ---------- Mise en route (nettoyage automatique via matchMedia) ---------- */
  var mm = g.matchMedia();
  function cleanDom() { observers.forEach(function (o) { o.disconnect(); }); observers = []; undo.splice(0).reverse().forEach(function (f) { try { f(); } catch (e) {} }); }

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    root.classList.add('mo');
    var offPages = function () {};
    try {
      heroIntro(); scrollReveals(); reviewCards(); catalogue(); offPages = pageTransitions();
    } catch (err) {                                  // en cas de problème : on rend tout visible
      if (window.console) console.warn('CALVIN HOME motion désactivé :', err);
      g.delayedCall(0, function () { mm.revert(); });
    }
    return function () { offPages(); cleanDom(); root.classList.remove('mo'); };
  });

  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 961px)', function () { parallax(); });

  window.addEventListener('load', function () { ST.refresh(); });
})();
