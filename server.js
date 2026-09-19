'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { open } = require('./src/db');
const backup = require('./src/backup');
const J = require('./src/jalali');
const importer = require('./src/importer');

const { spawn } = require('node:child_process');
const APP = 'momentum';
const VERSION = require('./package.json').version;
const ARGS = new Set(process.argv.slice(2));
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

const REPO_RAW = 'https://raw.githubusercontent.com/ILIA8400/Momentum/main/package.json';
const REPO_URL = 'https://github.com/ILIA8400/Momentum';
const DATA_FILE = process.env.PLAN_DB || path.join(ROOT, 'data', 'plan.db');
const BACKUP_DIR = process.env.PLAN_BACKUPS || path.join(ROOT, 'backups');
const PORT_FILE = path.join(path.dirname(DATA_FILE), 'port.txt');
const VERSION_FILE = path.join(path.dirname(DATA_FILE), 'version.txt');
const PUBLIC = path.join(ROOT, 'public');

// حالت --stop: به نمونهٔ در حال اجرا می‌گوید خاموش شود
if (ARGS.has('--stop')) {
  stopRunning().then((ok) => { console.log(ok ? '✔ Momentum خاموش شد' : 'Momentum در حال اجرا نبود'); setTimeout(() => process.exit(0), 300); });
  return;
}

// حالت دسکتاپ (--open): وقتی همهٔ تب‌های اپ بسته شدند، سرور خودش خاموش می‌شود و پورت آزاد می‌شود
const DESKTOP = (ARGS.has('--open') || ARGS.has('--desktop')) && !ARGS.has('--keep-alive');
const IDLE_MS = Number(process.env.MOMENTUM_IDLE_MS) || 90 * 1000;      // بدون هیچ heartbeat به این مدت → خاموش
const BYE_GRACE_MS = Number(process.env.MOMENTUM_BYE_MS) || 8 * 1000;  // بعد از بسته شدن تب، این‌قدر صبر کن (برای refresh)
const TICK_MS = Number(process.env.MOMENTUM_TICK_MS) || 15000;

let db;
main().catch((e) => { console.error('خطا:', e.message); process.exit(1); });

async function main() {
  // نمونهٔ در حال اجرا؟ (پورت ذخیره‌شده یا پیش‌فرض) → فقط مرورگر
  let saved = 0;
  try { saved = Number(fs.readFileSync(PORT_FILE, 'utf8').trim()) || 0; } catch {}
  for (const p of new Set([saved, PORT].filter(Boolean))) {
    if (await isMomentum(p)) {
      console.log(`ℹ Momentum از قبل روی http://localhost:${p} در حال اجراست — همان باز می‌شود.`);
      if (ARGS.has('--open')) await openBrowser(`http://localhost:${p}`);
      process.exit(0);
    }
  }
  upgradeGuard();
  db = open(DATA_FILE);
  backup.schedule(db, BACKUP_DIR, 6);
  try { fs.mkdirSync(path.dirname(VERSION_FILE), { recursive: true }); fs.writeFileSync(VERSION_FILE, VERSION); } catch {}
  start(PORT);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, { 'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', ...headers });
  res.end(isJson ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 50e6) reject(new Error('body too large')); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(new Error('JSON نامعتبر')); } });
    req.on('error', reject);
  });
}

const routes = [];
const route = (method, pattern, handler) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler });

route('GET', '/api/subjects', () => db.listSubjects());
route('POST', '/api/subjects', async (req) => { const b = await readBody(req); return { id: db.addSubject(b.name, b.color) }; });
route('PUT', '/api/subjects/:id', async (req, p) => { db.updateSubject(+p.id, await readBody(req)); return { ok: true }; });
route('DELETE', '/api/subjects/:id', (req, p) => { db.deleteSubject(+p.id); return { ok: true }; });

route('GET', '/api/entries', (req, p, url) => db.listEntries(url.searchParams.get('from'), url.searchParams.get('to')));
route('POST', '/api/entries', async (req) => db.addEntry(await readBody(req)));
route('PUT', '/api/entries/:id', async (req, p) => db.updateEntry(+p.id, await readBody(req)));
route('DELETE', '/api/entries/:id', (req, p) => { db.deleteEntry(+p.id); return { ok: true }; });

