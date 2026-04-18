const { spawn } = require('child_process');

function createPingMonitor({ onPing, logger }) {
  let proc = null;

  function start() {
    try {
      proc = spawn('tcpdump', ['-l', '-n', '-i', 'any', 'icmp[icmptype] == icmp-echo']);
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger?.warn?.('[PING_MONITOR] tcpdump not found — ping detection disabled');
      } else {
        logger?.error?.('[PING_MONITOR] failed to spawn tcpdump', err);
      }
      return;
    }

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        logger?.warn?.('[PING_MONITOR] tcpdump not found — ping detection disabled');
      } else {
        logger?.error?.('[PING_MONITOR] tcpdump error', err);
      }
      proc = null;
    });

    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        const match = line.match(/IP ([\d.]+) >/);
        if (match) {
          logger?.info?.(`[PING_MONITOR] ping from ${match[1]}`);
          try { onPing(match[1]); } catch (_) {}
        }
      }
    });

    proc.on('exit', (code, signal) => {
      if (signal !== 'SIGTERM' && signal !== 'SIGKILL') {
        logger?.warn?.(`[PING_MONITOR] tcpdump exited unexpectedly (code=${code}, signal=${signal})`);
      }
      proc = null;
    });

    logger?.info?.('[PING_MONITOR] listening for ICMP echo requests');
  }

  start();

  return {
    close() {
      if (proc) {
        proc.kill();
        proc = null;
      }
    },
  };
}

module.exports = { createPingMonitor };
