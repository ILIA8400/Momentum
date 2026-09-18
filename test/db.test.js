const test = require('node:test');
const assert = require('node:assert');
const { open, DEFAULT_SUBJECTS } = require('../src/db');

test('seeds default subjects once', () => {
  const db = open(':memory:');
  const subs = db.listSubjects();
  assert.strictEqual(subs.length, DEFAULT_SUBJECTS.length);
  assert.strictEqual(subs[0].name, 'گسسته');
  assert.strictEqual(subs[11].name, 'مبانی');
  assert.ok(!subs.find((s) => s.name === 'پایپلاین'));
});

test('entries CRUD and stats', () => {
  const db = open(':memory:');
  const subs = db.listSubjects();
  const a = db.addEntry({ date: '1405-06-27', subject_id: subs[0].id, minutes: 90, tests: 20, note: 'جلسه ۳', done: true });
  db.addEntry({ date: '1405-06-27', subject_id: subs[1].id, minutes: 30, note: '', done: false });
  db.addEntry({ date: '1405-06-28', subject_id: subs[0].id, minutes: 60, note: 'جلسه ۴', done: false });
  assert.strictEqual(a.subject, 'گسسته');
  assert.strictEqual(a.done, true);

  const day = db.listEntries('1405-06-27', '1405-06-27');
  assert.strictEqual(day.length, 2);

  const st = db.stats('1405-06-21', '1405-06-28');
  assert.strictEqual(st.total, 180);
  assert.strictEqual(st.count, 3);
  assert.strictEqual(st.done, 1);
  assert.strictEqual(st.bySubject[0].name, 'گسسته');
  assert.strictEqual(st.bySubject[0].minutes, 150);
  assert.strictEqual(st.byDay.length, 2);
  assert.strictEqual(st.tests, 20);
  assert.strictEqual(a.tests, 20);

  db.updateEntry(a.id, { date: '1405-06-27', subject_id: subs[0].id, minutes: 120, note: 'x', done: false });
  assert.strictEqual(db.getEntry(a.id).minutes, 120);
  db.deleteEntry(a.id);
  assert.strictEqual(db.getEntry(a.id), null);
});

test('entry validation', () => {
  const db = open(':memory:');
  assert.throws(() => db.addEntry({ date: 'bad', subject_id: 1, minutes: 10 }));
  assert.throws(() => db.addEntry({ date: '1405-06-27', subject_id: 0, minutes: 10 }));
});

test('subjects add/archive/delete guard', () => {
  const db = open(':memory:');
  const id = db.addSubject('درس جدید', '#000');
  assert.ok(db.listSubjects().find(s => s.id === id));
  db.addEntry({ date: '1405-06-27', subject_id: id, minutes: 10 });
  assert.throws(() => db.deleteSubject(id));
  db.updateSubject(id, { name: 'درس جدید', color: '#000', archived: 1 });
  assert.strictEqual(db.listSubjects().find(s => s.id === id).archived, 1);
  assert.throws(() => db.addSubject('   '));
});

test('goals upsert and delete on zero', () => {
  const db = open(':memory:');
  db.setGoal('week', '1405-06-28', null, 600);
  db.setGoal('week', '1405-06-28', 1, 120);
  db.setGoal('week', '1405-06-28', null, 700);
  const g = db.getGoals('week', '1405-06-28');
  assert.strictEqual(g.length, 2);
  assert.strictEqual(g.find(x => x.subject_id === 0).minutes, 700);
  db.setGoal('week', '1405-06-28', null, 0);
  assert.strictEqual(db.getGoals('week', '1405-06-28').length, 1);
});

test('export / import round trip', () => {
  const db = open(':memory:');
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 45, note: 'n' });
  db.setGoal('month', '1405-06', null, 3000);
  const dump = db.export();
  const db2 = open(':memory:');
  db2.addEntry({ date: '1405-01-01', subject_id: 2, minutes: 5 });
  db2.import(dump);
  assert.deepStrictEqual(db2.export().entries, dump.entries);
  assert.deepStrictEqual(db2.export().goals, dump.goals);
  assert.throws(() => db2.import({ version: 9 }));
});

test('records: best day/week and streaks', () => {
  const db = open(':memory:');
  const J = require('../src/jalali');
  const t = J.todayJalali();
  db.addEntry({ date: J.addDays(t, -2), subject_id: 1, minutes: 60, tests: 10 });
  db.addEntry({ date: J.addDays(t, -1), subject_id: 1, minutes: 200, tests: 5 });
  db.addEntry({ date: t, subject_id: 2, minutes: 30, tests: 50 });
  db.addEntry({ date: J.addDays(t, -10), subject_id: 2, minutes: 90, tests: 0 });
  const r = db.records();
  assert.strictEqual(r.bestDay.date, J.addDays(t, -1));
  assert.strictEqual(r.bestDay.minutes, 200);
  assert.strictEqual(r.bestTestDay.tests, 50);
  assert.strictEqual(r.currentStreak, 3);
  assert.strictEqual(r.longestStreak, 3);
  assert.strictEqual(r.totalDays, 4);
  assert.ok(r.bestWeek.minutes >= 230);
});

test('migration adds tests column to old db', () => {
  const { DatabaseSync } = require('node:sqlite');
  const os = require('node:os'), path = require('node:path'), fs = require('node:fs');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'plan-')), 'old.db');
  const raw = new DatabaseSync(file);
  raw.exec("CREATE TABLE subjects (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, color TEXT NOT NULL DEFAULT '#3b82f6', sort INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0); INSERT INTO subjects (name) VALUES ('x'); CREATE TABLE entries (id INTEGER PRIMARY KEY, date TEXT NOT NULL, subject_id INTEGER NOT NULL, minutes INTEGER NOT NULL DEFAULT 0, note TEXT NOT NULL DEFAULT '', done INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now'))); INSERT INTO entries (date, subject_id, minutes) VALUES ('1405-01-01', 1, 30);");
  raw.close();
  const db = open(file);
  assert.strictEqual(db.listEntries('1405-01-01', '1405-01-01')[0].tests, 0);
  db.close();
});
