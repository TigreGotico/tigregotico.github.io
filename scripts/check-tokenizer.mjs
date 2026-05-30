import fs from 'node:fs';
// MUST stay identical to tokenizeUnicode in src/scripts/phoonnx-tts.ts
const PUNCT = new Set("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~");
function tokenizeUnicode(text, idMap) {
  const blank = idMap['_'] ?? 0, bos = idMap['^'] ?? 1, eos = idMap['$'] ?? 2;
  let cleaned = '';
  for (const ch of text) if (!PUNCT.has(ch)) cleaned += ch;
  const tokens = [];
  for (const ch of Array.from(cleaned.trim().normalize('NFD'))) if (ch in idMap) tokens.push(idMap[ch]);
  const seq = [bos, blank];
  for (const t of tokens) seq.push(t, blank);
  seq.push(eos);
  return seq;
}
const cfg = JSON.parse(fs.readFileSync(process.argv[2] || '/tmp/phoonnx_demo/voice.json', 'utf8'));
const idMap = Object.fromEntries(Object.entries(cfg.phoneme_id_map).map(([k,v]) => [k, Array.isArray(v)?v[0]:v]));
const got = tokenizeUnicode('Goeie moarn, wrâld!', idMap);
const golden = [1,0,17,0,49,0,39,0,43,0,39,0,3,0,47,0,49,0,35,0,52,0,48,0,3,0,57,0,52,0,35,0,63,0,46,0,38,0,2];
const ok = JSON.stringify(got) === JSON.stringify(golden);
console.log(ok ? 'PARITY OK ✓' : 'MISMATCH ✗\n got   : '+got.join(',')+'\n golden: '+golden.join(','));
process.exit(ok ? 0 : 1);
