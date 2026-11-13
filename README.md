# PeriodikLab

Tabel periodik interaktif dan laboratorium reaksi kimia, berbahasa Indonesia.
Dibangun dengan Vite, React, TypeScript, Zustand, dan zod.

## Menjalankan

```bash
npm install
npm run dev            # membangun data lalu menjalankan Vite
npm run build          # data + typecheck + build + prerender + PWA + gate budget
npm test               # unit test mesin reaksi & validasi dataset
npm run test:coverage  # test + gate coverage core/chemistry (≥90%)
npm run budget         # cek ulang ukuran JS awal dari dist/
npm run lint           # oxlint
npm run icons          # regenerasi ikon PWA di public/icons
node scripts/expand-reactions.mjs --update  # sinkronkan batch konten ke CSV (idempoten)
```

Buka `http://localhost:5173`.

Build produksi memakai `SITE_URL` untuk canonical, Open Graph, dan sitemap:

```bash
SITE_URL=https://domain-anda.example npm run build
```

Tanpa variabel itu, build tetap berhasil tetapi memakai placeholder
`https://periodiklab.example.com` dan menampilkan peringatan.

## Tiga mode + Tentang

| Rute | Mode | Isi |
|---|---|---|
| `/` | Jelajah | Tabel periodik 2D, pencarian, filter kategori, panel detail |
| `/unsur/:symbol` | Detail unsur | Deep link ke panel unsur (HTML prerender per unsur) |
| `/lab?s=H:2,O:1` | Laboratorium | Chamber atom, kondisi reaksi, hasil, tautan berbagi |
| `/tantangan` | Tantangan | Kuis 3 level, pembahasan, ulangi soal salah |
| `/tantangan/:level` | Tantangan | Langsung mulai paket `dasar` / `menengah` / `mahir` |
| `/tentang` | Tentang | Sumber & sitasi, lisensi, disclaimer, privasi, diagnostik error |

Di layar sempit (≤ 720px) keempat mode tampil sebagai navigasi yang menetap di
bagian bawah layar (ikon + label), sedangkan di desktop tetap di baris atas.

## Arsitektur singkat

```
content/*.csv                 sumber konten yang diedit manusia
scripts/build-data.mjs        CSV -> JSON + validasi (setara atom, sitasi, kulit e-)
scripts/expand-elements.mjs   sekali jalan: lengkapi 118 unsur dari dataset periodik
scripts/prerender-plugin.ts   metadata per rute + sitemap + 404 (plugin Vite)
scripts/generate-icons.mjs    ikon PWA PNG tanpa dependensi
scripts/check-budget.mjs      gate ukuran JS awal (≤ 450 KB gzip)
vitest.config.ts              coverage gate src/core/chemistry (≥ 90%)
src/core/chemistry/           mesin reaksi murni, diuji vitest
src/core/data/                118 unsur, species, reaksi, bank soal
src/features/table2d/         tabel semantik, tata letak, responsif untuk desktop & layar kecil
src/features/lab/             workbench reaksi (lazy-loaded)
src/features/quiz/            alur tantangan (lazy-loaded)
src/features/about/           sumber, lisensi, disclaimer, diagnostik (lazy-loaded)
src/app/                      store Zustand, router pushState, PWA, error tracker
src/ui/                       token warna, hook media query, rumus kimia, status koneksi
.github/workflows/ci.yml      lint + typecheck + coverage + build + cek data
```

### Mesin reaksi

Chamber berisi **atom**, dataset berisi **molekul**. Pencocokan memakai rasio atom
ternormalisasi, sehingga `{H:4, O:2}` cocok dengan `2H2 + O2 -> 2H2O`.
Keluaran menangani: berhasil, inert, kondisi kurang, sisa pereaksi (limiting reagent),
dan reaksi ambigu. Semua fungsi murni dan deterministik.

### PWA & offline

`vite-plugin-pwa` menghasilkan manifest, service worker, dan precache app shell.
Registrasi hanya aktif pada build produksi (`src/app/pwa.ts`). Halaman hasil prerender
ikut masuk precache, sehingga navigasi langsung ke `/unsur/Fe` tetap bekerja offline.
Status "Mode offline" / "Siap offline" muncul di toolbar.

