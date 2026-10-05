const fs = require('fs');
const origContent = fs.readFileSync('orig_utf8.ts', 'utf8');

const extractSection = (str, sectionNum) => {
    const idx = str.indexOf(`"${sectionNum}": {`);
    if (idx === -1) return null;
    
    let braceCount = 0;
    let started = false;
    for (let i = idx; i < str.length; i++) {
        if (str[i] === '{') {
            braceCount++;
            started = true;
        } else if (str[i] === '}') {
            braceCount--;
        }
        if (started && braceCount === 0) {
            return str.substring(idx, i + 1);
        }
    }
    return null;
};

const extracted = [];
for (let i = 1; i <= 9; i++) {
    const res = extractSection(origContent, i);
    if (res) extracted.push(res);
}
console.log(`Extracted ${extracted.length} sections`);
if (extracted.length === 9) {
    fs.writeFileSync('csL1A.ts', extracted.join(',\n'));
    console.log('Wrote csL1A.ts');
}