route('GET', '/api/goals', (req, p, url) => db.getGoals(url.searchParams.get('period'), url.searchParams.get('key')));
route('PUT', '/api/goals', async (req) => { const b = await readBody(req); db.setGoal(b.period, b.key, b.subject_id, b.minutes); return { ok: true }; });

route('GET', '/api/stats', (req, p, url) => db.stats(url.searchParams.get('from'), url.searchParams.get('to')));
route('GET', '/api/records', () => db.records());

route('GET', '/api/notes/:date', (req, p) => ({ date: p.date, text: db.getNote(p.date) }));
route('PUT', '/api/notes/:date', async (req, p) => { const b = await readBody(req); db.setNote(p.date, b.text); return { ok: true }; });
route('GET', '/api/notes', (req, p, url) => db.listNotes(url.searchParams.get('from'), url.searchParams.get('to')));

route('GET', '/api/settings', () => db.getSettings());
route('PUT', '/api/settings', async (req) => { const b = await readBody(req); for (const [k, v] of Object.entries(b)) db.setSetting(k, v); return db.getSettings(); });

// گزارش هفتگی (All Plan): همه چیزِ یک هفته در یک پاسخ
route('GET', '/api/week', (req, p, url) => {
  const start = J.weekStart(url.searchParams.get('date') || J.todayJalali());
  const end = J.addDays(start, 6);
  return { start, end, entries: db.listEntries(start, end), notes: db.listNotes(start, end), goals: db.getGoals('week', start), stats: db.stats(start, end), settings: db.getSettings(), subjects: db.listSubjects() };
});

