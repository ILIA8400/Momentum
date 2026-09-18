const test = require('node:test');
const assert = require('node:assert');
const xlsx = require('../src/xlsx');
const imp = require('../src/importer');
const { open } = require('../src/db');

test('xlsx write/read round trip (inline strings, numbers, persian)', () => {
  const buf = xlsx.write([{ name: 'برنامه', rtl: true, rows: [[{ v: 'تاریخ', bold: true }, 'درس', 'مدت'], ['1405/06/27', 'گسسته', 180], ['۱۴۰۵/۰۶/۲۸', 'مدار', 0.125]] }]);
  assert.strictEqual(buf.readUInt32LE(0), 0x04034b50);
  const rows = xlsx.read(buf);
  assert.deepStrictEqual(rows[0], ['تاریخ', 'درس', 'مدت']);
  assert.deepStrictEqual(rows[1], ['1405/06/27', 'گسسته', 180]);
  assert.strictEqual(rows[2][2], 0.125);
});

test('xlsx read handles sharedStrings + deflate (as Excel saves)', () => {
  // فایل مینیمال با sharedStrings و فشرده‌سازی deflate
  const zlib = require('node:zlib');
  const files = {
    'xl/workbook.xml': '<workbook xmlns:r="x"><sheets><sheet name="S" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/sharedStrings.xml': '<sst><si><t>تاریخ</t></si><si><r><t>در</t></r><r><t>س</t></r></si></sst>',
    'xl/worksheets/sheet1.xml': '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="3"><c r="B3"><v>42</v></c><c r="C3" t="b"><v>1</v></c></row></sheetData></worksheet>',
  };
  // zip با deflate دستی
  const parts = [], central = []; let off = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.from(content), comp = zlib.deflateRawSync(data), n = Buffer.from(name);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(8, 8); lh.writeUInt32LE(xlsx.crc32(data), 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(n.length, 26);
    parts.push(lh, n, comp);
    const cd = Buffer.alloc(46); cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(8, 10); cd.writeUInt32LE(xlsx.crc32(data), 16); cd.writeUInt32LE(comp.length, 20); cd.writeUInt32LE(data.length, 24); cd.writeUInt16LE(n.length, 28); cd.writeUInt32LE(off, 42);
    central.push(cd, n); off += 30 + n.length + comp.length;
  }
  const cdb = Buffer.concat(central), eocd = Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(4, 8); eocd.writeUInt16LE(4, 10); eocd.writeUInt32LE(cdb.length, 12); eocd.writeUInt32LE(off, 16);
  const rows = xlsx.read(Buffer.concat([...parts, cdb, eocd]));
  assert.deepStrictEqual(rows[0], ['تاریخ', 'درس']);
  assert.deepStrictEqual(rows[1], []);
  assert.strictEqual(rows[2][1], 42);
  assert.strictEqual(rows[2][2], 'TRUE');
});

test('value parsers', () => {
  assert.strictEqual(imp.parseDate('۱۴۰۵/۰۶/۲۷'), '1405-06-27');
  assert.strictEqual(imp.parseDate('1405-6-7'), '1405-06-07');
  assert.strictEqual(imp.parseDate('2026-09-18'), '1405-06-27');
  assert.strictEqual(imp.parseDate(46283), '1405-06-27'); // سریال اکسل 2026-09-18
  assert.strictEqual(imp.parseDate('1405/13/01'), null);
  assert.strictEqual(imp.parseTime('8:30'), '08:30');
  assert.strictEqual(imp.parseTime(0.5), '12:00');
  assert.strictEqual(imp.parseTime('25:00'), null);
  assert.strictEqual(imp.parseMinutes('180'), 180);
  assert.strictEqual(imp.parseMinutes('3:00'), 180);
  assert.strictEqual(imp.parseMinutes('۲ ساعت'), 120);
  assert.strictEqual(imp.parseMinutes(0.125), 180);
  assert.strictEqual(imp.parseMinutes('abc'), null);
  assert.strictEqual(imp.parseDone(''), true);
  assert.strictEqual(imp.parseDone('خیر'), false);
  assert.strictEqual(imp.parseDone('maybe'), null);
});

