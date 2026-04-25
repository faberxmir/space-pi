const widget = document.getElementById('term-widget');
const output = document.getElementById('term-output');
const input  = document.getElementById('term-input');
const prompt = document.getElementById('term-prompt');

let mode = 'login';
let loginStep = 'username';
let pendingUsername = '';

function appendLine(text, cls) {
  const lines = String(text).split('\n');
  for (const line of lines) {
    const el = document.createElement('span');
    el.className = 'term-line' + (cls ? ' ' + cls : '');
    el.textContent = line;
    output.appendChild(el);
    output.appendChild(document.createTextNode('\n'));
  }
  output.scrollTop = output.scrollHeight;
}

function enterLoginMode() {
  mode      = 'login';
  loginStep = 'username';
  input.type = 'text';
  prompt.textContent = 'login:';
  appendLine('login:', 'term-line--login');
  input.focus();
}

function enterShellMode() {
  mode = 'shell';
  input.type = 'text';
  prompt.textContent = '$';
  input.focus();
}

async function handleLogin(value) {
  if (loginStep === 'username') {
    pendingUsername = value;
    loginStep = 'password';
    input.type = 'password';
    prompt.textContent = 'Password:';
    appendLine('Password:', 'term-line--login');
    return;
  }

  // loginStep === 'password'
  input.type = 'text';
  let result;
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: pendingUsername, password: value }),
    });
    result = await res.json();
  } catch (err) {
    appendLine('connection error: ' + err.message, 'term-line--deny');
    enterLoginMode();
    return;
  }

  if (result.ok) {
    enterShellMode();
  } else {
    appendLine(result.error || 'Login incorrect.', 'term-line--error');
    enterLoginMode();
  }
}

async function handleShell(raw) {
  appendLine('$ ' + raw, 'term-line--echo');

  if (raw === 'clear') { output.textContent = ''; return; }

  if (raw === 'logout') {
    try { await fetch('/auth/logout', { method: 'POST' }); } catch (_) {}
    enterLoginMode();
    return;
  }

  const parts   = raw.split(/\s+/);
  const command = parts[0];
  const args    = parts.slice(1);

  let result;
  try {
    const res = await fetch(`/terminal/${encodeURIComponent(command)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args }),
    });
    if (res.status === 401) { enterLoginMode(); return; }
    result = await res.json();
  } catch (err) {
    appendLine('connection error: ' + err.message, 'term-line--deny');
    return;
  }

  if (!result.allowed) { appendLine('command not allowed', 'term-line--deny'); return; }
  if (result.output)   { appendLine(result.output, result.success ? '' : 'term-line--error'); }
}

input.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  const raw = input.value;
  input.value = '';
  if (mode === 'login') {
    await handleLogin(raw.trim());
  } else {
    if (!raw.trim()) return;
    await handleShell(raw.trim());
  }
});

const authState = widget.dataset.auth;
if (authState === 'true') {
  enterShellMode();
} else {
  enterLoginMode();
}
