/* CALVIN HOME — page d'accueil : hero, avis, devis */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var DATA = window.CH_CATALOGUE || [];

  /* ---------- Animation de l'atelier : respecte « réduire les animations » ---------- */
  (function () {
    var svg = document.getElementById('craftSvg'); if (!svg) return;
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function apply() { try { if (mq.matches) { svg.pauseAnimations(); svg.classList.add('still'); } else { svg.unpauseAnimations(); svg.classList.remove('still'); } } catch (e) {} }
    apply(); if (mq.addEventListener) mq.addEventListener('change', apply);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (mq.matches) return; try { x.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations(); } catch (e) {} });
    }).observe(svg);
  })();

  /* ---------- Compteurs ---------- */
  var np = DATA.filter(function (i) { return i.type === 'photo'; }).length;
  var nv = DATA.length - np;
  if (np) $('#nPhotos').textContent = np;
  if (nv) $('#nVideos').textContent = nv;

  /* ---------- Hero : diaporama photos + vidéos réelles ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var portrait = window.matchMedia('(max-width:720px), (orientation:portrait)').matches;
  var IMG = function (n) { return { t: 'p', src: 'assets/img/IMG-20261112-WA' + n + '.webp' }; };
  var VID = function (n) { return { t: 'v', src: 'assets/video/VID-20261112-WA' + n + '.mp4', poster: 'assets/posters/VID-20261112-WA' + n + '.webp' }; };
  var LIST = portrait
    ? [IMG('0031'), VID('0044'), IMG('0035'), VID('0096'), IMG('0036'), VID('0092'), IMG('0063'), VID('0104')]
    : [IMG('0045'), VID('0106'), IMG('0036'), VID('0081'), IMG('0043'), VID('0073'), IMG('0063')];
  if (reduce) LIST = LIST.filter(function (s) { return s.t === 'p'; });

  var box = $('#slides'), bars = $('#bars'), hero = $('#accueil'), ppBtn = $('#pp'), count = $('#count');
  var els = [], cur = -1, timer = null, paused = reduce, startAt = 0, remain = 0;

  function dur(s) {
    if (s.t === 'p') return 7;
    var d = 8;
    DATA.forEach(function (i) { if (i.file === s.src) d = i.dur; });
    return Math.min(Math.max(d, 5), 10);
  }
  function build() {
    box.innerHTML = ''; bars.innerHTML = '';
    LIST.forEach(function (s, k) {
      var d = document.createElement('div'); d.className = 'slide';
      if (s.t === 'p') {
        var im = new Image(); im.alt = ''; im.decoding = 'async';
        if (k === 0) im.fetchPriority = 'high'; else im.loading = 'lazy';
        im.src = s.src; d.appendChild(im);
      } else {
        var v = document.createElement('video');
        v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
        v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.preload = 'none'; v.poster = s.poster;
        v.dataset.src = s.src;
        v.addEventListener('error', function () { if (cur === k) { s.bad = true; clearTimeout(timer); timer = setTimeout(next, 400); } });
        d.appendChild(v);
      }
      box.appendChild(d); els.push(d);
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Aller au visuel ' + (k + 1)); b.innerHTML = '<i></i>';
      b.addEventListener('click', function () { show(k); });
      bars.appendChild(b);
    });
  }
  function prep(k) {
    var s = LIST[k]; if (!s || s.t !== 'v') return;
    var v = els[k].querySelector('video');
    if (!v.getAttribute('src')) { v.src = v.dataset.src; v.preload = 'auto'; v.load(); }
  }
  function schedule(ms) { clearTimeout(timer); startAt = Date.now(); remain = ms; if (!paused) timer = setTimeout(next, ms); }
  function show(k) {
    if (k === cur || !els.length) return;
    var prev = cur; cur = k;
    els.forEach(function (e, j) { e.classList.toggle('on', j === k); });
    if (prev > -1) { var pv = els[prev].querySelector('video'); if (pv) setTimeout(function () { if (cur !== prev) pv.pause(); }, 1500); }
    var s = LIST[k];
    if (s.t === 'v') {
      prep(k); var v = els[k].querySelector('video');
      try { v.currentTime = 0; } catch (e) {}
      if (!paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    } else {
      // relance le léger zoom
      var im = els[k].querySelector('img'); if (im) { im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; }
    }
    prep((k + 1) % LIST.length);
    var d = dur(s);
    Array.prototype.forEach.call(bars.children, function (b, j) {
      b.classList.remove('on'); b.removeAttribute('aria-current');
      if (j === k) { b.style.setProperty('--dur', d + 's'); void b.offsetWidth; b.classList.add('on'); b.setAttribute('aria-current', 'true'); }
    });
    count.textContent = ('0' + (k + 1)).slice(-2) + ' / ' + ('0' + LIST.length).slice(-2);
    schedule(d * 1000);
  }
  function next() {
    var k = cur, n = LIST.length;
    for (var t = 1; t <= n; t++) { var c = (k + t) % n; if (!LIST[c].bad) { show(c); return; } }
  }
  function setPaused(p) {
    paused = p; hero.classList.toggle('paused', p);
    ppBtn.innerHTML = icon(p ? 'play' : 'pause');
    ppBtn.setAttribute('aria-label', p ? 'Reprendre le diaporama' : 'Mettre le diaporama en pause');
    var v = cur > -1 && els[cur].querySelector('video');
    if (p) { clearTimeout(timer); remain = Math.max(500, remain - (Date.now() - startAt)); if (v) v.pause(); }
    else { startAt = Date.now(); timer = setTimeout(next, remain); if (v) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } }
  }
  if (box) {
    build(); show(0);
    if (reduce) setPaused(true);
    ppBtn.addEventListener('click', function () { setPaused(!paused); });
    // économie d'énergie : pause quand l'onglet est caché ou le hero hors écran
    var vis = true, tab = true;
    function sync() { var want = !(vis && tab); if (want !== paused && !reduce && !userPaused) setPaused(want); }
    var userPaused = false;
    ppBtn.addEventListener('click', function () { userPaused = paused; });
    document.addEventListener('visibilitychange', function () { tab = !document.hidden; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(hero);
  }

  /* ---------- Avis clients ---------- */
  var REV = (window.CH_REVIEWS || []).slice();
  var RV = window.CH_Reviews || { enabled: false };
  function starsHtml(n) { var s = ''; for (var i = 1; i <= 5; i++) s += icon(i <= n ? 'starfill' : 'star'); return s; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var list = $('#rvList'), empty = $('#rvEmpty');
  function renderReviews() {
    if (REV.length) {
      empty.style.display = 'none'; list.style.display = '';
      list.innerHTML = REV.map(function (r) {
        return '<div class="rv-card"><span class="stars" role="img" aria-label="' + r.rating + ' sur 5">' + starsHtml(r.rating) + '</span><q>' + esc(r.text) + '</q><cite>' + esc(r.name) + '</cite></div>';
      }).join('');
    } else { list.style.display = 'none'; empty.style.display = ''; }
  }
  renderReviews();
  if (RV.enabled) {
    RV.fetchApproved().then(function (rows) { REV = REV.concat(rows); renderReviews(); }).catch(function () {});
  }
  $('#emptyStars').innerHTML = starsHtml(0);
  // Texte du formulaire selon le mode réel (base Supabase ou repli WhatsApp)
  var rvHint = $('#rvHint'), rvStep = $('#rvStep2');
  if (RV.enabled) {
    rvHint.textContent = 'Votre avis est enregistré en attente de validation : il n’apparaîtra sur le site qu’après vérification par CALVIN HOME.';
    rvStep.textContent = 'Votre avis est enregistré en toute sécurité, en attente de validation.';
  } else {
    rvHint.textContent = 'Votre avis s’ouvre dans WhatsApp, prêt à être envoyé à CALVIN HOME. Il ne sera publié qu’après validation.';
    rvStep.textContent = 'Votre avis est transmis à CALVIN HOME par WhatsApp.';
  }

  var rate = $('#rate'), rh = '';
  for (var n = 5; n >= 1; n--) {
    rh += '<input type="radio" name="rate" id="r' + n + '" value="' + n + '"><label for="r' + n + '" title="' + n + ' sur 5"><span class="sr">' + n + ' étoile' + (n > 1 ? 's' : '') + '</span>' + icon('star') + '</label>';
  }
  rate.innerHTML = rh;

  function fieldBad(el, bad) { var f = el.closest('.field'); if (f) f.classList.toggle('bad', bad); return bad; }
  function open(url, fb, label) {
    try { window.open(url, '_blank', 'noopener'); } catch (e) {}
    fb.innerHTML = label + ' <a href="' + url + '" target="_blank" rel="noopener">Ouvrir WhatsApp</a> si rien ne s’est ouvert.';
    fb.classList.remove('err-msg'); fb.classList.add('show');
  }
  function say(fb, text, isErr) { fb.textContent = text; fb.classList.toggle('err-msg', !!isErr); fb.classList.add('show'); }

  $('#rvForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = this, name = $('#rvName'), txt = $('#rvText'), chk = document.querySelector('input[name="rate"]:checked'), fb = $('#rvFb');
    if ($('#rvWeb').value) return; // champ piège anti-robots
    var bad = false;
    bad = fieldBad(name, !name.value.trim() || name.value.trim().length > 60) || bad;
    bad = fieldBad(txt, !txt.value.trim() || txt.value.trim().length > 800) || bad;
    var rf = $('#rateField'); rf.classList.toggle('bad', !chk); bad = !chk || bad;
    if (bad) { var first = form.querySelector('.bad input, .bad textarea, .bad fieldset input'); if (first) first.focus(); return; }
    var r = +chk.value, data = { name: name.value.trim(), rating: r, text: txt.value.trim() };
    if (RV.enabled) {
      var btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
      say(fb, 'Envoi en cours…', false);
      RV.submit(data).then(function () {
        say(fb, 'Merci ! Votre avis a bien été enregistré. Il sera publié après validation par CALVIN HOME.', false);
        form.reset();
      }).catch(function () {
        say(fb, 'L’envoi a échoué. Vérifiez votre connexion et réessayez, ou écrivez-nous sur WhatsApp.', true);
      }).then(function () { btn.disabled = false; });
      return;
    }
    var stars = new Array(r + 1).join('★') + new Array(6 - r).join('☆');
    var msg = 'NOUVEL AVIS CLIENT (à valider avant publication)\n\nNom : ' + data.name + '\nNote : ' + stars + ' (' + r + '/5)\nCommentaire : ' + data.text + '\n\nEnvoyé depuis le site CALVIN HOME.';
    open(waLink(msg), fb, 'Merci ! Votre avis est transmis à CALVIN HOME pour validation avant publication.');
  });

  /* ---------- Devis / contact ---------- */
  $('#qForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#qWeb') && $('#qWeb').value) return; // champ piège anti-robots
    var f = { nom: $('#qName'), tel: $('#qTel'), svc: $('#qSvc'), obj: $('#qObj'), desc: $('#qDesc') };
    var digits = f.tel.value.replace(/\D/g, '');
    var bad = false;
    bad = fieldBad(f.nom, f.nom.value.trim().length < 3) || bad;
    bad = fieldBad(f.tel, digits.length < 8) || bad;
    bad = fieldBad(f.svc, !f.svc.value) || bad;
    bad = fieldBad(f.obj, !f.obj.value) || bad;
    bad = fieldBad(f.desc, f.desc.value.trim().length < 5) || bad;
    if (bad) { var first = this.querySelector('.bad input, .bad select, .bad textarea'); if (first) first.focus(); return; }
    var msg = 'Bonjour CALVIN HOME,\n\nNOUVELLE DEMANDE : ' + f.obj.value + '\n\nNom et prénom : ' + f.nom.value.trim() +
      '\nTéléphone : ' + f.tel.value.trim() + '\nService concerné : ' + f.svc.value + '\nObjet : ' + f.obj.value +
      '\n\nDescription du projet :\n' + f.desc.value.trim() + '\n\nMessage envoyé depuis le site web.';
    open(waLink(msg), $('#qFb'), 'Votre demande est prête : WhatsApp s’ouvre pour l’envoyer à CALVIN HOME.');
    if (window.CH_Reviews && window.CH_Reviews.submitQuote) window.CH_Reviews.submitQuote({ name: f.nom.value.trim(), phone: f.tel.value.trim(), service: f.svc.value, subject: f.obj.value, description: f.desc.value.trim() });
  });
})();
