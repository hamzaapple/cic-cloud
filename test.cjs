const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL="?(.*?)"?$/m)[1];
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="?(.*?)"?$/m)[1];

fetch(url + '/rest/v1/materials?title=ilike.*Creative%20Thinking*', { 
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } 
})
.then(r => r.json())
.then(console.log);