Peramban yang mendukung instalasi memunculkan banner **Pasang PeriodikLab**; sinyal
`beforeinstallprompt` ditangkap dan diteruskan ke tombol pasang. Saat service worker
menemukan versi baru, banner berganti menjadi **Muat ulang** untuk menerapkan pembaruan.
Tampilan jelajah sepenuhnya berupa tabel 2D. Rute Lab, Tantangan, dan Tentang dimuat
lazy (`React.lazy` + `Suspense`), sehingga unduhan awal hanya berisi tabel 2D, panel
unsur, dan shell aplikasi.

### Identitas visual

Mark PeriodikLab adalah **dua kartu unsur bertumpuk**: kartu belakang berupa garis
putih-ungu yang dimiringkan −8°, kartu depan berlatar solid dengan pita aksen di tepi
atas dan huruf **P**. Bahasa visualnya mengikuti kartu unsur di tabel, bukan orbit atom
yang generik: satu unsur diambil dari tabel untuk diuji di laboratorium.

| Berkas | Kegunaan |
|---|---|
| `public/logo.svg` | mark 64×64 dengan latar transparan |
| `public/favicon.svg` | favicon vektor, latar gelap membulat |
| `public/logo-lockup.svg` | mark + wordmark untuk materi promosi |
| `src/ui/BrandMark.tsx` | mark inline di header, memakai token tema |
| `public/icons/*.png` | ikon PWA, dihasilkan `npm run icons` |

Palet tetap: latar `#0F1016`, badan kartu `#171B26`, pita `#A9DCE8` (kategori
transisi), garis kartu belakang `#D9C9FF` (gas mulia), dan tinta `#F4F4F7`. Header
memakai token `--cat-transition`, `--cat-noble`, `--surface-solid`, dan `--text`
sehingga mark otomatis menyesuaikan tema gelap/terang. Ikon PNG dirender secara
prosedural (rounded-rect SDF, tanpa dependency) oleh `scripts/generate-icons.mjs`;
varian maskable memakai latar penuh dan konten di dalam safe zone 80%.

### Performa & aksesibilitas

- Tabel 2D pada desktop memenuhi lebar dan tinggi layar tanpa scroll; di layar kecil
  tabel tetap bisa digeser dengan kartu ≥44px dan jarak kiri-kanan yang sama.
- Di desktop, memilih unsur akan memperbesar tabel (1,8×) dan memusatkan kartu pada
  area yang tidak tertutup panel. Zoom masuk dan keluar memakai satu transform
  `translate + scale` yang dianimasikan bersama, lalu scroll ditukar dalam satu
  commit, sehingga tidak ada lompatan layout. Saat berpindah unsur, panel lama
  menutup, tabel bergeser ke kartu baru, lalu panel dibuka kembali. Ruang gulir
  tambahan membuat kartu paling tepi tetap bisa dipusatkan, dan pengguna dengan
  `prefers-reduced-motion` mendapat perpindahan tanpa animasi.
- Di layar kecil (≤1023px) tidak ada zoom: memilih unsur cukup memunculkan bottom
  sheet deskripsi tanpa menggeser tabel, dan setelah panel ditutup posisi scroll
  tetap seperti sebelumnya (tidak kembali ke tampilan awal).
- Bundle awal **87,1 KB gzip** menurut gate budget (laporan build: 90,5 KB gzip);
  batas **450 KB**. Rute Lab, Tantangan, dan Tentang dimuat lazy.
- Coverage `src/core/chemistry`: **100% baris**, **96,8% branch** (ambang 90/85).
- Audit axe-core pada 7 tampilan desktop/mobile dan 10 pemeriksaan tambahan
  (5 tampilan × tema gelap/terang) menghasilkan **0 pelanggaran** WCAG 2.1 A/AA.
  Tema gelap/terang mengikuti preferensi sistem pada kunjungan pertama,
  dapat diganti lewat tombol tema di toolbar, dan pilihan pengguna disimpan di
  `localStorage` (`periodic-lab.theme`). Daftar sr-only dan `aria-live` tetap tersedia.

## Status konten

- **118 unsur** lengkap (nama Indonesia, kategori, golongan/periode, massa, konfigurasi
  elektron, kulit, titik leleh/didih, massa jenis, elektronegativitas, jari-jari,
  energi ionisasi pertama).
