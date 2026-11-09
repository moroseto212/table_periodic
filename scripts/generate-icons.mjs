/**
 * Membuat ikon PNG PWA tanpa dependensi tambahan.
 * Desain: atom bergaya neon di atas latar gelap, selaras dengan token aplikasi.
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
const ACCENT = [176, 224, 230];
const SUCCESS = [143, 227, 176];
const NOBLE = [217, 201, 255];
const CORE = [244, 244, 247];

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

function renderIcon(size, scale) {
  const pixels = Buffer.alloc(size * size * 4);
  const aa = (2 / size) * 1.15;
  const orbits = [
    { angle: 0, half: 0.026, color: ACCENT },
    { angle: 60, half: 0.024, color: SUCCESS },
    { angle: 120, half: 0.022, color: NOBLE },
  ];

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const index = (py * size + px) * 4;
      const x = ((px + 0.5) / size) * 2 - 1;
      const y = ((py + 0.5) / size) * 2 - 1;

      // Latar + glow lembut di tengah.
      pixels[index] = BG[0];
      pixels[index + 1] = BG[1];
      pixels[index + 2] = BG[2];
      pixels[index + 3] = 255;
      const radial = Math.hypot(x, y) / 1.15;
      blend(pixels, index, ACCENT, (1 - smoothstep(0, 1, radial)) * 0.1);

      const ix = x / scale;
      const iy = y / scale;

      for (const orbit of orbits) {
        const rad = (orbit.angle * Math.PI) / 180;
        const u = ix * Math.cos(rad) + iy * Math.sin(rad);
        const v = -ix * Math.sin(rad) + iy * Math.cos(rad);
        const a = 0.62;
        const b = 0.235;
        const f = (u / a) ** 2 + (v / b) ** 2;
        const gx = (2 * u) / (a * a);
        const gy = (2 * v) / (b * b);
        const gradient = Math.max(Math.hypot(gx, gy), 1e-6);
        const distance = Math.abs(f - 1) / gradient;
        const alpha = 1 - smoothstep(orbit.half - aa, orbit.half + aa, distance);
        blend(pixels, index, orbit.color, alpha * 0.88);
      }

      const d = Math.hypot(ix, iy);
      blend(pixels, index, ACCENT, (1 - smoothstep(0, 0.34, d)) * 0.18);
      blend(pixels, index, CORE, 1 - smoothstep(0.082 - aa * 1.4, 0.082 + aa * 1.4, d));
    }
  }

  return encodePng(size, pixels);
}

const outputs = [
  ['icon-192.png', 192, 0.94],
  ['icon-512.png', 512, 0.94],
  ['icon-maskable-512.png', 512, 0.72],
  ['apple-touch-icon.png', 180, 0.9],
];

mkdirSync(outDir, { recursive: true });
for (const [name, size, scale] of outputs) {
  const file = resolve(outDir, name);
  writeFileSync(file, renderIcon(size, scale));
  console.log(`ikon ${name} (${size}x${size}) -> ${file}`);
}
