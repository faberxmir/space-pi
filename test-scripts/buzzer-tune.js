const r = require('array-gpio');

// Physical pin 12 = GPIO18
const buz = r.out(12);

// Map note names to frequencies
const NOTES = {
  'C4': 262, 'D4': 294, 'E4': 330, 'F4': 349, 'G4': 392, 'A4': 440, 'B4': 494,
  'C5': 523, 'D5': 587, 'E5': 659, 'F5': 698, 'G5': 784, 'A5': 880, 'B5': 988
};

function tone(pin, freq, durationMs) {
  const halfPeriodNs = BigInt(Math.round(1e9 / (2 * freq)));
  const stopAt = process.hrtime.bigint() + BigInt(durationMs) * 1_000_000n;

  let next = process.hrtime.bigint();
  let state = 0;

  while (process.hrtime.bigint() < stopAt) {
    const now = process.hrtime.bigint();
    if (now >= next) {
      state ^= 1;
      state ? pin.on() : pin.off();
      next = now + halfPeriodNs;
    }
  }
  pin.off();
}

// Play a sequence of notes
function playTune(sequence) {
  for (const [note, dur] of sequence) {
    if (note === null) {
      // rest
      buz.off();
      sleep(dur);
    } else {
      tone(buz, NOTES[note], dur);
    }
    sleep(50); // short pause between notes
  }
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

// Short ~10 sec happy tune
const tune = [
  ['E5', 300], ['E5', 300], [null, 150], ['E5', 300],
  [null, 150], ['C5', 300], ['E5', 300], [null, 150], ['G5', 600],
  [null, 200],
  ['G4', 300], [null, 150], ['C5', 300], [null, 150],
  ['G4', 300], [null, 150], ['E4', 300], ['A4', 300], ['B4', 300],
  ['A4', 150], ['G4', 300], ['E5', 300], ['G5', 300], ['A5', 600]
];

const tune2 = [
    ['C5', 400], ['E5', 400], ['G5', 400], ['C6', 800],
    ['B5', 400], ['A5', 400], ['G5', 400], ['E5', 800],
    ['C5', 400], ['E5', 400], ['G5', 400], ['C6', 800],
    ['B5', 400], ['A5', 400], ['G5', 400], ['E5', 800]
];
console.log("Playing tune...");
playTune(tune2);
console.log("Done!");
