/* CALVIN HOME — avis clients via Supabase (API REST PostgREST, sans SDK).
   - Création : { name, rating, text } → status "pending" par défaut (imposé par la base, RLS)
   - Lecture  : uniquement les avis status = "approved" (RLS)
   Validation : tableau de bord Supabase → Table Editor → calvin_home_reviews → status = approved. */
(function () {
  'use strict';
  var C = window.CH_SUPABASE || {};
  var enabled = !!(C.url && C.anonKey);
  var api = enabled ? C.url.replace(/\/+$/, '') + '/rest/v1/calvin_home_reviews' : '';
  function headers(extra) {
    var h = { apikey: C.anonKey, 'Content-Type': 'application/json' };
    for (var k in extra) h[k] = extra[k]; return h;
  }
  function timeout(ms) { var c = new AbortController(); setTimeout(function () { c.abort(); }, ms); return c.signal; }

  function submit(r) {
    if (!enabled) return Promise.reject(new Error('not-configured'));
    return fetch(api, { method: 'POST', headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ name: r.name, rating: r.rating, text: r.text }), signal: timeout(15000) })
      .then(function (res) { if (!res.ok) throw new Error('http-' + res.status); });
  }
  function fetchApproved() {
    if (!enabled) return Promise.resolve([]);
    return fetch(api + '?select=name,rating,text,created_at&status=eq.approved&order=created_at.desc&limit=20',
      { headers: headers({}), signal: timeout(15000) })
      .then(function (res) { if (!res.ok) throw new Error('http-' + res.status); return res.json(); })
      .then(function (rows) { return rows.filter(function (r) { return r.name && r.text && r.rating >= 1 && r.rating <= 5; }); });
  }
  /* Demandes de devis : copie enregistrée dans Supabase (insertion seule, RLS), en plus de l'envoi WhatsApp. */
  var qApi = enabled ? C.url.replace(/\/+$/, '') + '/rest/v1/calvin_home_quotes' : '';
  function submitQuote(q) {
    if (!enabled) return Promise.resolve(false);
    return fetch(qApi, { method: 'POST', headers: headers({ Prefer: 'return=minimal' }), keepalive: true,
      body: JSON.stringify({ name: q.name, phone: q.phone, service: q.service, subject: q.subject, description: q.description }), signal: timeout(15000) })
      .then(function (res) { return res.ok; }).catch(function () { return false; });
  }
  window.CH_Reviews = { submitQuote: submitQuote, enabled: enabled, submit: submit, fetchApproved: fetchApproved };
})();