route('GET', '/api/backup', () => db.export());
route('GET', '/api/backup.csv', (req, p, url, res) => { send(res, 200, db.exportCsv(), { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="plan-${J.todayJalali()}.csv"` }); return null; });
// پاک کردن کل تاریخچه: نیاز به عبارت تأیید دارد؛ قبلش بکاپ .db و .json گرفته می‌شود
route('POST', '/api/wipe', async (req) => {
  const b = await readBody(req);
  if (b.confirm !== 'پاک کن') throw new Error('عبارت تأیید درست نیست');
  const dbFile = backup.backupNow(db, BACKUP_DIR, 'pre-wipe');
  const jsonFile = dbFile.replace(/\.db$/, '.json');
  fs.writeFileSync(jsonFile, JSON.stringify(db.export()));
  db.wipeHistory();
  return { ok: true, backup: jsonFile };
});
// ورود از اکسل
route('GET', '/api/import/template.xlsx', (req, p, url, res) => {
  send(res, 200, importer.buildTemplate(db.listSubjects()), { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="momentum-template.xlsx"' });
  return null;
});
route('GET', '/api/import/sample.xlsx', (req, p, url, res) => {
  const subs = db.listSubjects().filter((x) => !x.archived).map((x) => x.name);
  const t = J.todayJalali().replace(/-/g, '/');
  const y = J.addDays(J.todayJalali(), -1).replace(/-/g, '/');
  const sample = [
    [y, subs[0] || 'گسسته', '08:00', '09:40', '', '70', '', '30', '60', '42', '9', 'تست فصل ۳ — مدت از ساعت شروع/پایان حساب می‌شود؛ ۶۰ تست: ۴۲ درست، ۹ غلط', 'بله'],
    [y, subs[1] || 'مدار', '', '', '3:00', '', '', '', '', '', '', 'فیلم جلسه ۱۲ — فقط مدت کل', 'بله'],
    [t, subs[2] || 'هوش', '', '', '', '90', '30', '', '', '', '', 'خواندن ۹۰ + مرور ۳۰ = مدت کل ۱۲۰', 'خیر'],
  ];
  send(res, 200, importer.buildTemplate(db.listSubjects(), sample), { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="momentum-sample.xlsx"' });
  return null;
});
route('POST', '/api/import/analyze', async (req) => {
  const b = await readBody(req); // { name, data: base64 }
  if (!b.data) throw new Error('فایلی ارسال نشد');
  const buf = Buffer.from(b.data, 'base64');
  return importer.analyze(buf, b.name || 'file.xlsx', db.listSubjects(), db.listEntries('0000-00-00', '9999-99-99'));
});
route('POST', '/api/import/commit', async (req) => {
  const b = await readBody(req); // { rows: [entry,...] }
  if (!Array.isArray(b.rows) || !b.rows.length) throw new Error('ردیفی برای افزودن نیست');
  backup.backupNow(db, BACKUP_DIR, 'pre-import');
  const ids = db.addEntries(b.rows);
  return { ok: true, added: ids.length };
});
route('POST', '/api/restore', async (req) => {
  const data = await readBody(req);
  backup.backupNow(db, BACKUP_DIR, 'pre-restore');
  db.import(data);
  return { ok: true };
});
route('GET', '/api/backups', () => ({ dir: BACKUP_DIR, dbFile: DATA_FILE, files: backup.list(BACKUP_DIR) }));
route('POST', '/api/backups', () => ({ file: backup.backupNow(db, BACKUP_DIR, 'manual') }));
route('GET', '/api/today', () => ({ today: J.todayJalali() }));
route('GET', '/api/health', () => ({ app: APP, version: VERSION, port: server.address()?.port, pid: process.pid }));
// بررسی نسخهٔ جدید روی گیت‌هاب (فقط وقتی کاربر بخواهد؛ آنلاین)
route('GET', '/api/update-check', async () => {
  try {
    const r = await fetch(REPO_RAW + '?t=' + Date.now(), { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const latest = (await r.json()).version;
    return { current: VERSION, latest, hasUpdate: cmpVer(latest, VERSION) > 0, repo: REPO_URL };
  } catch (e) { return { current: VERSION, latest: null, error: 'دسترسی به گیت‌هاب ممکن نشد (' + e.message + ')', repo: REPO_URL }; }
});
function cmpVer(a, b) { const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0); } return 0; }
route('POST', '/api/quit', () => { setTimeout(shutdown, 100); return { ok: true }; });
// حضور تب‌های باز (برای خاموش شدن خودکار در حالت دسکتاپ)
let lastSeen = Date.now(), byeAt = 0, sawClient = false;
route('POST', '/api/heartbeat', () => { lastSeen = Date.now(); byeAt = 0; sawClient = true; return { ok: true, desktop: DESKTOP }; });
route('POST', '/api/bye', () => { byeAt = Date.now(); return { ok: true }; });
if (DESKTOP) {
  let lastTick = Date.now();
  const t = setInterval(() => {
    const now = Date.now();
    // اگر سیستم خواب رفته بود (فاصلهٔ تیک خیلی بیشتر از حد)، مهلت تازه بده
    if (now - lastTick > 3 * TICK_MS) { lastSeen = now; byeAt = 0; }
    lastTick = now;
    if (!sawClient) return; // هنوز مرورگر باز نشده (مثلاً کند بالا آمده)
    const idle = now - lastSeen > IDLE_MS;
    const gone = byeAt && now - byeAt > BYE_GRACE_MS && now - lastSeen > BYE_GRACE_MS;
    if (idle || gone) { console.log('ℹ همهٔ تب‌های Momentum بسته شد؛ سرور خاموش می‌شود و پورت آزاد می‌گردد.'); shutdown(); }
  }, TICK_MS);
  t.unref();
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    for (const r of routes) {
      const m = r.re.exec(url.pathname);
      if (m && r.method === req.method) {
        try { const out = await r.handler(req, m.groups || {}, url, res); return out === null ? undefined : send(res, 200, out); }
        catch (e) { return send(res, 400, { error: e.message }); }
      }
    }
    return send(res, 404, { error: 'not found' });
  }
  // فایل‌های استاتیک
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  if (file === '/jalali.js') return serveFile(res, path.join(ROOT, 'src', 'jalali.js'));
  file = path.normalize(path.join(PUBLIC, file));
  if (!file.startsWith(PUBLIC)) return send(res, 403, 'forbidden');
  serveFile(res, file);
}

function serveFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'not found');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => handle(req, res).catch((e) => send(res, 500, { error: e.message })));

// اولین اجرا بعد از به‌روزرسانی: قبل از هر migration، یک کپی خام از دیتابیس نگه دار
function upgradeGuard() {
  let last = '';
  try { last = fs.readFileSync(VERSION_FILE, 'utf8').trim(); } catch {}
  if (last === VERSION || !fs.existsSync(DATA_FILE)) return;
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    for (const suf of ['', '-wal', '-shm']) {
      if (fs.existsSync(DATA_FILE + suf)) fs.copyFileSync(DATA_FILE + suf, path.join(BACKUP_DIR, `plan-pre-update-${last || 'unknown'}-to-${VERSION}-${stamp}.db${suf}`));
    }
    console.log(`ℹ نسخهٔ جدید (${last || '؟'} → ${VERSION}): قبل از به‌روزرسانی دیتابیس، کپی امن در پوشهٔ بکاپ ذخیره شد.`);
  } catch (e) { console.error('هشدار: کپی پیش از به‌روزرسانی ناموفق بود:', e.message); }
}

// آیا روی این پورت همین اپ در حال اجراست؟
function isMomentum(port) {
  return fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1500) })
    .then((r) => r.json()).then((j) => j.app === APP).catch(() => false);
}
function openBrowser(url) {
  return new Promise((resolve) => {
    const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    let child;
    try { child = spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: true }); } catch { return resolve(false); }
    child.on('exit', () => resolve(true));
    child.on('error', () => resolve(false));
    child.unref();
    setTimeout(() => resolve(true), 1500);
  });
}
async function stopRunning() {
  let port = PORT;
  try { port = Number(fs.readFileSync(PORT_FILE, 'utf8').trim()) || PORT; } catch {}
  for (const p of new Set([port, PORT])) {
    if (await isMomentum(p)) { await fetch(`http://127.0.0.1:${p}/api/quit`, { method: 'POST' }).catch(() => {}); return true; }
  }
  return false;
}

// اگر پورت اشغال بود: اگر خود Momentum است فقط مرورگر را باز کن؛ وگرنه پورت بعدی را امتحان کن
async function start(port, tries = 10) {
  server.removeAllListeners('error');
  server.once('error', async (err) => {
    if (err.code !== 'EADDRINUSE') { console.error('خطا در اجرای سرور:', err.message); process.exit(1); }
    if (await isMomentum(port)) {
      console.log(`ℹ Momentum از قبل روی http://localhost:${port} در حال اجراست — همان باز می‌شود.`);
      if (ARGS.has('--open')) await openBrowser(`http://localhost:${port}`);
      try { db.close(); } catch {}
      process.exit(0);
    }
    if (tries <= 1) { console.error(`پورت‌های ${PORT} تا ${port} همه اشغال‌اند.`); process.exit(1); }
    console.log(`⚠ پورت ${port} توسط برنامهٔ دیگری اشغال است؛ امتحان ${port + 1}…`);
    start(port + 1, tries - 1);
  });
  server.listen(port, '127.0.0.1');
}
server.once('listening', () => {
  const port = server.address().port;
  const url = `http://localhost:${port}`;
  try { fs.writeFileSync(PORT_FILE, String(port)); } catch {}
  console.log(`⚡ Momentum ${VERSION}:  ${url}`);
  console.log(`  دیتابیس:  ${DATA_FILE}`);
  console.log(`  بکاپ‌ها:   ${BACKUP_DIR}`);
  console.log(DESKTOP ? '  با بسته شدن تب مرورگر، سرور خودش خاموش می‌شود (برای غیرفعال کردن: --keep-alive).' : '  برای خاموش کردن: این پنجره را ببند، Ctrl+C بزن، یا stop.bat را اجرا کن.');
  if (ARGS.has('--open')) openBrowser(url);
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return; shuttingDown = true;
  try { if (db) backup.backupNow(db, BACKUP_DIR, 'exit'); } catch {}
  try { if (db) db.close(); } catch {}
  try { fs.unlinkSync(PORT_FILE); } catch {}
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

module.exports = { server, db };
