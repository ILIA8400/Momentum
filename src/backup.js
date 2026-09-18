'use strict';
const fs = require('node:fs');
const path = require('node:path');

const KEEP = 30;

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${String(d.getMilliseconds()).padStart(3, '0')}`;
}

// یک کپی سازگار از دیتابیس (با استفاده از VACUUM INTO که در حین WAL هم امن است)
function backupNow(db, dir, label = 'auto') {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `plan-${label}-${stamp()}.db`);
  db.raw.exec(`VACUUM INTO '${file.replace(/\\/g, '/').replace(/'/g, "''")}'`);
  prune(dir);
  return file;
}

function prune(dir) {
  const files = list(dir);
  for (const f of files.slice(KEEP)) fs.unlinkSync(path.join(dir, f.name));
}

function list(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((n) => n.endsWith('.db'))
    .map((n) => { const st = fs.statSync(path.join(dir, n)); return { name: n, size: st.size, mtime: st.mtime.toISOString() }; })
    .sort((a, b) => b.mtime.localeCompare(a.mtime));
}

function schedule(db, dir, hours = 6) {
  backupNow(db, dir, 'start');
  const t = setInterval(() => {
    try { backupNow(db, dir, 'auto'); } catch (e) { console.error('backup failed:', e.message); }
  }, hours * 3600 * 1000);
  t.unref();
  return t;
}

module.exports = { backupNow, list, schedule, KEEP };
