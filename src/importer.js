'use strict';
// ورود دسته‌ای از اکسل: ساخت قالب، خواندن فایل، اعتبارسنجی و پیش‌نمایش
const xlsx = require('./xlsx');
const J = require('./jalali');

const COLUMNS = [
  { key: 'date', title: 'تاریخ', hint: 'مثل ۱۴۰۵/۰۶/۲۷', width: 14, required: true },
  { key: 'subject', title: 'درس', hint: 'دقیقاً نام درس داخل اپ', width: 16, required: true },
  { key: 'start_time', title: 'ساعت شروع', hint: 'اختیاری، مثل 08:30', width: 11 },
  { key: 'end_time', title: 'ساعت پایان', hint: 'اختیاری، مثل 10:00', width: 11 },
  { key: 'minutes', title: 'مدت کل', hint: 'دقیقه یا ساعت:دقیقه (مثل 180 یا 3:00)', width: 12 },
  { key: 'study_min', title: 'خواندن', hint: 'دقیقه، اختیاری', width: 10 },
  { key: 'review_min', title: 'مرور', hint: 'دقیقه، اختیاری', width: 10 },
  { key: 'test_min', title: 'تست زدن', hint: 'دقیقه، اختیاری', width: 10 },
  { key: 'tests', title: 'تعداد تست', hint: 'اختیاری', width: 10 },
  { key: 'correct', title: 'درست', hint: 'اختیاری', width: 8 },
  { key: 'wrong', title: 'غلط', hint: 'اختیاری', width: 8 },
  { key: 'note', title: 'شرح', hint: 'اختیاری، مثل فیلم جلسه ۱۲', width: 34 },
  { key: 'done', title: 'انجام شد', hint: 'بله / خیر (خالی = بله)', width: 10 },
];
// نام‌های جایگزین سرستون‌ها
const ALIASES = {
  date: ['تاریخ', 'date', 'روز'],
  subject: ['درس', 'subject', 'نامدرس'],
  start_time: ['ساعتشروع', 'شروع', 'start', 'starttime', 'از'],
  end_time: ['ساعتپایان', 'پایان', 'end', 'endtime', 'تا'],
  minutes: ['مدتکل', 'مدت', 'مدتمطالعه', 'minutes', 'duration', 'کل', 'زمان'],
  study_min: ['خواندن', 'مطالعه', 'study', 'studymin'],
  review_min: ['مرور', 'review', 'reviewmin'],
  test_min: ['تستزدن', 'مدتتست', 'زمانتست', 'testmin', 'testtime'],
  tests: ['تعدادتست', 'تست', 'تستها', 'tests', 'count'],
  correct: ['درست', 'صحیح', 'correct'],
  wrong: ['غلط', 'نادرست', 'wrong'],
  note: ['شرح', 'توضیح', 'توضیحات', 'یادداشت', 'note', 'description'],
  done: ['انجامشد', 'انجام', 'وضعیت', 'done', 'status'],
};

const FA = '۰۱۲۳۴۵۶۷۸۹', AR = '٠١٢٣٤٥٦٧٨٩';
const toEn = (s) => String(s ?? '').replace(/[۰-۹]/g, (d) => FA.indexOf(d)).replace(/[٠-٩]/g, (d) => AR.indexOf(d));
const norm = (s) => toEn(s).replace(/[‌​\s_\-()]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[ةه]$/, 'ه').toLowerCase();
const normName = (s) => String(s ?? '').replace(/[‌​]/g, '').replace(/\s+/g, ' ').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim().toLowerCase();

