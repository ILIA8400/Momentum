'use strict';
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const J = require('./jalali');

const DEFAULT_SUBJECTS = [
  ['گسسته', '#f97316'],
  ['نظریه زبان', '#f59e0b'],
  ['مدار', '#84cc16'],
  ['معماری', '#22c55e'],
  ['هوش', '#14b8a6'],
  ['سیستم عامل', '#06b6d4'],
  ['ساختمان داده', '#3b82f6'],
  ['الگوریتم', '#6366f1'],
  ['آمار', '#8b5cf6'],
  ['جبر خطی', '#d946ef'],
  ['زبان', '#ec4899'],
  ['مبانی', '#78716c'],
];

const DEFAULT_SETTINGS = { exam_date: '1406-02-16', exam_title: 'کنکور ارشد کامپیوتر', user_name: '' };

// ستون‌های entries که با migration اضافه می‌شوند (نام → تعریف)
const ENTRY_COLUMNS = {
  tests: 'INTEGER NOT NULL DEFAULT 0',
  start_time: "TEXT NOT NULL DEFAULT ''",
  end_time: "TEXT NOT NULL DEFAULT ''",
  study_min: 'INTEGER NOT NULL DEFAULT 0',
  review_min: 'INTEGER NOT NULL DEFAULT 0',
  test_min: 'INTEGER NOT NULL DEFAULT 0',
  correct: 'INTEGER NOT NULL DEFAULT 0',
  wrong: 'INTEGER NOT NULL DEFAULT 0',
};
const ENTRY_FIELDS = ['date', 'subject_id', 'minutes', 'tests', 'note', 'done', 'start_time', 'end_time', 'study_min', 'review_min', 'test_min', 'correct', 'wrong'];

function open(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      sort INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      minutes INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY,
      period TEXT NOT NULL,
      key TEXT NOT NULL,
      subject_id INTEGER NOT NULL DEFAULT 0,
      minutes INTEGER NOT NULL DEFAULT 0,
      UNIQUE(period, key, subject_id)
    );
    CREATE TABLE IF NOT EXISTS day_notes (
      date TEXT PRIMARY KEY,
      text TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  // مهاجرت ستون‌های جدید entries
  const cols = new Set(db.prepare('PRAGMA table_info(entries)').all().map((c) => c.name));
  for (const [name, def] of Object.entries(ENTRY_COLUMNS)) {
    if (!cols.has(name)) db.exec(`ALTER TABLE entries ADD COLUMN ${name} ${def}`);
  }
  const count = db.prepare('SELECT COUNT(*) AS c FROM subjects').get().c;
  if (count === 0) {
    const ins = db.prepare('INSERT INTO subjects (name, color, sort) VALUES (?, ?, ?)');
    DEFAULT_SUBJECTS.forEach(([name, color], i) => ins.run(name, color, i));
  }
  return wrap(db, file);
}