test('template builds and analyze validates rows', () => {
  const db = open(':memory:');
  const subjects = db.listSubjects();
  const tpl = imp.buildTemplate(subjects);
  const rows = xlsx.read(tpl);
  assert.strictEqual(rows[0][0], 'تاریخ');
  assert.strictEqual(rows[0][1], 'درس');

  const filled = xlsx.write([{ name: 'برنامه', rows: [
    imp.COLUMNS.map((c) => c.title),
    ['1405/06/27', 'گسسته', '08:00', '09:40', '', '70', '', '30', '60', '42', '9', 'تست فصل ۳', 'بله'],
    ['۱۴۰۵/۰۶/۲۷', 'مدار', '', '', '3:00', '', '', '', '', '', '', 'فیلم', ''],
    ['1405/06/28', 'درس ناموجود', '', '', '60', '', '', '', '', '', '', '', ''],
    ['1405/06/28', 'هوش', '', '', '', '', '', '', '', '', '', 'بدون مدت', ''],
    ['1405/06/29', 'گسسته', '', '', '60', '', '', '', '10', '8', '5', 'درست+غلط زیاد', 'خیر'],
    ['bad', 'گسسته', '', '', '60', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ] }]);
  const res = imp.analyze(filled, 'x.xlsx', subjects, []);
  assert.strictEqual(res.rows.length, 6);
  assert.strictEqual(res.ok, 2);
  assert.strictEqual(res.bad, 4);
  const [a, b, c, d, e, f] = res.rows;
  assert.deepStrictEqual([a.date, a.subject_name, a.minutes, a.tests, a.done], ['1405-06-27', 'گسسته', 100, 60, true]);
  assert.deepStrictEqual([b.minutes, b.done], [180, true]);
  assert.match(c.errors[0], /وجود ندارد/);
  assert.match(d.errors[0], /مدت/);
  assert.match(e.errors[0], /درست \+ غلط/);
  assert.match(f.errors[0], /تاریخ/);

  // تکراری با دیتای موجود
  const ex = db.addEntry({ date: '1405-06-27', subject_id: b.subject_id, minutes: 180, note: 'فیلم' });
  const res2 = imp.analyze(filled, 'x.xlsx', subjects, db.listEntries('1300-01-01', '1500-01-01'));
  assert.match(res2.rows[1].warnings[0], /تکراری/);
  assert.ok(ex);
});

test('analyze accepts csv and header aliases', () => {
  const csv = '﻿تاریخ,درس,مدت,شرح\n1405-06-27,"زبان",45,"لغت, درس ۵"\n';
  const res = imp.analyze(Buffer.from(csv), 'a.csv', open(':memory:').listSubjects(), []);
  assert.strictEqual(res.ok, 1);
  assert.strictEqual(res.rows[0].note, 'لغت, درس ۵');
  assert.strictEqual(res.rows[0].minutes, 45);
  assert.throws(() => imp.analyze(Buffer.from('a,b\n1,2\n'), 'a.csv', [], []), /سرستون/);
});

test('db.addEntries is transactional', () => {
  const db = open(':memory:');
  assert.throws(() => db.addEntries([{ date: '1405-06-27', subject_id: 1, minutes: 30 }, { date: 'bad', subject_id: 1, minutes: 30 }]));
  assert.strictEqual(db.listEntries('1300-01-01', '1500-01-01').length, 0);
  const ids = db.addEntries([{ date: '1405-06-27', subject_id: 1, minutes: 30 }, { date: '1405-06-28', subject_id: 2, minutes: 45, tests: 10, correct: 7, wrong: 1 }]);
  assert.strictEqual(ids.length, 2);
  assert.strictEqual(db.listEntries('1300-01-01', '1500-01-01').length, 2);
});