function buildTemplate(subjects, prefill = []) {
  const active = subjects.filter((s) => !s.archived).map((s) => s.name);
  const header = COLUMNS.map((c) => ({ v: c.title, bold: true }));
  const data = { name: 'برنامه', rtl: true, freeze: true, cols: COLUMNS.map((c) => c.width), rows: [header] };
  // ۳۰۰ ردیف خالی با استایل متن برای ستون تاریخ و ساعت‌ها (تا اکسل تبدیلشان نکند)
  for (const r of prefill) data.rows.push(r.map((v) => (v === '' || v == null ? null : { v: String(v), text: true })));
  for (let i = 0; i < 300; i++) data.rows.push([{ v: '', text: true }]);
  data.validations = [
    { sqref: 'B2:B1000', formula: `'راهنما'!$D$3:$D$${2 + Math.max(1, active.length)}`, error: 'نام درس باید دقیقاً یکی از درس‌های اپ باشد (لیست را در شیت راهنما ببین)' },
    { sqref: 'M2:M1000', formula: '"بله,خیر"', error: 'فقط بله یا خیر' },
  ];
  const guide = { name: 'راهنما', rtl: true, cols: [16, 44, 4, 22], rows: [
    [{ v: 'ستون', bold: true }, { v: 'توضیح', bold: true }, null, { v: 'درس‌های اپ (دقیقاً همین املا)', bold: true }],
    [{ v: '', text: true }, { v: 'ردیف‌های شیت «برنامه» را پر کن؛ فقط تاریخ، درس و مدت اجباری است.' }],
  ] };
  COLUMNS.forEach((c, i) => { guide.rows[i + 2] = [c.title + (c.required ? ' *' : ''), c.hint]; });
  active.forEach((n, i) => { (guide.rows[i + 2] ||= [])[3] = n; });
  const tips = [
    '', 'نکته‌ها:',
    '• تاریخ شمسی: ۱۴۰۵/۰۶/۲۷ یا 1405-06-27. اگر تاریخ میلادی اکسل هم بگذاری تبدیل می‌شود.',
    '• مدت کل را می‌توانی خالی بگذاری اگر خواندن/مرور/تست یا ساعت شروع و پایان را نوشته‌ای؛ خودش حساب می‌شود.',
    '• مدت به دقیقه است (۱۸۰) یا ساعت:دقیقه (3:00). عدد کوچک مثل «3» یعنی ۳ دقیقه، نه ۳ ساعت!',
    '• درست + غلط نباید از تعداد تست بیشتر باشد.',
    '• چند ردیف با یک تاریخ و درس مشکلی ندارد (چند جلسه در یک روز).',
    '• بعد از پر کردن، فایل را ذخیره کن (xlsx) و در اپ: تنظیمات ← «ورود از اکسل».',
    '', 'نمونه:',
  ];
  let r = Math.max(guide.rows.length, active.length + 3);
  tips.forEach((t) => { guide.rows[r++] = [t ? { v: t, bold: t.endsWith(':') } : null]; });
  guide.rows[r++] = COLUMNS.map((c) => ({ v: c.title, bold: true }));
  guide.rows[r++] = ['1405/06/27', active[0] || 'گسسته', '08:00', '09:40', '100', '70', '', '30', '60', '42', '9', 'تست فصل ۳', 'بله'];
  guide.rows[r++] = ['1405/06/27', active[1] || 'مدار', '', '', '3:00', '', '', '', '', '', '', 'فیلم جلسه ۱۲', 'بله'];
  guide.rows[r++] = ['1405/06/28', active[0] || 'گسسته', '', '', '', '90', '30', '', '', '', '', 'فصل ۴', 'خیر'];
  return xlsx.write([data, guide]);
}

// ---------- تبدیل مقدارها ----------
function parseDate(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') {
    if (v > 20000 && v < 80000) { // سریال اکسل (میلادی)
      const d = new Date(Math.round((v - 25569) * 86400000));
      return J.format(J.toJalali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()));
    }
    v = String(v);
  }
  let s = toEn(v).trim().replace(/[.\\/]/g, '-');
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (!m) { m = /^(\d{2})-(\d{1,2})-(\d{1,2})$/.exec(s); if (m) m[1] = '14' + m[1]; }
  if (!m) return null;
  let [, y, mo, d] = m; y = +y; mo = +mo; d = +d;
  if (y >= 1900 && y <= 2200) { const g = J.toJalali(y, mo, d); return J.format(g); } // میلادی
  const js = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return J.parse(js) ? js : null;
}
function parseTime(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'number') { if (v >= 0 && v < 1) { const m = Math.round(v * 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; } return null; }
  const s = toEn(v).trim().replace(/[:.،٫]/g, ':');
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(s);
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}
function parseMinutes(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v >= 0 && v < 1 ? Math.round(v * 1440) : Math.round(v);
  const s = toEn(v).trim();
  let m = /^(\d{1,2}):(\d{2})$/.exec(s); if (m) return +m[1] * 60 + +m[2];
  m = /^(\d+(?:\.\d+)?)\s*(ساعت|h|hr|hour|hours)$/i.exec(s); if (m) return Math.round(+m[1] * 60);
  m = /^(\d+)\s*(دقیقه|min|m)?$/i.exec(s); if (m) return +m[1];
  return null;
}
function parseInt0(v) {
  if (v == null || v === '') return 0;
  const n = typeof v === 'number' ? v : Number(toEn(v).trim());
  return Number.isInteger(n) && n >= 0 ? n : null;
}
function parseDone(v) {
  if (v == null || v === '') return true;
  const s = norm(v);
  if (['بله', 'آره', 'اره', 'yes', 'y', 'true', '1', '✓', 'انجامشد', 'done', 'ok'].includes(s)) return true;
  if (['خیر', 'نه', 'no', 'n', 'false', '0', 'انجامنشد', 'notdone'].includes(s)) return false;
  return null;
}

