const output = document.getElementById('term-output');
const input  = document.getElementById('term-input');

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

input.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  const raw = input.value.trim();
  input.value = '';
  if (!raw) return;

  appendLine('$ ' + raw, 'term-line--echo');

  if (raw === 'clear') { output.textContent = ''; return; }

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
    result = await res.json();
  } catch (err) {
    appendLine('connection error: ' + err.message, 'term-line--deny');
    return;
  }

  if (!result.allowed) {
    appendLine('command not allowed', 'term-line--deny');
    return;
  }

  if (result.output) {
    appendLine(result.output, result.success ? '' : 'term-line--error');
  }
});

input.focus();
