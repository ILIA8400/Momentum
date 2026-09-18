const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { open } = require('../src/db');
const backup = require('../src/backup');

test('two backups in the same second do not collide', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plan-bk-'));
  const db = open(path.join(dir, 'data', 'x.db'));
  const a = backup.backupNow(db, dir, 'a');
  const b = backup.backupNow(db, dir, 'a');
  assert.notStrictEqual(a, b);
  assert.strictEqual(backup.list(dir).length, 2);
  db.close();
});
