const GUN_GROUPS = {
  all:    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  left:   [1, 2, 3],
  center: [4, 5, 6],
  right:  [7, 8, 9],
};

const CHARGE_CYCLES    = 10;
const CHARGE_CYCLE_MS  = 200;
const CHARGE_ON_MS     = 100;
const CHARGE_SURGE_HZ  = 800;
const CHARGE_SURGE_MS  = 80;

const FIRE_ON_MS       = 200;
const FIRE_OFF_MS      = 100;
const FIRE_LASER_HZ    = 1500;
const FIRE_LASER_MS    = 200;

const delay = ms => new Promise(r => setTimeout(r, ms));

function gunMask(n) {
  return 1 << (n - 1);
}

function resolveGuns(target) {
  if (GUN_GROUPS[target]) return GUN_GROUPS[target];
  const n = parseInt(target, 10);
  if (n >= 1 && n <= 9) return [n];
  return [];
}

function createGunctrlService({ ledService, buzzerService, logger }) {
  const charged  = new Set();
  const charging = new Set();

  async function chargeOne(gun) {
    charging.add(gun);
    const mask = gunMask(gun);
    try {
      for (let i = 0; i < CHARGE_CYCLES; i++) {
        ledService?.set(mask);
        buzzerService?.beep(CHARGE_SURGE_MS, CHARGE_SURGE_HZ);
        await delay(CHARGE_ON_MS);
        ledService?.set(0);
        await delay(CHARGE_CYCLE_MS - CHARGE_ON_MS);
      }
      charged.add(gun);
      logger?.info?.(`[GUNCTRL] gun ${gun} charged`);
    } finally {
      charging.delete(gun);
    }
  }

  async function fireEffect(guns) {
    const mask = guns.reduce((m, g) => m | gunMask(g), 0);
    ledService?.set(mask);
    buzzerService?.beep(FIRE_LASER_MS, FIRE_LASER_HZ);
    await delay(FIRE_ON_MS);
    ledService?.set(0);
    await delay(FIRE_OFF_MS);
    ledService?.set(mask);
    await delay(FIRE_ON_MS);
    ledService?.set(0);
  }

  function handle(args) {
    const sub    = (args[0] || '').toLowerCase();
    const target = (args[1] || '').toLowerCase();

    if (sub !== '-charge' && sub !== '-fire') {
      return { allowed: true, success: false, output: 'Usage: gunctrl -charge|-fire all|left|center|right|<1-9>' };
    }

    const guns = resolveGuns(target);
    if (!guns.length) {
      return { allowed: true, success: false, output: `Unknown target '${target}'. Use: all left center right 1-9` };
    }

    if (sub === '-charge') {
      const toCharge = guns.filter(g => !charged.has(g) && !charging.has(g));
      if (!toCharge.length) {
        return { allowed: true, success: true, output: 'All selected guns already charged or charging.' };
      }
      (async () => {
        for (const g of toCharge) await chargeOne(g);
      })();
      return { allowed: true, success: true, output: `Charging guns: ${toCharge.join(', ')}` };
    }

    // -fire
    const toFire = guns.filter(g => charged.has(g));
    if (!toFire.length) {
      return { allowed: true, success: false, output: 'No guns charged. Use gunctrl -charge first.' };
    }
    toFire.forEach(g => charged.delete(g));
    fireEffect(toFire);
    logger?.info?.(`[GUNCTRL] fired guns: ${toFire.join(', ')}`);
    return { allowed: true, success: true, output: `Firing: ${toFire.join(', ')}` };
  }

  return { handle };
}

module.exports = { createGunctrlService };