// ---------- تحلیل فایل ----------
function detectHeader(rows) {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const map = {};
    (rows[i] || []).forEach((cell, c) => {
      const n = norm(cell);
      if (!n) return;
      for (const [key, names] of Object.entries(ALIASES)) if (!(key in map) && names.some((a) => norm(a) === n)) map[key] = c;
    });
    if ('date' in map && 'subject' in map) return { headerRow: i, map };
  }
  return null;
}

function analyze(buffer, filename, subjects, existing = []) {
  let rows;
  if (/\.csv$/i.test(filename)) rows = xlsx.readCsv(buffer.toString('utf8'));
  else rows = xlsx.read(buffer);
  const det = detectHeader(rows);
  if (!det) throw new Error('سرستون‌های قالب پیدا نشد. حداقل ستون‌های «تاریخ» و «درس» باید در ردیف اول باشند. از قالب دانلودشده استفاده کن.');
  const { headerRow, map } = det;
  const subjByName = new Map(subjects.map((s) => [normName(s.name), s]));
  const existingKeys = new Set(existing.map((e) => `${e.date}|${e.subject_id}|${e.minutes}|${(e.note || '').trim()}`));
  const seen = new Set();
  const out = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const get = (k) => (k in map ? row[map[k]] : undefined);
    const isEmpty = COLUMNS.every((c) => { const v = get(c.key); return v == null || String(v).trim() === ''; });
    if (isEmpty) continue;
    const errors = [], warnings = [];
    const e = { row: r + 1 };
    e.date = parseDate(get('date')); if (!e.date) errors.push('تاریخ نامعتبر');
    const sname = String(get('subject') ?? '').trim();
    const subj = subjByName.get(normName(sname));
    e.subject_name = sname;
    if (!sname) errors.push('درس خالی است'); else if (!subj) errors.push(`درس «${sname}» در اپ وجود ندارد`); else { e.subject_id = subj.id; e.subject_name = subj.name; e.color = subj.color; if (subj.archived) warnings.push('درس بایگانی شده'); }
    e.start_time = parseTime(get('start_time')); if (e.start_time === null) { errors.push('ساعت شروع نامعتبر'); e.start_time = ''; }
    e.end_time = parseTime(get('end_time')); if (e.end_time === null) { errors.push('ساعت پایان نامعتبر'); e.end_time = ''; }
    for (const k of ['minutes', 'study_min', 'review_min', 'test_min']) { const v = parseMinutes(get(k)); if (v === null) { errors.push(`${COLUMNS.find((c) => c.key === k).title} نامعتبر`); e[k] = 0; } else e[k] = v; }
    for (const k of ['tests', 'correct', 'wrong']) { const v = parseInt0(get(k)); if (v === null) { errors.push(`${COLUMNS.find((c) => c.key === k).title} نامعتبر`); e[k] = 0; } else e[k] = v; }
    e.note = String(get('note') ?? '').trim();
    const dn = parseDone(get('done')); if (dn === null) { errors.push('انجام شد باید بله/خیر باشد'); e.done = true; } else e.done = dn;
    // مدت کل
    if (!e.minutes) {
      const parts = e.study_min + e.review_min + e.test_min;
      if (parts) e.minutes = parts;
      else if (e.start_time && e.end_time) { const m = (t) => +t.slice(0, 2) * 60 + +t.slice(3); let d = m(e.end_time) - m(e.start_time); if (d < 0) d += 1440; e.minutes = d; }
    }
    if (!e.minutes) errors.push('مدت مطالعه مشخص نیست (مدت کل یا خواندن/مرور/تست یا ساعت شروع و پایان)');
    if (e.minutes > 1440) errors.push('مدت بیشتر از ۲۴ ساعت');
    if (e.minutes < 15 && e.minutes > 0 && get('minutes') != null && String(get('minutes')).trim() !== '' && !/[:hسh]/.test(toEn(get('minutes')))) warnings.push(`مدت فقط ${e.minutes} دقیقه است — اگر منظورت ساعت بود، مثل 3:00 بنویس`);
    if (e.correct + e.wrong > e.tests) errors.push('درست + غلط بیشتر از تعداد تست');
    if (e.date) {
      const key = `${e.date}|${e.subject_id}|${e.minutes}|${e.note}`;
      if (existingKeys.has(key)) warnings.push('احتمالاً تکراری: همین آیتم قبلاً در اپ ثبت شده');
      if (seen.has(key)) warnings.push('ردیف تکراری داخل فایل');
      seen.add(key);
    }
    e.errors = errors; e.warnings = warnings; e.ok = errors.length === 0;
    out.push(e);
  }
  if (!out.length) throw new Error('هیچ ردیف پرشده‌ای در فایل نیست');
  return { headerRow: headerRow + 1, columns: Object.keys(map), rows: out, ok: out.filter((x) => x.ok).length, bad: out.filter((x) => !x.ok).length };
}

module.exports = { COLUMNS, buildTemplate, analyze, parseDate, parseTime, parseMinutes, parseDone };
