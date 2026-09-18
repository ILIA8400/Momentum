'use strict';
// خواندن و نوشتن حداقلی فایل xlsx بدون وابستگی خارجی (zip + XML ساده)
const zlib = require('node:zlib');

// ---------- CRC32 ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ---------- ZIP (فقط store) ----------
function zipWrite(files) {
  const parts = [], central = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBuf = Buffer.from(name, 'utf8');
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10); local.writeUInt16LE(0x21, 12); local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    parts.push(local, nameBuf, data);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(0x800, 8); cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0x21, 14); cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(data.length, 20); cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28); cd.writeUInt16LE(0, 30); cd.writeUInt16LE(0, 32); cd.writeUInt16LE(0, 34); cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38); cd.writeUInt32LE(offset, 42);
    central.push(cd, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  }
  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(central.length / 2, 8); eocd.writeUInt16LE(central.length / 2, 10);
  eocd.writeUInt32LE(cdBuf.length, 12); eocd.writeUInt32LE(offset, 16); eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, cdBuf, eocd]);
}

function zipRead(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) { if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error('فایل zip/xlsx معتبر نیست');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('ساختار zip خراب است');
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    const lnlen = buf.readUInt16LE(lho + 26), lelen = buf.readUInt16LE(lho + 28);
    const start = lho + 30 + lnlen + lelen;
    const raw = buf.subarray(start, start + csize);
    files[name] = method === 8 ? zlib.inflateRawSync(raw) : method === 0 ? Buffer.from(raw) : (() => { throw new Error('روش فشرده‌سازی پشتیبانی نمی‌شود'); })();
    p += 46 + nlen + elen + clen;
  }
  return files;
}

// ---------- XML helpers ----------
const xmlEsc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const xmlUnesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, '&');
const colLetter = (i) => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = (i - m - 1) / 26; } return s; };
const colIndex = (ref) => { const m = /^([A-Z]+)/.exec(ref); let n = 0; for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };

// ---------- نوشتن ----------
// sheets: [{ name, rows: [[cell,...],...], cols?: [width,...], validations?: [{ sqref, formula }], rtl?: true }]
// cell: string | number | { v, bold?: true } | null
function write(sheets) {
  const files = {};
  files['[Content_Types].xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
  files['_rels/.rels'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  files['xl/workbook.xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`;
  files['xl/_rels/workbook.xml.rels'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  // استایل ۰: معمولی، ۱: بولد با پس‌زمینه، ۲: متن (برای تاریخ که اکسل دست نزند)
  files['xl/styles.xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF1E40AF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDBEAFE"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  sheets.forEach((sh, i) => {
    const rowsXml = sh.rows.map((row, r) => {
      const cells = row.map((cell, c) => {
        if (cell == null || cell === '') return '';
        const ref = `${colLetter(c)}${r + 1}`;
        const o = typeof cell === 'object' ? cell : { v: cell };
        const style = o.bold ? 1 : o.text ? 2 : 0;
        if (o.v == null || o.v === '') return style ? `<c r="${ref}" s="${style}"/>` : '';
        if (typeof o.v === 'number') return `<c r="${ref}" s="${style}"><v>${o.v}</v></c>`;
        return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xmlEsc(o.v)}</t></is></c>`;
      }).join('');
      return `<row r="${r + 1}">${cells}</row>`;
    }).join('');
    const cols = sh.cols ? `<cols>${sh.cols.map((w, c) => `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
    const dv = sh.validations?.length ? `<dataValidations count="${sh.validations.length}">${sh.validations.map((v) => `<dataValidation type="list" allowBlank="1" showErrorMessage="1" errorTitle="نامعتبر" error="${xmlEsc(v.error || 'مقدار از لیست انتخاب شود')}" sqref="${v.sqref}"><formula1>${xmlEsc(v.formula)}</formula1></dataValidation>`).join('')}</dataValidations>` : '';
    files[`xl/worksheets/sheet${i + 1}.xml`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView ${sh.rtl ? 'rightToLeft="1" ' : ''}workbookViewId="0"${sh.freeze ? '><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView>' : '/>'}</sheetViews>${cols}<sheetData>${rowsXml}</sheetData>${dv}</worksheet>`;
  });
  return zipWrite(files);
}

// ---------- خواندن ----------
// خروجی: آرایه‌ای از ردیف‌ها؛ هر ردیف آرایه‌ای از مقادیر (string | number | null)
function read(buf) {
  const files = zipRead(buf);
  const get = (n) => files[n] ? files[n].toString('utf8') : null;
  const wb = get('xl/workbook.xml');
  if (!wb) throw new Error('فایل xlsx نیست (workbook پیدا نشد)');
  // اولین شیت
  const first = /<sheet [^>]*r:id="([^"]+)"/.exec(wb) || /<sheet [^>]*id="([^"]+)"/.exec(wb);
  const rels = get('xl/_rels/workbook.xml.rels') || '';
  let target = 'worksheets/sheet1.xml';
  if (first) { const m = new RegExp(`<Relationship [^>]*Id="${first[1]}"[^>]*Target="([^"]+)"`).exec(rels) || new RegExp(`<Relationship [^>]*Target="([^"]+)"[^>]*Id="${first[1]}"`).exec(rels); if (m) target = m[1]; }
  target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
  const sheet = get('xl/' + target) || get(target);
  if (!sheet) throw new Error('شیت اول پیدا نشد');
  const shared = [];
  const ss = get('xl/sharedStrings.xml');
  if (ss) for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) shared.push([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlUnesc(t[1])).join(''));
  const rows = [];
  for (const rm of sheet.matchAll(/<row [^>]*?r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const r = +rm[1] - 1;
    const row = [];
    for (const cm of rm[2].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cm[1], inner = cm[2] || '';
      const ref = /r="([A-Z]+)\d+"/.exec(attrs)?.[1];
      if (!ref) continue;
      const type = /t="([^"]+)"/.exec(attrs)?.[1];
      let v = null;
      if (type === 'inlineStr') v = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlUnesc(t[1])).join('');
      else {
        const raw = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1];
        if (raw == null) v = null;
        else if (type === 's') v = shared[+raw] ?? '';
        else if (type === 'str') v = xmlUnesc(raw);
        else if (type === 'b') v = raw === '1' ? 'TRUE' : 'FALSE';
        else v = Number(raw);
      }
      row[colIndex(ref)] = v;
    }
    rows[r] = row;
  }
  for (let i = 0; i < rows.length; i++) if (!rows[i]) rows[i] = [];
  return rows;
}

// CSV ساده (با پشتیبانی از "..." و BOM)
function readCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',' || ch === ';' || ch === '\t') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

module.exports = { write, read, readCsv, zipWrite, zipRead, crc32 };
