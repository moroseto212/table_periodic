/**
 * Gagal jika total JS awal (entry + modulepreload) melewati budget 450 KB gzip.
 * Chunk dinamis dari lazy route tidak dihitung karena baru diunduh saat dibutuhkan.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const MAX_GZIP_BYTES = 450 * 1024;
const dist = resolve(process.cwd(), 'dist');
const html = readFileSync(resolve(dist, 'index.html'), 'utf8');

const refs = new Set();
for (const match of html.matchAll(/<(script|link)\b[^>]*?(?:src|href)="([^"]+\.js)"[^>]*>/g)) {
  refs.add(match[2]);
}

if (refs.size === 0) {
  console.error('[budget] Tidak menemukan JS awal di dist/index.html');
  process.exit(1);
}

let totalGzip = 0;
let totalRaw = 0;
const rows = [];

for (const ref of refs) {
  // Abaikan prefix base deployment (mis. "/table_periodic/assets/x.js")
  // agar file tetap dicari relatif terhadap dist.
  const clean = ref.split('?')[0];
  const assetsAt = clean.indexOf('/assets/');
  const rel =
    assetsAt >= 0 ? clean.slice(assetsAt + 1) : clean.replace(/^\.?\//, '');
  const file = resolve(dist, rel);
  const source = readFileSync(file);
  const gzip = gzipSync(source, { level: 9 }).length;
  totalGzip += gzip;
  totalRaw += source.length;
  rows.push({ file: ref, kb: (gzip / 1024).toFixed(1) });
}

rows.sort((a, b) => Number(b.kb) - Number(a.kb));
for (const row of rows) console.log(`[budget] ${row.file}  ${row.kb} KB gzip`);

const gzipKb = (totalGzip / 1024).toFixed(1);
const rawKb = (totalRaw / 1024).toFixed(1);
const limitKb = (MAX_GZIP_BYTES / 1024).toFixed(0);

if (totalGzip > MAX_GZIP_BYTES) {
  console.error(`[budget] GAGAL: ${gzipKb} KB gzip (${rawKb} KB mentah) > ${limitKb} KB`);
  process.exit(1);
}

console.log(`[budget] OK: ${gzipKb} KB gzip (${rawKb} KB mentah) / batas ${limitKb} KB`);
