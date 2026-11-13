/* CALVIN HOME — avis clients via Firestore (API REST, sans SDK).
   - Création : document { name, rating, text, status: "pending" } (jamais publié tant que status != "approved")
   - Lecture  : uniquement les documents status == "approved"
   La validation se fait dans la console Firebase en passant status à "approved". */
(function () {
  'use strict';
  var C = window.CH_FIREBASE || {};
  var enabled = !!(C.apiKey && C.projectId);
  var base = enabled ? 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(C.projectId) + '/databases/(default)/documents' : '';

  function timeout(ms) {
    var c = new AbortController(); setTimeout(function () { c.abort(); }, ms); return c.signal;
  }

  function submit(r) {
    if (!enabled) return Promise.reject(new Error('not-configured'));
    var body = { fields: {
      name: { stringValue: r.name }, rating: { integerValue: String(r.rating) },
      text: { stringValue: r.text }, status: { stringValue: 'pending' }
    } };
    return fetch(base + '/reviews?key=' + encodeURIComponent(C.apiKey), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: timeout(15000)
    }).then(function (res) { if (!res.ok) throw new Error('http-' + res.status); return res.json(); });
  }

  function fetchApproved() {
    if (!enabled) return Promise.resolve([]);
    var q = { structuredQuery: { from: [{ collectionId: 'reviews' }],
      where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'approved' } } }, limit: 20 } };
    return fetch(base + ':runQuery?key=' + encodeURIComponent(C.apiKey), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q), signal: timeout(15000)
    }).then(function (res) { if (!res.ok) throw new Error('http-' + res.status); return res.json(); })
      .then(function (rows) {
        return rows.filter(function (x) { return x.document; }).map(function (x) {
          var f = x.document.fields || {};
          return { name: (f.name || {}).stringValue || '', rating: +((f.rating || {}).integerValue || 0),
            text: (f.text || {}).stringValue || '', t: x.document.createTime || '' };
        }).filter(function (r) { return r.name && r.text && r.rating >= 1 && r.rating <= 5; })
          .sort(function (a, b) { return a.t < b.t ? 1 : -1; });
      });
  }

  window.CH_Reviews = { enabled: enabled, submit: submit, fetchApproved: fetchApproved };
})();
