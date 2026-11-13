// Génère js/firebase-config.js à partir des variables d'environnement (build Vercel).
// Sans variables : le fichier existant (valeurs vides) est conservé.
const fs = require('fs'), path = require('path');
const k = (process.env.FIREBASE_API_KEY || '').trim(), p = (process.env.FIREBASE_PROJECT_ID || '').trim();
if (k && p) {
  const out = '/* Généré au build depuis les variables d\'environnement */\nwindow.CH_FIREBASE = ' +
    JSON.stringify({ apiKey: k, projectId: p }) + ';\n';
  fs.writeFileSync(path.join(__dirname, '..', 'js', 'firebase-config.js'), out);
  console.log('firebase-config.js généré (avis Firestore activés).');
} else {
  console.log('FIREBASE_* absentes : avis via WhatsApp (repli).');
}
