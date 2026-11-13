/**
 * Membuat ikon PNG PWA tanpa dependensi tambahan.
 * Desain: dua kartu unsur bertumpuk (tabel periodik) dengan satu kartu terangkat
 * berisi huruf P dan pita aksen, di atas latar gelap yang selaras dengan token
 * aplikasi. Bukan orbit atom agar berbeda dari ikon sains generik.
 *
 * Jalankan: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/icons');

const BG = [15, 16, 22];
const CARD = [23, 27, 38];
const ACCENT = [169, 220, 232];
const NOBLE = [217, 201, 255];
const INK = [244, 244, 247];

// Geometri dalam ruang 64x64 agar sama persis dengan public/favicon.svg dan
// komponen BrandMark di header.
const FRONT = { cx: 38.5, cy: 36, hw: 15.5, hh: 17, r: 9, angle: 0 };
const BACK = { cx: 30.5, cy: 28, hw: 13, hh: 15, r: 8, angle: -8 };
const BAR_H = 4.6;
const P = { stemX: 36.7, top: 28, bottom: 47.5, thickness: 4.2, bowlR: 5.6, bowlCy: 35.6 };

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const offset = y * (stride + 1);
    raw[offset] = 0; // filter: none
    pixels.copy(raw, offset + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function blend(pixel, index, color, alpha) {
  const a = clamp01(alpha);
  if (a <= 0) return;
  pixel[index] = Math.round(color[0] * a + pixel[index] * (1 - a));
  pixel[index + 1] = Math.round(color[1] * a + pixel[index + 1] * (1 - a));
  pixel[index + 2] = Math.round(color[2] * a + pixel[index + 2] * (1 - a));
  pixel[index + 3] = 255;
}

/** Jarak bertanda ke persegi membulat (negatif di dalam), dengan rotasi. */
function sdRoundRect(x, y, shape) {
  const rad = (-shape.angle * Math.PI) / 180;
  const dx = x - shape.cx;
  const dy = y - shape.cy;
  const px = dx * Math.cos(rad) - dy * Math.sin(rad);
  const py = dx * Math.sin(rad) + dy * Math.cos(rad);
  const qx = Math.abs(px) - shape.hw + shape.r;
  const qy = Math.abs(py) - shape.hh + shape.r;
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - shape.r
  );
}

const fillAlpha = (d, aa) => 1 - smoothstep(-aa, aa, d);
const strokeAlpha = (d, halfWidth, aa) => 1 - smoothstep(halfWidth - aa, halfWidth + aa, Math.abs(d));

function renderIcon(size, { scale = 1, square = false, border = true } = {}) {
  const pixels = Buffer.alloc(size * size * 4);
  const aa = (1.1 * 64) / size;
  const bgShape = { cx: 32, cy: 32, hw: 32, hh: 32, r: square ? 0 : 14, angle: 0 };
  const borderShape = { cx: 32, cy: 32, hw: 30.6, hh: 30.6, r: 12.4, angle: 0 };
  const barBottom = FRONT.cy - FRONT.hh + BAR_H;
  const stemHalf = P.thickness / 2;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const index = (py * size + px) * 4;
      const rawX = ((px + 0.5) / size) * 64;
      const rawY = ((py + 0.5) / size) * 64;
      // Skala konten di sekitar pusat untuk varian maskable.
      const x = (rawX - 32) / scale + 32;
      const y = (rawY - 32) / scale + 32;

      // Latar penuh (tidak ikut diskalakan agar maskable tetap menutup tepi).
      pixels[index] = BG[0];
      pixels[index + 1] = BG[1];
      pixels[index + 2] = BG[2];
      pixels[index + 3] = 255;

      const dBg = sdRoundRect(rawX, rawY, bgShape);
      if (dBg > 0) {
        pixels[index + 3] = Math.round(255 * (1 - smoothstep(0, aa, dBg)));
        if (pixels[index + 3] === 0) continue;
      }

      if (border) {
        blend(
          pixels,
          index,
          [255, 255, 255],
          strokeAlpha(sdRoundRect(rawX, rawY, borderShape), 0.6, aa) * 0.06,
        );
      }

      const dBack = sdRoundRect(x, y, BACK);
      blend(pixels, index, NOBLE, fillAlpha(dBack, aa) * 0.09);
      blend(pixels, index, NOBLE, strokeAlpha(dBack, 1, aa) * 0.85);

      const dFront = sdRoundRect(x, y, FRONT);
      blend(pixels, index, CARD, fillAlpha(dFront, aa));

      // Pita aksen di tepi atas kartu, mengikuti lengkung sudut kartu.
      const dBar = Math.max(dFront, y - barBottom);
      blend(pixels, index, ACCENT, fillAlpha(dBar, aa));

      blend(pixels, index, ACCENT, strokeAlpha(dFront, 1, aa) * 0.95);

      // Huruf P: batang + mangkuk setengah lingkaran di kanan.
      const stem = sdRoundRect(x, y, {
        cx: P.stemX,
        cy: (P.top + P.bottom) / 2,
        hw: stemHalf,
        hh: (P.bottom - P.top) / 2,
        r: stemHalf,
        angle: 0,
      });
      const bowl = Math.max(
        Math.abs(Math.hypot(x - P.stemX, y - P.bowlCy) - P.bowlR) - stemHalf,
        P.stemX - x,
      );
      blend(pixels, index, INK, Math.max(fillAlpha(stem, aa), fillAlpha(bowl, aa)));
    }
  }

  return encodePng(size, pixels);
}

const outputs = [
  ['icon-192.png', 192, { scale: 1 }],
  ['icon-512.png', 512, { scale: 1 }],
  ['icon-maskable-512.png', 512, { scale: 0.72, square: true, border: false }],
  ['apple-touch-icon.png', 180, { scale: 1, square: true, border: false }],
];

mkdirSync(outDir, { recursive: true });
for (const [name, size, options] of outputs) {
  const file = resolve(outDir, name);
  writeFileSync(file, renderIcon(size, options));
  console.log(`ikon ${name} (${size}x${size}) -> ${file}`);
}
