const test = require('node:test');
const assert = require('node:assert');
const J = require('../src/jalali');

test('known conversions', () => {
  assert.deepStrictEqual(J.toJalali(2025, 3, 21), { jy: 1404, jm: 1, jd: 1 });
  assert.deepStrictEqual(J.toGregorian(1404, 1, 1), { gy: 2025, gm: 3, gd: 21 });
  assert.deepStrictEqual(J.toJalali(2026, 9, 18), { jy: 1405, jm: 6, jd: 27 });
  assert.deepStrictEqual(J.toGregorian(1405, 6, 27), { gy: 2026, gm: 9, gd: 18 });
});

test('matches Intl persian calendar across a range', () => {
  const fmt = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' });
  for (let i = 0; i < 2000; i += 7) {
    const d = new Date(Date.UTC(2020, 0, 1 + i));
    const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
    const j = J.toJalali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    assert.deepStrictEqual(j, { jy: +parts.year, jm: +parts.month, jd: +parts.day }, d.toISOString());
  }
});

test('addDays / weekday / weekStart', () => {
  assert.strictEqual(J.addDays('1404-01-01', 1), '1404-01-02');
  assert.strictEqual(J.addDays('1403-12-30', 1), '1404-01-01');
  assert.strictEqual(J.weekday('1405-06-27'), 6);
});

test('week starts on Saturday', () => {
  // 2026-09-19 is Saturday = 1405-06-28
  assert.strictEqual(J.weekday('1405-06-28'), 0);
  assert.strictEqual(J.weekStart('1405-06-27'), '1405-06-21');
  assert.strictEqual(J.weekStart('1405-06-28'), '1405-06-28');
});

test('parse validation', () => {
  assert.strictEqual(J.parse('1404-13-01'), null);
  assert.strictEqual(J.parse('1404-12-31'), null);
  assert.ok(J.parse('1403-12-30'));
  assert.strictEqual(J.jalaliMonthLength(1403, 12), 30);
  assert.strictEqual(J.jalaliMonthLength(1404, 12), 29);
});
