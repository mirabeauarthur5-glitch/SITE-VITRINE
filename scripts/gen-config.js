// Génère js/supabase-config.js à partir des variables d'environnement (build Vercel).
// Sans variables : le fichier existant (valeurs vides) est conservé → avis via WhatsApp.
const fs = require('fs'), path = require('path');
const url = (process.env.SUPABASE_URL || '').trim(), key = (process.env.SUPABASE_ANON_KEY || '').trim();
if (url && key) {
  fs.writeFileSync(path.join(__dirname, '..', 'js', 'supabase-config.js'),
    "/* Généré au build depuis les variables d'environnement */\nwindow.CH_SUPABASE = " + JSON.stringify({ url, anonKey: key }) + ";\n");
  console.log('supabase-config.js généré (avis Supabase activés).');
} else console.log('SUPABASE_* absentes : avis via WhatsApp (repli).');
