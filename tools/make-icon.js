'use strict';
// ساخت آیکون Momentum (⚡ روی مربع گرد با گرادیان آبی→بنفش) بدون هیچ وابستگی:
// PNG را دستی می‌سازیم و در یک فایل .ico (با ورودی‌های PNG) می‌گذاریم.
// اجرا: node tools/make-icon.js  →  momentum.ico و public/favicon.ico
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { crc32 } = require('../src/xlsx');

function png(width, height, rgba) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (width * 4 + 1)] = 0; rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4); }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// نقطه داخل چندضلعی؟ (ray casting)
function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inRoundRect(x, y, s, r) {
  if (x < 0 || y < 0 || x > s || y > s) return false;
  const cx = Math.min(Math.max(x, r), s - r), cy = Math.min(Math.max(y, r), s - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}
const lerp = (a, b, t) => a + (b - a) * t;

function render(size) {
  const SS = 4; // supersampling
  const out = Buffer.alloc(size * size * 4);
  const bolt = [[0.56, 0.12], [0.30, 0.55], [0.47, 0.55], [0.40, 0.90], [0.70, 0.43], [0.53, 0.43], [0.62, 0.12]].map(([x, y]) => [x * size, y * size]);
  const inset = size * 0.04, s = size - inset * 2, r = size * 0.22;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let R = 0, G = 0, B = 0, A = 0, n = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS;
      n++;
      if (!inRoundRect(px - inset, py - inset, s, r)) continue;
      const t = (px + py) / (2 * size); // گرادیان قطری
      let cr = lerp(59, 139, t), cg = lerp(130, 92, t), cb = lerp(246, 246, t); // #3b82f6 → #8b5cf6
      if (inPoly(px, py, bolt)) { cr = 255; cg = 255; cb = 255; }
      R += cr; G += cg; B += cb; A += 255;
    }
    const i = (y * size + x) * 4;
    const cov = A / (n * 255);
    out[i] = cov ? Math.round(R / (A / 255)) : 0; out[i + 1] = cov ? Math.round(G / (A / 255)) : 0; out[i + 2] = cov ? Math.round(B / (A / 255)) : 0; out[i + 3] = Math.round(A / n);
  }
  return png(size, size, out);
}

function ico(sizes) {
  const images = sizes.map((s) => ({ s, data: render(s) }));
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  const dir = []; let offset = 6 + 16 * images.length;
  for (const im of images) {
    const e = Buffer.alloc(16);
    e[0] = im.s >= 256 ? 0 : im.s; e[1] = im.s >= 256 ? 0 : im.s; e[2] = 0; e[3] = 0;
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(im.data.length, 8); e.writeUInt32LE(offset, 12);
    dir.push(e); offset += im.data.length;
  }
  return Buffer.concat([header, ...dir, ...images.map((i) => i.data)]);
}

const root = path.join(__dirname, '..');
const buf = ico([256, 64, 48, 32, 16]);
fs.writeFileSync(path.join(root, 'momentum.ico'), buf);
fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), buf);
fs.writeFileSync(path.join(root, 'public', 'icon-256.png'), render(256));
console.log('✔ momentum.ico, public/favicon.ico, public/icon-256.png');