- **120 species** dan **128 reaksi** terkurasi dengan penjelasan + sitasi. Setiap reaksi
  setara atom, muat di chamber (≤ 24 atom, ≤ 12 atom per unsur), dan rasio pereaksinya
  unik sehingga mesin tidak ambigu. ΔH dibiarkan kosong bila belum terverifikasi.
- 40 soal kuis orisinal (14 dasar, 13 menengah, 13 mahir; 10 acak per sesi),
  kalibrasi Kurikulum Merdeka Fase E/F & GCSE.

Data pelengkap unsur berasal dari Periodic-Table-JSON (Bowserinator) yang merangkum
Wikipedia/PubChem; baris yang dikurasi manual dipertahankan saat perluasan.
Ringkasan unsur baru masih bersifat faktual-generik dan perlu diperkaya editor konten.

Batch reaksi baru diaudit lewat `scripts/expand-reactions.mjs` + `scripts/content/`.
Tanpa `--update` skrip hanya menambah id baru; dengan `--update` baris ber-id sama
ditimpa dari batch. CSV tetap sumber kebenaran untuk aplikasi.

## Rilis

```bash
SITE_URL=https://domain-anda.example npm run build
npm run preview   # cek hasil build + service worker
```

Hosting statis harus mengarahkan rute yang tidak punya file ke `index.html`
(mis. `try_files $uri $uri/ /index.html`). Build menghasilkan:

- `dist/unsur/<simbol>/index.html` untuk 118 unsur (judul, deskripsi, canonical, JSON-LD)
- `dist/lab`, `dist/tantangan`, `dist/tantangan/<level>`, `dist/tentang`
- `dist/sitemap.xml`, `dist/robots.txt`, `dist/404.html`
- `dist/manifest.webmanifest`, `dist/sw.js`

Setiap halaman hasil prerender sudah memuat `<h1>`, ringkasan beberapa paragraf,
fakta singkat, dan tautan internal (navigasi, indeks unsur, tingkat
tantangan). Konten itu tampil sebelum JavaScript siap, lalu diganti aplikasi React.

### Domain utama

Canonical, `og:url`, sitemap, dan robots.txt menunjuk ke satu domain utama:
`https://periodiclab.my.id`. Vercel adalah satu-satunya host publik; tidak ada
cermin GitHub Pages, sehingga sinyal peringkat tidak terpecah. Untuk mengganti
domain, ubah env `SITE_URL` di proyek Vercel (dan `DEFAULT_SITE` di
`scripts/prerender-plugin.ts` sebagai nilai cadangan).

### GitHub Pages (dinonaktifkan)

Situs GitHub Pages di <https://moroseto212.github.io/table_periodic/> sudah
dinonaktifkan agar hanya domain Vercel yang dapat diakses. Workflow
`deploy-pages.yml` dihapus supaya push ke `main` tidak memicu deploy yang
gagal. Alamat lama sekarang mengembalikan 404.

Dukungan `BASE_PATH` di `vite.config.ts` dan `src/app/router.ts` tetap
dipertahankan untuk build di subpath lain:

```bash
BASE_PATH=/subpath/ npm run build
BASE_PATH=/subpath/ npm run preview
```

Router, tautan bagikan, manifest, dan service worker mengikuti `BASE_PATH`;
tanpa variabel itu build tetap berjalan di `/` untuk dev.

## Batasan yang disadari

- Bank reaksi berisi 128 reaksi terkurasi (target v1 120–180). Mesin generatif untuk
  kombinasi di luar dataset ditunda ke v1.5; di luar aturan, chamber menjawab "tidak
  bereaksi" secara jujur.
- Bank soal berisi 40 soal (target ideal 60–80, batas cut list 40 sudah terpenuhi).
  Struktur kuis siap menerima soal tambahan tanpa perubahan kode.
- Mode bola (sphere), heatmap tren, dan model Bohr ditunda ke v1.1 sesuai cut list.
- Animasi partikel penuh menyusul; kondisi reaksi sudah ada di skema dan UI.
- QA perangkat fisik (iPad + Android kelas menengah) belum dilakukan; FPS headless
  bukan pengganti pengukuran di perangkat nyata.
- Rekap nilai guru butuh backend dan berada di luar scope v1.
