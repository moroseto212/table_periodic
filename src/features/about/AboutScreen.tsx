import { useMemo, useState } from 'react';
import { elements, reactions, species } from '../../core/data';
import { quizItems } from '../../core/data/quiz';
import { clearErrors, readErrors } from '../../app/error-tracker';

const SOURCE_LINKS: Record<string, string> = {
  NIST: 'https://webbook.nist.gov/chemistry/',
  PubChem: 'https://pubchem.ncbi.nlm.nih.gov/',
};

const STORAGE_KEYS = [
  ['periodic-lab.lab', 'Isi baki, kondisi, dan hasil percobaan terakhir'],
  ['periodic-lab.quiz', 'Sesi tantangan dan skor terbaik'],
  ['periodic-lab.hint-dismissed', 'Preferensi menutup petunjuk'],
  ['periodic-lab.theme', 'Pilihan tema gelap atau terang'],
  ['periodic-lab.error-log', 'Catatan error lokal untuk diagnostik'],
];

export default function AboutScreen() {
  const [errors, setErrors] = useState(() => readErrors());
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');

  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const reaction of reactions) {
      for (const source of reaction.sources) {
        counts.set(source, (counts.get(source) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const copyLog = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(errors, null, 2));
      setCopyState('ok');
    } catch {
      setCopyState('fail');
    }
    window.setTimeout(() => setCopyState('idle'), 3000);
  };

  return (
    <div className="about">
      <header className="about__hero">
        <p className="about__eyebrow">Tentang aplikasi</p>
        <h1>PeriodikLab</h1>
        <p className="about__lede">
          Tabel periodik interaktif, laboratorium reaksi, dan tantangan kimia dalam satu aplikasi
          berbahasa Indonesia. Dibuat untuk belajar mandiri di sekolah maupun di rumah, tanpa akun
          dan tanpa backend.
        </p>
        <dl className="about__stats">
          <div>
            <dt>Unsur</dt>
            <dd>{elements.length}</dd>
          </div>
          <div>
            <dt>Spesies</dt>
            <dd>{species.length}</dd>
          </div>
          <div>
            <dt>Reaksi</dt>
            <dd>{reactions.length}</dd>
          </div>
          <div>
            <dt>Soal</dt>
            <dd>{quizItems.length}</dd>
          </div>
        </dl>
      </header>

      <section className="about__card" aria-labelledby="about-sumber">
        <h2 id="about-sumber">Sumber &amp; sitasi</h2>
        <p>
          Setiap reaksi di laboratorium menyimpan daftar sumber pada kolom <code>sources</code>.
          Data termodinamika mengikuti nilai yang tersedia di sumber acuan; nilai yang belum
          terverifikasi sengaja dikosongkan, bukan ditebak.
        </p>
        <ul className="about__sources">
          {sourceCounts.map(([source, count]) => (
            <li key={source}>
              {SOURCE_LINKS[source] ? (
                <a href={SOURCE_LINKS[source]} target="_blank" rel="noreferrer noopener">
                  {source}
                </a>
              ) : (
                <span>{source}</span>
              )}
              <span className="about__muted">{count} reaksi</span>
            </li>
          ))}
        </ul>
        <p className="about__muted">
          Data pelengkap 118 unsur berasal dari{' '}
          <a
            href="https://github.com/Bowserinator/Periodic-Table-JSON"
            target="_blank"
            rel="noreferrer noopener"
          >
            Periodic-Table-JSON
          </a>{' '}
          (MIT), yang merangkum Wikipedia dan PubChem. Baris yang dikurasi manual dipertahankan
          saat perluasan data.
        </p>
      </section>

      <section className="about__card" aria-labelledby="about-lisensi">
        <h2 id="about-lisensi">Lisensi &amp; atribusi</h2>
        <p>
          Teks penjelasan, soal tantangan, dan antarmuka ditulis khusus untuk PeriodikLab. Data
          faktual dan nilai termodinamika tetap milik sumber aslinya dan digunakan sebagai rujukan
          edukasi. Nama produk, merek, dan tautan pihak ketiga tidak menyiratkan dukungan.
        </p>
      </section>

      <section className="about__card" aria-labelledby="about-disclaimer">
        <h2 id="about-disclaimer">Disclaimer keselamatan</h2>
        <p>
          PeriodikLab adalah alat bantu belajar, bukan pengganti buku teks, bimbingan guru, atau
          prosedur laboratorium resmi. Jangan mencoba reaksi yang ditampilkan tanpa pengawasan,
          alat pelindung diri, dan lembar data keselamatan bahan (SDS). Beberapa zat bersifat
          korosif, mudah terbakar, atau beracun.
        </p>
        <p>
          Perhitungan stoikiometri dan energi bersifat edukatif. Selalu verifikasi angka penting
          dan kondisi percobaan sebelum dipakai dalam laporan atau pekerjaan nyata.
        </p>
      </section>

      <section className="about__card" aria-labelledby="about-privasi">
        <h2 id="about-privasi">Privasi &amp; penyimpanan lokal</h2>
        <p>
          Tidak ada akun, analitik, atau pengiriman data ke server. Semua progres disimpan di
          perangkat Anda memakai <code>localStorage</code>:
        </p>
        <dl className="about__storage">
          {STORAGE_KEYS.map(([key, description]) => (
            <div key={key}>
              <dt>
                <code>{key}</code>
              </dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        <p className="about__muted">
          Menghapus data situs lewat pengaturan peramban akan menghapus seluruh progres ini.
        </p>
      </section>

      <section className="about__card" aria-labelledby="about-diagnostik">
        <h2 id="about-diagnostik">Diagnostik</h2>
        <p>
          Error tak terduga dicatat lokal agar bisa disertakan saat melaporkan masalah. Tidak ada
          data yang dikirim otomatis.
        </p>
        <p className="about__muted">
          {errors.length === 0
            ? 'Belum ada error tercatat.'
            : `${errors.length} catatan error tersimpan (maksimal 25).`}
        </p>
        {errors.length > 0 && (
          <>
            <details className="about__errors">
              <summary>Lihat catatan terakhir</summary>
              <ul>
                {errors.slice(0, 5).map((entry) => (
                  <li key={`${entry.at}-${entry.message}`}>
                    <time dateTime={entry.at}>{entry.at}</time>
                    <span>{entry.message}</span>
                  </li>
                ))}
              </ul>
            </details>
            <div className="about__actions">
              <button type="button" className="btn" onClick={copyLog}>
                {copyState === 'ok'
                  ? 'Log disalin'
                  : copyState === 'fail'
                    ? 'Gagal menyalin'
                    : 'Salin log'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  clearErrors();
                  setErrors([]);
                }}
              >
                Hapus log
              </button>
            </div>
          </>
        )}
      </section>

      <footer className="about__foot">
        <p>
          PeriodikLab · versi v1 · dibangun dengan Vite, React, Zustand, dan zod.
        </p>
      </footer>
    </div>
  );
}
