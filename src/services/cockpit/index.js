const fs           = require('fs');
const path         = require('path');
const EventEmitter = require('events');

const FACTORY_SETTINGS = path.join(__dirname, '../../../cockpit/factory-settings.json');
const GROUP_FILE       = '/etc/group';
const PASSWD_FILE      = '/etc/passwd';

let pam = null;
try { pam = require('authenticate-pam'); } catch (_) {}

function readGroupMembers() {
  try {
    const line = fs.readFileSync(GROUP_FILE, 'utf8').split('\n').find(l => l.startsWith('pilot:'));
    if (!line) return [];
    const field = line.split(':')[3]?.trim();
    if (!field) return [];
    return field.split(',').map(m => m.trim()).filter(Boolean);
  } catch (_) {
    return [];
  }
}

function resolvePasswdField(username, fieldIndex) {
  try {
    const line = fs.readFileSync(PASSWD_FILE, 'utf8').split('\n').find(l => l.startsWith(username + ':'));
    if (!line) return null;
    const parts = line.split(':');
    return parts[fieldIndex] ?? null;
  } catch (_) {
    return null;
  }
}

function resolveHomeDir(username) { return resolvePasswdField(username, 5); }
function resolveUid(username) {
  const v = resolvePasswdField(username, 2);
  return v !== null ? parseInt(v, 10) : null;
}

function validatePilotJson(filePath, expectedUid) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.uid !== expectedUid) return null;
    const data  = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const pilotName  = (data.pilotName  || '').trim();
    const shipName   = (data.shipName   || '').trim();
    const pilotImage = (data.pilotImage || '').trim();
    if (!pilotName || !shipName || !pilotImage) return null;
    return { pilotName, shipName, pilotImage };
  } catch (_) {
    return null;
  }
}

function verifyPam(username, password) {
  if (!pam) return Promise.resolve(false);
  return new Promise(resolve => pam.authenticate(username, password, err => resolve(!err)));
}

async function detectSecurityLevel(username, homeDir) {
  let factoryPassword = '';
  try {
    const settings = JSON.parse(fs.readFileSync(FACTORY_SETTINGS, 'utf8'));
    factoryPassword = settings.password || '';
  } catch (_) {}

  const factoryWorks = factoryPassword ? await verifyPam(username, factoryPassword) : false;

  let passwordAuthAllowed = true;
  try {
    const configs = [];
    try { configs.push(fs.readFileSync('/etc/ssh/sshd_config', 'utf8')); } catch (_) {}
    try {
      const sshdDir = '/etc/ssh/sshd_config.d';
      const files = fs.readdirSync(sshdDir).filter(f => f.endsWith('.conf'));
      for (const f of files) {
        try { configs.push(fs.readFileSync(path.join(sshdDir, f), 'utf8')); } catch (_) {}
      }
    } catch (_) {}

    let lastMatch = null;
    for (const config of configs) {
      for (const line of config.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const m = t.match(/^PasswordAuthentication\s+(\S+)/i);
        if (m) lastMatch = m[1].toLowerCase();
      }
    }
    if (lastMatch !== null) passwordAuthAllowed = lastMatch !== 'no';
  } catch (_) {}

  let hasKeys = false;
  try {
    const content = fs.readFileSync(path.join(homeDir, '.ssh', 'authorized_keys'), 'utf8');
    hasKeys = content.split('\n').some(l => { const t = l.trim(); return t && !t.startsWith('#'); });
  } catch (_) {}

  const passwordChanged = !factoryWorks;
  const sshKeyOnly      = !passwordAuthAllowed && hasKeys;

  if (passwordChanged && sshKeyOnly) return 2;
  if (passwordChanged || sshKeyOnly) return 1;
  return 0;
}

