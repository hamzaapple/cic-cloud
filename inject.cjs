const fs = require('fs');
let content = fs.readFileSync('src/lib/schedule-data.ts', 'utf8');
const l1a = fs.readFileSync('csL1A.ts', 'utf8');
content = content.replace('  "1": {\n    "1": {\n', '  "1": {\n    "1": {\n' + l1a + ',\n');
fs.writeFileSync('src/lib/schedule-data.ts', content);
console.log('Injected 1-9 into schedule-data.ts');
