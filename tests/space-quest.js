// spacequest-theme.js
const r = require('array-gpio');

// Use GPIO18 (physical pin 12): + of buzzer here, – to GND
const buz = r.out(12);

// Chromatic note table (A4=440)
const NOTES = {
  'C4':262,'C#4':277,'D4':294,'D#4':311,'E4':330,'F4':349,'F#4':370,'G4':392,'G#4':415,'A4':440,'A#4':466,'B4':494,
  'C5':523,'C#5':554,'D5':587,'D#5':622,'E5':659,'F5':698,'F#5':740,'G5':784,'G#5':831,'A5':880,'A#5':932,'B5':988,
  'C6':1047,'C#6':1109,'D6':1175,'D#6':1245,'E6':1319,'F6':1397,'F#6':1480,'G6':1568,'G#6':1661,'A6':1760
};

// Busy‑loop square wave (good enough for short tones)
function tone(pin, freq, ms) {
  if (!freq || ms <= 0) { rest(ms); return; }
  const half = BigInt(Math.round(1e9 / (2 * freq)));
  const stopAt = process.hrtime.bigint() + BigInt(ms) * 1_000_000n;
  let next = process.hrtime.bigint(), s = 0;
  while (process.hrtime.bigint() < stopAt) {
    const now = process.hrtime.bigint();
    if (now >= next) {
      s ^= 1; s ? pin.on() : pin.off();
      next = now + half;
    }
  }
  pin.off();
}

function rest(ms){ const end = Date.now() + ms; while (Date.now() < end) {} }

// Convert note length by BPM (q=quarter, e=eighth, h=half, w=whole, s=sixteenth)
function dur(symbol, bpm){
  const beatMs = 60000 / bpm;
  const map = { 'w':4, 'h':2, 'q':1, 'e':0.5, 's':0.25, 't':1/3 };
  const base = map[symbol.replace('.', '')] || 1;
  const dotted = symbol.includes('.') ? base * 1.5 : base;
  return dotted * beatMs;
}

// --- Space Quest (approx. 12s @ 120 BPM). One-voice simplification ---
const BPM = 120;
const SQ_THEME = [
  // Opening fanfare
  ['E5','e'], ['G5','e'], ['B5','e'], ['E6','e'],
  ['D6','e'], ['C6','e'], ['B5','q'], ['R','e'],

  ['E5','e'], ['G5','e'], ['A5','e'], ['B5','e'],
  ['A5','q'], ['G5','e'], ['E5','q'],

  // Heroic rise
  ['E5','e'], ['F#5','e'], ['G5','e'], ['A5','e'],
  ['B5','q'], ['A5','e'], ['G5','q'], ['R','e'],

  // Cadence
  ['E5','e'], ['G5','e'], ['B5','e'], ['D6','e'],
  ['C6','q'], ['B5','e'], ['A5','q'],
  ['G5','h'],

  // Tag
  ['E5','e'], ['G5','e'], ['B5','e'], ['E6','e'],
  ['D6','q'], ['B5','q.'], ['E5','q']
];

// Play sequence
function play(seq, bpm=BPM){
  for (const [note, len] of seq) {
    const ms = dur(len, bpm);
    if (note === 'R') rest(ms);
    else tone(buz, NOTES[note], ms);
    rest(30); // small gap
  }
}

console.log('Playing Space Quest (approx)…');
play(SQ_THEME, BPM);
console.log('Done.');