function createCockpitService({ sessionService, logger }) {
  const emitter = new EventEmitter();

  let state = { assigned: false, reason: null, pilot: null, securityLevel: 0 };
  let pilotJsonWatchPath = null;
  let securityTimer     = null;
  let currentUsername   = null;
  let currentHomeDir    = null;

  function stopPilotJsonWatcher() {
    if (pilotJsonWatchPath) {
      fs.unwatchFile(pilotJsonWatchPath);
      pilotJsonWatchPath = null;
    }
    currentUsername = null;
    currentHomeDir  = null;
  }

  function stopSecurityTimer() {
    if (securityTimer) { clearInterval(securityTimer); securityTimer = null; }
  }

  async function updateSecurityLevel() {
    if (!state.assigned || !currentUsername || !currentHomeDir) return;
    const level = await detectSecurityLevel(currentUsername, currentHomeDir);
    if (level !== state.securityLevel) {
      state.securityLevel = level;
      emitter.emit('securityLevel', level);
    }
  }

  async function checkPilotJson(pilotJsonPath, uid, username, homeDir) {
    const data = validatePilotJson(pilotJsonPath, uid);
    if (!data) {
      if (state.assigned || state.reason !== 'empty') {
        const wasAssigned = state.assigned;
        stopSecurityTimer();
        state = { assigned: false, reason: 'empty', pilot: null, securityLevel: 0 };
        if (wasAssigned) sessionService?.destroyAll?.();
        emitter.emit('unassigned', { reason: 'empty' });
      }
      return;
    }

    const pilot      = { ...data, username, homeDir };
    const wasAssigned = state.assigned;
    state = { assigned: true, reason: null, pilot, securityLevel: state.securityLevel };

    if (!wasAssigned) {
      emitter.emit('assigned', { pilot });
      await updateSecurityLevel();
      securityTimer = setInterval(updateSecurityLevel, 30000);
    }
  }

  async function startWatchingPilot(username, homeDir) {
    const pilotJsonPath = path.join(homeDir, 'pilot.json');
    const uid = resolveUid(username);

    currentUsername   = username;
    currentHomeDir    = homeDir;
    pilotJsonWatchPath = pilotJsonPath;

    await checkPilotJson(pilotJsonPath, uid, username, homeDir);

    fs.watchFile(pilotJsonPath, { interval: 1000, persistent: false }, async (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs || curr.nlink !== prev.nlink) {
        await checkPilotJson(pilotJsonPath, uid, username, homeDir);
      }
    });
  }

  async function checkGroup() {
    const members = readGroupMembers();

    if (members.length !== 1) {
      const reason  = members.length === 0 ? 'empty' : 'tooMany';
      const changed = state.assigned || state.reason !== reason;
      stopPilotJsonWatcher();
      stopSecurityTimer();
      if (changed) {
        const wasAssigned = state.assigned;
        state = { assigned: false, reason, pilot: null, securityLevel: 0 };
        if (wasAssigned) sessionService?.destroyAll?.();
        emitter.emit('unassigned', { reason });
      }
      return;
    }

    const username = members[0];
    if (currentUsername === username) return;

    stopPilotJsonWatcher();
    stopSecurityTimer();

    const homeDir = resolveHomeDir(username);
    if (!homeDir) {
      const changed = state.assigned || state.reason !== 'empty';
      if (changed) {
        const wasAssigned = state.assigned;
        state = { assigned: false, reason: 'empty', pilot: null, securityLevel: 0 };
        if (wasAssigned) sessionService?.destroyAll?.();
        emitter.emit('unassigned', { reason: 'empty' });
      }
      return;
    }

    await startWatchingPilot(username, homeDir);
  }

  setImmediate(() => checkGroup().catch(err => logger?.warn?.('[COCKPIT] initial check error:', err)));

  fs.watchFile(GROUP_FILE, { interval: 1000, persistent: false }, async (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      await checkGroup().catch(err => logger?.warn?.('[COCKPIT] group watch error:', err));
    }
  });

  return {
    on(event, handler) { emitter.on(event, handler); return this; },
    currentState()     { return { ...state, pilot: state.pilot ? { ...state.pilot } : null }; },
    close() {
      fs.unwatchFile(GROUP_FILE);
      stopPilotJsonWatcher();
      stopSecurityTimer();
      emitter.removeAllListeners();
    },
  };
}

module.exports = { createCockpitService };