function wrap(db, file) {
  const q = {
    subjects: db.prepare('SELECT * FROM subjects ORDER BY archived, sort, id'),
    subjectInsert: db.prepare('INSERT INTO subjects (name, color, sort) VALUES (?, ?, (SELECT COALESCE(MAX(sort),0)+1 FROM subjects))'),
    subjectUpdate: db.prepare('UPDATE subjects SET name = ?, color = ?, archived = ? WHERE id = ?'),
    subjectDelete: db.prepare('DELETE FROM subjects WHERE id = ?'),
    subjectEntryCount: db.prepare('SELECT COUNT(*) AS c FROM entries WHERE subject_id = ?'),
    entriesRange: db.prepare(`SELECT e.*, s.name AS subject, s.color FROM entries e JOIN subjects s ON s.id = e.subject_id
                              WHERE e.date >= ? AND e.date <= ?
                              ORDER BY e.date, CASE WHEN e.start_time = '' THEN 1 ELSE 0 END, e.start_time, e.id`),
    entryGet: db.prepare('SELECT e.*, s.name AS subject, s.color FROM entries e JOIN subjects s ON s.id = e.subject_id WHERE e.id = ?'),
    entryInsert: db.prepare(`INSERT INTO entries (${ENTRY_FIELDS.join(', ')}) VALUES (${ENTRY_FIELDS.map(() => '?').join(', ')})`),
    entryUpdate: db.prepare(`UPDATE entries SET ${ENTRY_FIELDS.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`),
    entryDelete: db.prepare('DELETE FROM entries WHERE id = ?'),
    goalsFor: db.prepare('SELECT * FROM goals WHERE period = ? AND key = ?'),
    goalUpsert: db.prepare(`INSERT INTO goals (period, key, subject_id, minutes) VALUES (?, ?, ?, ?)
                            ON CONFLICT(period, key, subject_id) DO UPDATE SET minutes = excluded.minutes`),
    goalDelete: db.prepare('DELETE FROM goals WHERE period = ? AND key = ? AND subject_id = ?'),
    statsBySubject: db.prepare(`SELECT s.id, s.name, s.color, SUM(e.minutes) AS minutes, SUM(e.tests) AS tests,
                                SUM(e.study_min) AS study_min, SUM(e.review_min) AS review_min, SUM(e.test_min) AS test_min,
                                SUM(e.correct) AS correct, SUM(e.wrong) AS wrong,
                                SUM(CASE WHEN e.correct + e.wrong > 0 THEN e.tests ELSE 0 END) AS scored_tests,
                                COUNT(*) AS count, SUM(e.done) AS done
                                FROM entries e JOIN subjects s ON s.id = e.subject_id
                                WHERE e.date >= ? AND e.date <= ? GROUP BY s.id ORDER BY minutes DESC`),
    statsByDay: db.prepare(`SELECT date, SUM(minutes) AS minutes, SUM(tests) AS tests, SUM(correct) AS correct, SUM(wrong) AS wrong,
                            SUM(CASE WHEN correct + wrong > 0 THEN tests ELSE 0 END) AS scored_tests,
                            COUNT(*) AS count, SUM(done) AS done
                            FROM entries WHERE date >= ? AND date <= ? GROUP BY date ORDER BY date`),
    allDays: db.prepare('SELECT date, SUM(minutes) AS minutes, SUM(tests) AS tests FROM entries GROUP BY date ORDER BY date'),
    noteGet: db.prepare('SELECT * FROM day_notes WHERE date = ?'),
    noteSet: db.prepare(`INSERT INTO day_notes (date, text, updated_at) VALUES (?, ?, datetime('now'))
                         ON CONFLICT(date) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at`),
    noteDelete: db.prepare('DELETE FROM day_notes WHERE date = ?'),
    notesRange: db.prepare('SELECT * FROM day_notes WHERE date >= ? AND date <= ? ORDER BY date'),
    settingsAll: db.prepare('SELECT * FROM settings'),
    settingSet: db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'),
  };

  const api = {
    file,
    raw: db,
    close: () => db.close(),

    listSubjects: () => q.subjects.all(),
    addSubject(name, color = '#3b82f6') {
      name = String(name || '').trim();
      if (!name) throw new Error('نام درس خالی است');
      const r = q.subjectInsert.run(name, color);
      return Number(r.lastInsertRowid);
    },
    updateSubject(id, { name, color, archived = 0 }) {
      q.subjectUpdate.run(String(name).trim(), color, archived ? 1 : 0, id);
    },
    deleteSubject(id) {
      if (q.subjectEntryCount.get(id).c > 0) throw new Error('این درس آیتم ثبت‌شده دارد؛ به جای حذف، بایگانی کن');
      q.subjectDelete.run(id);
    },

    listEntries: (from, to) => q.entriesRange.all(from, to).map(rowEntry),
    getEntry: (id) => { const r = q.entryGet.get(id); return r ? rowEntry(r) : null; },
    addEntry(e) {
      const v = normalizeEntry(e);
      const r = q.entryInsert.run(...ENTRY_FIELDS.map((f) => v[f]));
      return api.getEntry(Number(r.lastInsertRowid));
    },
    updateEntry(id, e) {
      const v = normalizeEntry(e);
      q.entryUpdate.run(...ENTRY_FIELDS.map((f) => v[f]), id);
      return api.getEntry(id);
    },
    deleteEntry: (id) => q.entryDelete.run(id),

    getGoals: (period, key) => q.goalsFor.all(period, key),
    setGoal(period, key, subject_id, minutes) {
      subject_id = subject_id | 0; // ۰ = هدف کلی
      if (!minutes) q.goalDelete.run(period, key, subject_id);
      else q.goalUpsert.run(period, key, subject_id, minutes | 0);
    },

    getNote: (date) => q.noteGet.get(date)?.text || '',
    setNote(date, text) {
      text = String(text || '');
      if (!text.trim()) q.noteDelete.run(date); else q.noteSet.run(date, text);
    },
    listNotes: (from, to) => q.notesRange.all(from, to),

    getSettings() {
      const out = { ...DEFAULT_SETTINGS };
      for (const r of q.settingsAll.all()) out[r.key] = r.value;
      return out;
    },
    setSetting(key, value) {
      if (!(key in DEFAULT_SETTINGS)) throw new Error('تنظیم ناشناخته');
      if (key === 'exam_date' && !J.parse(value)) throw new Error('تاریخ نامعتبر');
      q.settingSet.run(key, String(value));
    },

    stats(from, to) {
      const bySubject = q.statsBySubject.all(from, to).map(withPercent);
      const byDay = q.statsByDay.all(from, to).map(withPercent);
      const sum = (k) => byDay.reduce((s, d) => s + d[k], 0);
      const agg = withPercent({ correct: sum('correct'), wrong: sum('wrong'), scored_tests: sum('scored_tests') });
      return { from, to, total: sum('minutes'), tests: sum('tests'), count: sum('count'), done: sum('done'), percent: agg.percent, bySubject, byDay };
    },

    // رکوردها روی کل تاریخچه
    records() {
      const days = q.allDays.all();
      const best = (key) => days.reduce((b, d) => (d[key] > (b?.[key] || 0) ? d : b), null);
      const weeks = {};
      for (const d of days) {
        const k = J.weekStart(d.date);
        (weeks[k] ||= { key: k, minutes: 0, tests: 0 });
        weeks[k].minutes += d.minutes; weeks[k].tests += d.tests;
      }
      const wl = Object.values(weeks);
      const bestWeek = (key) => wl.reduce((b, w) => (w[key] > (b?.[key] || 0) ? w : b), null);
      let longest = 0, cur = 0, prev = null;
      for (const d of days) {
        if (!d.minutes) { prev = null; cur = 0; continue; }
        cur = prev && J.addDays(prev, 1) === d.date ? cur + 1 : 1;
        longest = Math.max(longest, cur); prev = d.date;
      }
      let current = 0;
      const set = new Set(days.filter((d) => d.minutes).map((d) => d.date));
      let t = J.todayJalali();
      if (!set.has(t)) t = J.addDays(t, -1);
      while (set.has(t)) { current++; t = J.addDays(t, -1); }
      return { bestDay: best('minutes'), bestTestDay: best('tests'), bestWeek: bestWeek('minutes'), bestTestWeek: bestWeek('tests'), longestStreak: longest, currentStreak: current, totalDays: days.filter((d) => d.minutes).length, firstDay: days[0]?.date || null };
    },

    export() {
      return {
        version: 2,
        exported_at: new Date().toISOString(),
        exported_jalali: J.todayJalali(),
        subjects: db.prepare('SELECT * FROM subjects').all(),
        entries: db.prepare('SELECT * FROM entries ORDER BY date, id').all(),
        goals: db.prepare('SELECT * FROM goals').all(),
        day_notes: db.prepare('SELECT * FROM day_notes ORDER BY date').all(),
        settings: db.prepare('SELECT * FROM settings').all(),
      };
    },
    import(data) {
      if (!data || ![1, 2].includes(data.version) || !Array.isArray(data.subjects) || !Array.isArray(data.entries)) {
        throw new Error('فایل بکاپ معتبر نیست');
      }
      db.exec('BEGIN');
      try {
        db.exec('DELETE FROM goals; DELETE FROM entries; DELETE FROM subjects; DELETE FROM day_notes; DELETE FROM settings;');
        const s = db.prepare('INSERT INTO subjects (id, name, color, sort, archived) VALUES (?, ?, ?, ?, ?)');
        for (const x of data.subjects) s.run(x.id, x.name, x.color, x.sort ?? 0, x.archived ?? 0);
        const e = db.prepare(`INSERT INTO entries (id, created_at, ${ENTRY_FIELDS.join(', ')}) VALUES (?, ?, ${ENTRY_FIELDS.map(() => '?').join(', ')})`);
        for (const x of data.entries) {
          const v = normalizeEntry(x, true);
          e.run(x.id, x.created_at ?? new Date().toISOString(), ...ENTRY_FIELDS.map((f) => v[f]));
        }
        const g = db.prepare('INSERT INTO goals (id, period, key, subject_id, minutes) VALUES (?, ?, ?, ?, ?)');
        for (const x of data.goals || []) g.run(x.id, x.period, x.key, x.subject_id | 0, x.minutes);
        const n = db.prepare('INSERT INTO day_notes (date, text, updated_at) VALUES (?, ?, ?)');
        for (const x of data.day_notes || []) n.run(x.date, x.text ?? '', x.updated_at ?? new Date().toISOString());
        const st = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
        for (const x of data.settings || []) st.run(x.key, x.value);
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    // افزودن دسته‌ای (ورود از اکسل) در یک تراکنش؛ اگر یکی خراب باشد هیچ‌کدام اضافه نمی‌شود
    addEntries(list) {
      const vals = list.map((e) => normalizeEntry(e));
      db.exec('BEGIN');
      try {
        const ids = vals.map((v) => Number(q.entryInsert.run(...ENTRY_FIELDS.map((f) => v[f])).lastInsertRowid));
        db.exec('COMMIT');
        return ids;
      } catch (err) { db.exec('ROLLBACK'); throw err; }
    },

    // پاک کردن کل تاریخچه (آیتم‌ها، هدف‌ها، یادداشت‌ها) — درس‌ها و تنظیمات می‌مانند
    wipeHistory() {
      db.exec('BEGIN');
      try {
        db.exec('DELETE FROM entries; DELETE FROM goals; DELETE FROM day_notes;');
        db.exec('COMMIT');
      } catch (err) { db.exec('ROLLBACK'); throw err; }
    },

    // خروجی CSV همه آیتم‌ها (برای اکسل)
    exportCsv() {
      const rows = api.listEntries('0000-00-00', '9999-99-99');
      const head = ['تاریخ', 'روز هفته', 'درس', 'شروع', 'پایان', 'مدت کل (دقیقه)', 'خواندن', 'مرور', 'تست (دقیقه)', 'تعداد تست', 'درست', 'غلط', 'درصد', 'انجام شد', 'شرح'];
      const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const lines = [head.map(cell).join(',')];
      for (const e of rows) {
        lines.push([e.date, J.WEEKDAYS[J.weekday(e.date)], e.subject, e.start_time, e.end_time, e.minutes, e.study_min, e.review_min, e.test_min,
          e.tests, e.correct, e.wrong, e.percent ?? '', e.done ? 'بله' : 'خیر', e.note].map(cell).join(','));
      }
      return '﻿' + lines.join('\r\n');
    },
  };
  return api;
}

// درصد کنکوری با نمره منفی: (۳×درست − غلط) / (۳×کل)
function percentOf(correct, wrong, total) {
  if (!total || correct + wrong === 0) return null;
  return Math.round(((3 * correct - wrong) / (3 * total)) * 1000) / 10;
}
function withPercent(r) { r.percent = percentOf(r.correct, r.wrong, r.scored_tests ?? r.tests); return r; }
function rowEntry(r) { return { ...r, done: !!r.done, percent: percentOf(r.correct, r.wrong, r.tests) }; }

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
function normalizeEntry(e, lenient = false) {
  const int = (v) => Math.max(0, Number.parseInt(v, 10) || 0);
  const v = {
    date: e.date, subject_id: int(e.subject_id), note: String(e.note || ''), done: e.done ? 1 : 0,
    start_time: TIME_RE.test(e.start_time || '') ? e.start_time : '',
    end_time: TIME_RE.test(e.end_time || '') ? e.end_time : '',
    study_min: int(e.study_min), review_min: int(e.review_min), test_min: int(e.test_min),
    tests: int(e.tests), correct: int(e.correct), wrong: int(e.wrong),
  };
  v.minutes = int(e.minutes);
  if (!v.minutes) {
    const parts = v.study_min + v.review_min + v.test_min;
    if (parts) v.minutes = parts;
    else if (v.start_time && v.end_time) v.minutes = diffMinutes(v.start_time, v.end_time);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date || '')) throw new Error('تاریخ نامعتبر است');
  if (!v.subject_id) throw new Error('درس انتخاب نشده');
  if (!lenient && v.minutes <= 0) throw new Error('مدت مطالعه را وارد کن');
  if (v.minutes > 24 * 60) throw new Error('مدت زمان نامعتبر است');
  if (v.correct + v.wrong > v.tests) throw new Error('درست + غلط نمی‌تواند از تعداد کل تست بیشتر باشد');
  return v;
}
function diffMinutes(a, b) {
  const m = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
  let d = m(b) - m(a);
  if (d < 0) d += 24 * 60; // عبور از نیمه‌شب
  return d;
}

module.exports = { open, DEFAULT_SUBJECTS, DEFAULT_SETTINGS, percentOf, diffMinutes };
