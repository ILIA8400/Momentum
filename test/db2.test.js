const test = require('node:test');
const assert = require('node:assert');
const { open, percentOf, diffMinutes } = require('../src/db');

test('percent with negative marking', () => {
  assert.strictEqual(percentOf(30, 0, 30), 100);
  assert.strictEqual(percentOf(0, 30, 30), -33.3);
  assert.strictEqual(percentOf(20, 6, 30), 60);
  assert.strictEqual(percentOf(0, 0, 30), null);
  assert.strictEqual(percentOf(5, 0, 0), null);
});

test('diffMinutes handles midnight wrap', () => {
  assert.strictEqual(diffMinutes('08:00', '09:30'), 90);
  assert.strictEqual(diffMinutes('23:30', '00:15'), 45);
});

test('minutes derived from breakdown or start/end', () => {
  const db = open(':memory:');
  const a = db.addEntry({ date: '1405-06-27', subject_id: 1, study_min: 40, review_min: 10, test_min: 20 });
  assert.strictEqual(a.minutes, 70);
  const b = db.addEntry({ date: '1405-06-27', subject_id: 1, start_time: '14:00', end_time: '16:30' });
  assert.strictEqual(b.minutes, 150);
  const c = db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 45, start_time: '14:00', end_time: '16:30' });
  assert.strictEqual(c.minutes, 45); // مقدار صریح برنده است
  assert.throws(() => db.addEntry({ date: '1405-06-27', subject_id: 1 }), /مدت/);
  assert.throws(() => db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 10, tests: 10, correct: 8, wrong: 5 }), /درست/);
  const d = db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 10, start_time: 'bad', tests: 20, correct: 15, wrong: 3 });
  assert.strictEqual(d.start_time, '');
  assert.strictEqual(d.percent, 70);
});

test('entries ordered by start_time within a day', () => {
  const db = open(':memory:');
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 10, note: 'no-time' });
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 10, start_time: '15:00', end_time: '15:10', note: 'b' });
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 10, start_time: '09:00', end_time: '09:10', note: 'a' });
  assert.deepStrictEqual(db.listEntries('1405-06-27', '1405-06-27').map((e) => e.note), ['a', 'b', 'no-time']);
});

test('stats percent per subject and overall', () => {
  const db = open(':memory:');
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 60, tests: 20, correct: 20, wrong: 0 });
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 60, tests: 20 }); // بدون درست/غلط → در درصد حساب نمی‌شود
  db.addEntry({ date: '1405-06-28', subject_id: 2, minutes: 60, tests: 10, correct: 5, wrong: 5 });
  const st = db.stats('1405-06-27', '1405-06-28');
  assert.strictEqual(st.bySubject.find((s) => s.id === 1).percent, 100);
  assert.strictEqual(st.bySubject.find((s) => s.id === 2).percent, 33.3);
  assert.strictEqual(st.percent, percentOf(25, 5, 30));
  assert.strictEqual(st.tests, 50);
});

test('day notes and settings', () => {
  const db = open(':memory:');
  assert.strictEqual(db.getNote('1405-06-27'), '');
  db.setNote('1405-06-27', 'امروز خوب بود');
  assert.strictEqual(db.getNote('1405-06-27'), 'امروز خوب بود');
  db.setNote('1405-06-27', '   ');
  assert.strictEqual(db.getNote('1405-06-27'), '');
  assert.strictEqual(db.getSettings().exam_date, '1406-02-16');
  db.setSetting('exam_date', '1406-02-20');
  assert.strictEqual(db.getSettings().exam_date, '1406-02-20');
  assert.throws(() => db.setSetting('exam_date', '1406-13-01'));
  assert.throws(() => db.setSetting('nope', 'x'));
});

test('export v2 round trip includes notes/settings; imports v1 too', () => {
  const db = open(':memory:');
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 45, tests: 10, correct: 7, wrong: 1, start_time: '10:00', end_time: '10:45', study_min: 30, test_min: 15 });
  db.setNote('1405-06-27', 'n');
  db.setSetting('exam_date', '1406-03-01');
  const dump = db.export();
  assert.strictEqual(dump.version, 2);
  const db2 = open(':memory:');
  db2.import(dump);
  assert.deepStrictEqual(db2.export().entries, dump.entries);
  assert.strictEqual(db2.getNote('1405-06-27'), 'n');
  assert.strictEqual(db2.getSettings().exam_date, '1406-03-01');
  // نسخه ۱ (بدون ستون‌های جدید)
  const v1 = { version: 1, subjects: dump.subjects, entries: [{ id: 9, date: '1405-01-01', subject_id: 1, minutes: 30, note: 'old', done: 1 }], goals: [] };
  db2.import(v1);
  const e = db2.getEntry(9);
  assert.strictEqual(e.minutes, 30); assert.strictEqual(e.tests, 0); assert.strictEqual(e.start_time, '');
});

test('csv export', () => {
  const db = open(':memory:');
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 45, note: 'he said "hi"' });
  const csv = db.exportCsv();
  assert.ok(csv.startsWith('﻿'));
  const lines = csv.split('\r\n');
  assert.strictEqual(lines.length, 2);
  assert.ok(lines[1].includes('"he said ""hi"""'));
  assert.ok(lines[1].includes('گسسته'));
});

test('wipeHistory keeps subjects and settings', () => {
  const db = open(':memory:');
  db.addEntry({ date: '1405-06-27', subject_id: 1, minutes: 30 });
  db.setGoal('week', '1405-06-21', 0, 100);
  db.setNote('1405-06-27', 'x');
  db.setSetting('exam_date', '1406-03-01');
  db.wipeHistory();
  assert.strictEqual(db.listEntries('1300-01-01', '1500-01-01').length, 0);
  assert.strictEqual(db.getGoals('week', '1405-06-21').length, 0);
  assert.strictEqual(db.getNote('1405-06-27'), '');
  assert.strictEqual(db.listSubjects().length, 12);
  assert.strictEqual(db.getSettings().exam_date, '1406-03-01');
});
