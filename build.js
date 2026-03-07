// build.js — genera config.js a partir de variables de entorno
// Se ejecuta en Netlify antes del deploy (ver netlify.toml)

const fs = require('fs');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌  Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_ANON_KEY');
  process.exit(1);
}

const content = `// Auto-generado por build.js — no editar manualmente
const SUPABASE_URL = '${url}';
const SUPABASE_ANON_KEY = '${key}';
const STORAGE_BUCKET = 'artworks';
`;

fs.writeFileSync('config.js', content);
console.log('✅  config.js generado correctamente');
