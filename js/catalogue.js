/* CALVIN HOME — catalogue : filtres, pagination réelle, visionneuse photo/vidéo */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var DATA = (window.CH_CATALOGUE || []).filter(function (i) { return !i.hidden; });
  var PER = 12;
  var CATS = [
    ['all', 'Tous les articles'], ['aluminium', 'Aluminium'], ['bois', 'Bois et meubles'],
    ['garnissage', 'Garnissage'], ['decoration', 'Décoration'], ['construction', 'Construction'], ['general', 'Autres réalisations']
  ];
  var LABEL = {}; CATS.forEach(function (c) { LABEL[c[0]] = c[1]; });
  LABEL.all = 'Catalogue';

  var state = { cat: 'all', type: 'all', page: 1, q: '' };
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  var view = [];            // éléments filtrés (toutes pages)
  var masonry = $('#masonry'), pager = $('#pager');

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mmss(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  /* ----- état <-> URL (#cat=bois&type=video&page=2) : fonctionne aussi en ouvrant le fichier directement ----- */
  function parseHash() {
    var h = (location.hash || '').replace(/^#/, ''), o = {};
    h.split('&').forEach(function (p) { var kv = p.split('='); if (kv[0]) o[kv[0]] = decodeURIComponent(kv[1] || ''); });
    state.cat = (o.cat && LABEL[o.cat]) ? o.cat : 'all';
    state.type = (o.type === 'photo' || o.type === 'video') ? o.type : 'all';
    state.page = Math.max(1, parseInt(o.page, 10) || 1);
    state.q = (o.q || '').slice(0, 60);
    var qi = document.getElementById('q'); if (qi && qi.value !== state.q) qi.value = state.q;
  }
  function setHash(patch, keepPage) {
    var s = { cat: state.cat, type: state.type, page: state.page, q: state.q };
    for (var k in patch) s[k] = patch[k];
    if (!keepPage && !('page' in patch)) s.page = 1;
    var parts = [];
    if (s.cat !== 'all') parts.push('cat=' + s.cat);
    if (s.type !== 'all') parts.push('type=' + s.type);
    if (s.q) parts.push('q=' + encodeURIComponent(s.q));
    if (s.page > 1) parts.push('page=' + s.page);
    var h = parts.length ? '#' + parts.join('&') : '';
    if (h === (location.hash || '')) { render(true); return; }
    location.hash = h || '#';
  }

  /* ----- puces de catégories ----- */
  function counts() {
    var c = { all: DATA.length };
    DATA.forEach(function (i) { c[i.cat] = (c[i.cat] || 0) + 1; });
    return c;
  }
  function renderChips() {
    var c = counts(), h = '';
    CATS.forEach(function (k) {
      if (k[0] === 'general' && !c.general) return;
      h += '<button class="chip" type="button" data-cat="' + k[0] + '" aria-pressed="' + (state.cat === k[0]) + '">' + esc(k[1]) + ' <span class="n">' + (c[k[0]] || 0) + '</span></button>';
    });
    $('#chips').innerHTML = h;
    Array.prototype.forEach.call(document.querySelectorAll('#seg button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === state.type)); });
  }

  /* ----- grille ----- */
  function card(i, n) {
    var isV = i.type === 'video';
    var alt = (isV ? 'Vidéo : ' : '') + i.title;
    return '<button class="card" type="button" data-id="' + i.n + '-' + i.type + '" aria-label="' + esc((isV ? 'Lire la vidéo : ' : 'Agrandir : ') + i.title) + '">' +
      '<span class="im"><img src="' + i.thumb + '" width="' + i.w + '" height="' + i.h + '" alt="' + esc(alt) + '" decoding="async"' + (n < 4 ? '' : ' loading="lazy"') + '>' +
      (i.nouveau ? '<span class="new">Nouveau</span>' : '') + (i.modele ? '<span class="new mod">Modèle</span>' : '') + (isV ? '<span class="playbtn">' + icon('play') + '</span><span class="kind">' + icon('film') + ' ' + mmss(i.dur) + '</span>' : '') +
      '<span class="meta"><b>' + esc(i.title) + '</b><span>' + esc(LABEL[i.cat]) + '</span></span></span>' +
      '<span class="cap-m"><b>' + esc(i.title) + '</b><span>' + esc(LABEL[i.cat]) + '</span></span></button>';
  }
  function pageList(cur, tot) {
    var out = [], add = function (p) { out.push(p); };
    for (var p = 1; p <= tot; p++) { if (p === 1 || p === tot || Math.abs(p - cur) <= 1) add(p); else if (out[out.length - 1] !== '…') add('…'); }
    return out;
  }
  function renderPager(tot) {
    if (tot <= 1) { pager.innerHTML = ''; return; }
    var h = '<button type="button" data-p="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + ' aria-label="Page précédente">' + icon('left') + '<span class="pn">Précédent</span></button>';
    pageList(state.page, tot).forEach(function (p) {
      h += p === '…' ? '<span class="dots">…</span>' :
        '<button type="button" data-p="' + p + '"' + (p === state.page ? ' aria-current="page"' : '') + ' aria-label="Page ' + p + '">' + p + '</button>';
    });
    h += '<button type="button" data-p="' + (state.page + 1) + '"' + (state.page === tot ? ' disabled' : '') + ' aria-label="Page suivante"><span class="pn">Suivant</span>' + icon('right') + '</button>';
    pager.innerHTML = h;
  }
  function render(noScroll) {
    var nq = norm(state.q).split(/\s+/).filter(Boolean);
    view = DATA.filter(function (i) {
      if (!((state.cat === 'all' || i.cat === state.cat) && (state.type === 'all' || i.type === state.type))) return false;
      if (!nq.length) return true;
      var hay = norm(i.title + ' ' + LABEL[i.cat] + ' ' + i.ref + ' ' + (i.type === 'video' ? 'video' : 'photo') + (i.modele ? ' modele' : ''));
      return nq.every(function (w) { return hay.indexOf(w) > -1; });
    });
    var tot = Math.max(1, Math.ceil(view.length / PER));
    if (state.page > tot) state.page = tot;
    var slice = view.slice((state.page - 1) * PER, state.page * PER);
    masonry.innerHTML = slice.map(card).join('');
    $('#empty').classList.toggle('show', view.length === 0);
    masonry.style.display = view.length ? '' : 'none';
    var np = view.filter(function (i) { return i.type === 'photo'; }).length;
    $('#resTxt').innerHTML = '<b>' + view.length + '</b> article' + (view.length > 1 ? 's' : '') + ' · ' + np + ' photo' + (np > 1 ? 's' : '') + ' · ' + (view.length - np) + ' vidéo' + (view.length - np > 1 ? 's' : '');
    $('#pgTxt').textContent = 'Page ' + state.page + ' sur ' + tot;
    $('#pageInfo').textContent = view.length ? 'Affichage de ' + ((state.page - 1) * PER + 1) + ' à ' + Math.min(state.page * PER, view.length) + ' sur ' + view.length : '';
    renderChips(); renderPager(view.length ? tot : 0);
    document.title = (state.cat === 'all' ? 'Catalogue' : LABEL[state.cat]) + (state.page > 1 ? ' — page ' + state.page : '') + ' — CALVIN HOME';
    if (!noScroll && render.scroll) { var g = $('#grid'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    render.scroll = false;
  }

  /* ----- interactions ----- */
  $('#chips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) { render.scroll = true; setHash({ cat: b.dataset.cat }); } });
  $('#seg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { render.scroll = true; setHash({ type: b.dataset.k }); } });
  pager.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (b && !b.disabled) { render.scroll = true; setHash({ page: +b.dataset.p }, true); } });
  masonry.addEventListener('click', function (e) {
    var c = e.target.closest('.card'); if (!c) return;
    var id = c.dataset.id, idx = -1;
    view.forEach(function (i, k) { if (i.n + '-' + i.type === id) idx = k; });
    if (idx > -1) openLB(idx, c);
  });
  $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); });
  var qt = null;
  $('#q').addEventListener('input', function (e) { var v = e.target.value; clearTimeout(qt); qt = setTimeout(function () { state.q = v.trim(); setHash({ q: state.q }); }, 250); });
  window.addEventListener('hashchange', function () { parseHash(); render(); });

  /* ----- visionneuse ----- */
  var lb = $('#lb'), stage = $('#lbStage'), cur = 0, opener = null, media = null;
  function clearMedia() {
    if (!media) return;
    if (media.tagName === 'VIDEO') { media.pause(); media.removeAttribute('src'); media.load(); }
    media.remove(); media = null;
    var sp = stage.querySelector('.spin'); if (sp) sp.remove();
  }
  function showLB(k) {
    cur = (k + view.length) % view.length;
    var it = view[cur]; clearMedia();
    var spin = document.createElement('div'); spin.className = 'spin'; stage.appendChild(spin);
    if (it.type === 'photo') {
      var im = new Image(); im.alt = it.title;
      im.onload = im.onerror = function () { spin.remove(); };
      im.src = it.file; media = im;
    } else {
      var v = document.createElement('video');
      v.controls = true; v.playsInline = true; v.poster = it.thumb; v.preload = 'metadata';
      v.setAttribute('aria-label', it.title);
      v.addEventListener('loadeddata', function () { spin.remove(); });
      v.addEventListener('error', function () { spin.remove(); });
      v.src = it.file; media = v;
    }
    stage.insertBefore(media, stage.firstChild);
    $('#lbCount').textContent = (cur + 1) + ' / ' + view.length;
    $('#lbTitle').textContent = it.title;
    $('#lbCat').textContent = LABEL[it.cat] + (it.type === 'video' ? ' · Vidéo' : ' · Photo') + (it.modele ? ' · Modèle' : '');
    $('#lbWa').href = waLink(WA_MSG.produit(it.title, it.ref));
    var one = view.length < 2; $('#lbPrev').style.display = $('#lbNext').style.display = one ? 'none' : '';
    [1, -1].forEach(function (d) { var n = view[(cur + d + view.length) % view.length]; if (n && n.type === 'photo') (new Image()).src = n.file; });
  }
  function openLB(k, el) { opener = el; lb.classList.add('open'); document.documentElement.classList.add('lock'); showLB(k); $('#lbClose').focus(); }
  function closeLB() { if (!lb.classList.contains('open')) return; clearMedia(); lb.classList.remove('open'); document.documentElement.classList.remove('lock'); if (opener && document.contains(opener)) opener.focus(); }
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', function () { showLB(cur - 1); });
  $('#lbNext').addEventListener('click', function () { showLB(cur + 1); });
  stage.addEventListener('click', function (e) { if (e.target === stage) closeLB(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    else if (e.key === 'ArrowLeft') showLB(cur - 1);
    else if (e.key === 'ArrowRight') showLB(cur + 1);
    else if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button,a[href],video[controls]'); f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  var tx = null;
  stage.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 60) showLB(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  parseHash(); render(true);
})();
