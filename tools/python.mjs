// Portable Python entry point. MV_PYTHON may select a runtime with the QA packages installed.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const local = process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python';
const candidates = process.env.MV_PYTHON ? [process.env.MV_PYTHON] : [local, ...(process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'])];
for (const command of candidates) {
  if (command === local && !fs.existsSync(local)) continue;
  const probe = spawnSync(command, ['--version'], { stdio: 'ignore' });
  if (probe.status !== 0) continue;
  const result = spawnSync(command, process.argv.slice(2), { stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  process.exit(result.status ?? 1);
}
console.error('Python not found. Install Python 3 or set MV_PYTHON to its executable path.');
process.exit(1);
