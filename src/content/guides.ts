import type { ElementCategory } from '../core/chemistry/types.ts';
import {
  CATEGORY_GROUP_RANGE,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_SLUGS,
  groupPath,
  periodPath,
} from './categories.ts';
import { elementDetails, type ElementDetail } from './element-details.ts';

/**
 * Sumber konten untuk halaman pendukung: golongan, periode, indeks unsur,
 * konfigurasi elektron, dan tanya-jawab. Modul ini murni data + fungsi, tanpa
 * API browser, sehingga dipakai bersama oleh generator prerender (Node) dan
 * aplikasi React.
 */

export interface GuideElement {
  z: number;
  symbol: string;
  name: string;
  category: ElementCategory;
  group: number | null;
  period: number;
  block: string;
  mass: number;
  electronConfig: string;
  stateSTP: string;
  discoveredYear: number | null;
  summary: string;
  meltingK?: number | null;
  boilingK?: number | null;
  densityGcm3?: number | null;
  electronegativity?: number | null;
  atomicRadiusPm?: number | null;
  ionizationKJmol?: number | null;
  oxidationStates?: number[];
  isotopes?: { massNumber: number; abundancePct: number | null; stable: boolean }[];
}

export interface GuideLink {
  path: string;
  label: string;
  hint?: string;
}

export interface GuideLinkGroup {
  heading: string;
  items: GuideLink[];
}

export interface GuideFact {
  label: string;
  value: string;
}

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  items?: GuideFact[];
  list?: GuideLink[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuidePage {
  path: string;
  title: string;
  description: string;
  heading: string;
  intro: string[];
  facts?: GuideFact[];
  sections?: GuideSection[];
  faq?: GuideFaq[];
  groups?: GuideLinkGroup[];
  breadcrumb: { name: string; path: string }[];
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const STATE_LABELS: Record<string, string> = {
  solid: 'padat',
  liquid: 'cair',
  gas: 'gas',
  aqueous: 'larutan',
};

const elementPath = (symbol: string): string => `/unsur/${symbol}`;

interface GroupCopy {
  title: string;
  heading: string;
  description: string;
  intro: string[];
  facts: GuideFact[];
  sections: GuideSection[];
}

const GROUP_COPY: Record<ElementCategory, GroupCopy> = {
  alkali: {
    title: 'Logam Alkali: Golongan 1 dan Sifatnya | PeriodikLab',
    heading: 'Logam Alkali — Golongan 1',
    description:
      'Ciri logam alkali (Li, Na, K, Rb, Cs, Fr): konfigurasi ns¹, reaktivitas tinggi, titik leleh rendah, dan kegunaan sehari-hari.',
    intro: [
      'Logam alkali menempati golongan 1 tabel periodik: litium, natrium, kalium, rubidium, sesium, dan fransium. Semuanya memiliki satu elektron valensi pada orbital ns¹, sehingga cenderung melepas satu elektron dan membentuk ion bermuatan +1.',
      'Reaktivitas meningkat dari atas ke bawah. Litium bereaksi tenang dengan air, sedangkan kalium dapat menyala dan sesium bereaksi hampir eksplosif. Karena itu logam alkali disimpan dalam minyak mineral atau atmosfer argon, bukan di udara terbuka.',
    ],
    facts: [
      { label: 'Golongan', value: '1' },
      { label: 'Blok', value: 's' },
      { label: 'Elektron valensi', value: '1 (ns¹)' },
      { label: 'Wujud', value: 'padat (logam lunak)' },
    ],
    sections: [
      {
        heading: 'Ciri khas',
        paragraphs: [
          'Logam alkali berwarna keperakan, sangat lunak, dan bisa dipotong dengan pisau. Massa jenisnya rendah; litium bahkan mengapung di air sebelum bereaksi. Titik leleh dan titik didihnya jauh lebih rendah dibanding logam transisi karena ikatan logamnya lemah.',
          'Senyawanya umumnya larut air dan berperan penting di tubuh: ion Na⁺ menjaga tekanan osmotik cairan, sedangkan K⁺ berperan dalam impuls saraf dan kontraksi otot.',
        ],
      },
      {
        heading: 'Kecenderungan dalam golongan',
        paragraphs: [
          'Dari litium ke sesium, jari-jari atom bertambah sehingga elektron valensi lebih mudah dilepas. Akibatnya energi ionisasi turun dan reaktivitas naik. Sifat basa hidroksidanya juga menguat: LiOH paling lemah, CsOH paling kuat.',
          'Fransium sangat radioaktif dengan waktu paruh sekitar 22 menit, sehingga sifat kimianya hanya dipelajari lewat jejak dalam jumlah sangat kecil.',
        ],
      },
      {
        heading: 'Keselamatan',
        paragraphs: [
          'Jangan pernah membuang logam alkali ke air atau wastafel. Reaksi dengan air menghasilkan gas hidrogen dan panas yang dapat menyulut kebakaran. Sisa logam harus dinetralkan dengan alkohol sekunder di bawah pengawasan guru.',
        ],
      },
    ],
  },
  alkaline: {
    title: 'Logam Alkali Tanah: Golongan 2 dan Sifatnya | PeriodikLab',
    heading: 'Logam Alkali Tanah — Golongan 2',
    description:
      'Sifat logam alkali tanah (Be, Mg, Ca, Sr, Ba, Ra): konfigurasi ns², bilangan oksidasi +2, kegunaan magnesium dan kalsium.',
    intro: [
      'Logam alkali tanah mengisi golongan 2: berilium, magnesium, kalsium, stronsium, barium, dan radium. Setiap atomnya memiliki dua elektron valensi ns² yang mudah dilepas, sehingga hampir selalu muncul sebagai ion +2 dalam senyawa.',
      'Nama "alkali tanah" berasal dari oksida logamnya yang bersifat basa dan tidak larut air — dulu disebut "tanah". Kalsium dan magnesium adalah anggotanya yang paling akrab: keduanya menyusun tulang, karang, dan mineral batuan.',
    ],
    facts: [
      { label: 'Golongan', value: '2' },
      { label: 'Blok', value: 's' },
      { label: 'Elektron valensi', value: '2 (ns²)' },
      { label: 'Bilangan oksidasi', value: '+2' },
    ],
    sections: [
      {
        heading: 'Ciri khas',
        paragraphs: [
          'Semua anggotanya adalah logam keperakan yang lebih keras dari logam alkali, tetapi masih cukup lunak untuk ditempa. Reaktivitasnya lebih rendah daripada golongan 1 karena dua elektron valensi terikat lebih kuat.',
          'Berilium bersifat amfoter dan beracun dalam bentuk debu; magnesium dan kalsium relatif aman serta banyak dipakai industri. Barium menyerap sinar-X sehingga digunakan sebagai kontras pada pemeriksaan radiologi.',
        ],
      },
      {
        heading: 'Kecenderungan dalam golongan',
        paragraphs: [
          'Seperti golongan 1, reaktivitas meningkat dari berilium ke barium seiring bertambahnya jari-jari atom. Berilium hampir tidak bereaksi dengan air, sedangkan kalsium bereaksi lambat dan barium bereaksi cepat menghasilkan hidrogen.',
          'Kelarutan hidroksida juga meningkat ke bawah, sementara kelarutan sulfat justru menurun — barium sulfat praktis tidak larut, karena itu aman dipakai sebagai kontras radiologi.',
        ],
      },
      {
        heading: 'Peran biologis',
        paragraphs: [
          'Ion Ca²⁺ mengatur kontraksi otot, pembekuan darah, dan sinyal antarsel. Ion Mg²⁺ menjadi kofaktor ratusan enzim, termasuk yang bekerja pada ATP. Kekurangan magnesium dapat memicu kram otot dan gangguan irama jantung.',
        ],
      },
    ],
  },
  transition: {
    title: 'Logam Transisi: Golongan 3–12 dan Sifatnya | PeriodikLab',
    heading: 'Logam Transisi — Golongan 3 sampai 12',
    description:
      'Ciri logam transisi: blok d, bilangan oksidasi beragam, katalis, warna senyawa, dan kemagnetan. Contoh besi, tembaga, dan seng.',
    intro: [
      'Logam transisi menempati blok d, membentang dari golongan 3 hingga 12 pada periode 4 sampai 7. Contohnya besi, tembaga, nikel, krom, dan emas. Ciri utamanya adalah orbital d yang terisi sebagian, sehingga elektron valensinya dapat terlibat dalam ikatan dengan cara yang lebih beragam.',
      'Karena itu logam transisi punya bilangan oksidasi bervariasi, membentuk senyawa berwarna, sering bersifat magnetik, dan sangat berguna sebagai katalis. Hampir semua logam yang dipakai dalam konstruksi, kabel, dan peralatan listrik berasal dari kelompok ini.',
    ],
    facts: [
      { label: 'Golongan', value: '3–12' },
      { label: 'Blok', value: 'd' },
      { label: 'Bilangan oksidasi', value: 'beragam (+2 sampai +7)' },
      { label: 'Contoh', value: 'Fe, Cu, Zn, Cr, Ni, Au' },
    ],
    sections: [
      {
        heading: 'Mengapa bilangan oksidasinya beragam',
        paragraphs: [
          'Elektron 4s dan 3d memiliki energi berdekatan, sehingga jumlah elektron yang dilepas dapat berbeda-beda. Besi muncul sebagai Fe²⁺ dan Fe³⁺, mangan bahkan dapat mencapai +7 dalam permanganat. Setiap bilangan oksidasi memberi sifat dan warna yang khas.',
          'Senyawa tembaga(II) berwarna biru, besi(III) kuning kecokelatan, dan kromat kuning terang. Warna ini muncul karena transisi elektron pada orbital d yang terbelah oleh ligan di sekitarnya.',
        ],
      },
      {
        heading: 'Katalis dan kemagnetan',
        paragraphs: [
          'Permukaan logam transisi dapat menyerap molekul dan melemahkan ikatannya, sehingga menurunkan energi aktivasi. Besi menjadi katalis pada proses Haber–Bosch, nikel pada hidrogenasi minyak, dan platina pada katalis kendaraan.',
          'Besi, kobalt, dan nikel bersifat feromagnetik karena elektron tidak berpasangan pada orbital d dapat sejajar membentuk domain magnetik.',
        ],
      },
      {
        heading: 'Posisi di tabel periodik',
        paragraphs: [
          'Pada periode 4, blok d diisi dari skandium (3d¹) hingga seng (3d¹⁰). Seng sering diperdebatkan karena orbital d-nya penuh, tetapi tetap dikelompokkan sebagai logam transisi dalam tabel periodik standar.',
        ],
      },
    ],
  },
  'post-transition': {
    title: 'Logam Pascatransisi: Golongan 13–16 | PeriodikLab',
    heading: 'Logam Pascatransisi — Golongan 13 sampai 16',
    description:
      'Ciri logam pascatransisi: titik leleh rendah, lunak, cenderung membentuk ion +3. Contoh aluminium, timah, dan timbal.',
    intro: [
      'Logam pascatransisi berada di blok p, setelah logam transisi: aluminium, galium, indium, timah, talium, timbal, dan bismut. Disebut "pasca" karena secara posisi muncul setelah blok d, meskipun sifatnya sudah berbeda dari logam transisi.',
      'Umumnya logam ini lebih lunak, bertitik leleh lebih rendah, dan kurang reaktif dibanding logam transisi. Aluminium menjadi pengecualian penting karena ringan, kuat, dan tahan korosi sehingga menjadi logam kedua terbanyak diproduksi.',
    ],
    facts: [
      { label: 'Golongan', value: '13–16' },
      { label: 'Blok', value: 'p' },
      { label: 'Bilangan oksidasi', value: '+3 dan +2' },
      { label: 'Contoh', value: 'Al, Sn, Pb, Bi' },
    ],
    sections: [
      {
        heading: 'Ciri khas',
        paragraphs: [
          'Logam pascatransisi memiliki titik leleh relatif rendah; galium bahkan meleleh di tangan karena titik lelehnya hanya 303 K. Timah dan timbal lunak serta mudah dibentuk, sedangkan bismut keras tetapi rapuh.',
          'Lapisan oksida tipis sering melindungi permukaan logam ini dari korosi lanjut. Aluminium oksida adalah contoh paling terkenal dan menjadi alasan mengapa aluminium tahan cuaca.',
        ],
      },
      {
        heading: 'Kegunaan',
        paragraphs: [
          'Aluminium dipakai pada kendaraan, kemasan, dan kabel listrik. Timah menjadi bahan solder dan pelapis kaleng, sedangkan timbal dipakai pada baterai dan pelindung radiasi. Bismut digunakan pada obat lambung dan paduan bertitik leleh rendah.',
        ],
      },
    ],
  },
  metalloid: {
    title: 'Metaloid: Unsur antara Logam dan Nonlogam | PeriodikLab',
    heading: 'Metaloid — Unsur di Antara Logam dan Nonlogam',
    description:
      'Sifat metaloid (B, Si, Ge, As, Sb, Te): semikonduktor, konduktivitas yang naik saat dipanaskan, dan kegunaan di elektronika.',
    intro: [
      'Metaloid adalah unsur yang sifatnya berada di antara logam dan nonlogam: boron, silikon, germanium, arsen, antimon, dan telurium. Letaknya membentuk garis diagonal pada tabel periodik, memisahkan logam di kiri dari nonlogam di kanan.',
      'Ciri paling khas adalah semikonduktivitas: konduktivitas listriknya meningkat saat suhu naik, kebalikan dari logam. Sifat inilah yang membuat silikon dan germanium menjadi fondasi chip komputer.',
    ],
    facts: [
      { label: 'Anggota', value: 'B, Si, Ge, As, Sb, Te' },
      { label: 'Posisi', value: 'garis diagonal blok p' },
      { label: 'Sifat listrik', value: 'semikonduktor' },
      { label: 'Contoh industri', value: 'sel surya, transistor' },
    ],
    sections: [
      {
        heading: 'Mengapa disebut "antara"',
        paragraphs: [
          'Metaloid memiliki kilap seperti logam tetapi rapuh seperti nonlogam. Sebagian membentuk oksida amfoter, yaitu dapat bereaksi dengan asam maupun basa. Boron dan silikon membentuk jaringan kovalen yang keras, sedangkan arsen dan telurium lebih mirip logam.',
          'Batas metaloid tidak sepenuhnya disepakati. Beberapa tabel memasukkan selenium atau polonium, tergantung kriteria yang dipakai. PeriodikLab mengikuti pengelompokan yang paling umum dipakai di kurikulum.',
        ],
      },
      {
        heading: 'Peran di elektronika',
        paragraphs: [
          'Silikon murni adalah isolator lemah. Ketika diberi sedikit fosfor (doping n) atau boron (doping p), konduktivitasnya naik terkendali dan membentuk sambungan p–n yang menjadi dasar dioda, transistor, dan sel surya.',
          'Germanium dipakai pada transistor generasi awal dan kini kembali diminati untuk perangkat berkecepatan tinggi. Arsen dipakai pada semikonduktor gallium arsenide untuk komunikasi optik.',
        ],
      },
    ],
  },
  nonmetal: {
    title: 'Nonlogam: Ciri, Contoh, dan Perannya | PeriodikLab',
    heading: 'Nonlogam — Unsur Penyusun Kehidupan',
    description:
      'Ciri nonlogam (H, C, N, O, P, S, Se): isolator, membentuk anion dan ikatan kovalen, serta menyusun sebagian besar tubuh makhluk hidup.',
    intro: [
      'Nonlogam berada di kanan atas tabel periodik: hidrogen, karbon, nitrogen, oksigen, fosfor, belerang, dan selenium. Berbeda dari logam, nonlogam cenderung menarik elektron, membentuk anion, atau berbagi elektron lewat ikatan kovalen.',
      'Hidrogen adalah pengecualian posisi karena hanya memiliki satu elektron, tetapi sifatnya lebih dekat ke nonlogam. Empat unsur nonlogam — H, C, N, dan O — menyusun hampir seluruh senyawa organik dan tubuh makhluk hidup.',
    ],
    facts: [
      { label: 'Anggota', value: 'H, C, N, O, P, S, Se' },
      { label: 'Blok', value: 'p (dan s untuk H)' },
      { label: 'Sifat listrik', value: 'isolator' },
      { label: 'Ikatan', value: 'kovalen' },
    ],
    sections: [
      {
        heading: 'Ciri khas',
        paragraphs: [
          'Nonlogam umumnya bertitik leleh rendah, tidak menghantarkan listrik, dan rapuh dalam bentuk padat. Oksidanya bersifat asam: CO₂ dan SO₂ larut air membentuk asam. Kebalikannya, oksida logam cenderung basa.',
          'Karena elektronegativitasnya tinggi, nonlogam sering menjadi sisi negatif dalam senyawa ion, misalnya Cl⁻ pada NaCl atau O²⁻ pada Fe₂O₃.',
        ],
      },
      {
        heading: 'Peran biologis',
        paragraphs: [
          'Oksigen menerima elektron di akhir rantai respirasi, karbon menjadi kerangka molekul organik, nitrogen menyusun asam amino dan basa DNA, sedangkan fosfor menjadi tulang punggung ATP dan tulang.',
          'Belerang muncul pada asam amino sistein dan metionin, membentuk jembatan disulfida yang menstabilkan struktur protein.',
        ],
      },
    ],
  },
  halogen: {
    title: 'Halogen: Golongan 17 dan Reaktivitasnya | PeriodikLab',
    heading: 'Halogen — Golongan 17',
    description:
      'Sifat halogen (F, Cl, Br, I, At): sangat reaktif, membentuk garam, titik didih naik ke bawah. Kegunaan klorin dan iodin.',
    intro: [
      'Halogen menempati golongan 17: fluorin, klorin, bromin, iodin, dan astatin. Namanya berarti "pembentuk garam" karena mudah bereaksi dengan logam menghasilkan garam, seperti NaCl dari natrium dan klorin.',
      'Setiap atom halogen memiliki tujuh elektron valensi dan hanya butuh satu elektron lagi untuk mencapai konfigurasi gas mulia. Karena itu halogen sangat reaktif, membentuk ion −1 atau ikatan kovalen tunggal.',
    ],
    facts: [
      { label: 'Golongan', value: '17' },
      { label: 'Elektron valensi', value: '7 (ns²np⁵)' },
      { label: 'Wujud', value: 'gas, cair, padat' },
      { label: 'Contoh', value: 'F₂, Cl₂, Br₂, I₂' },
    ],
    sections: [
      {
        heading: 'Kecenderungan sifat',
        paragraphs: [
          'Reaktivitas dan daya oksidasi menurun dari fluorin ke iodin, sedangkan titik didih dan titik leleh naik karena gaya dispersi antarmolekul makin kuat. Pada suhu kamar, fluorin dan klorin berupa gas, bromin cair, sedangkan iodin padat.',
          'Fluorin adalah unsur paling elektronegatif sehingga dapat mengoksidasi hampir semua zat, termasuk oksigen. Iodin jauh lebih tenang dan dipakai sebagai antiseptik dalam bentuk larutan.',
        ],
      },
      {
        heading: 'Kegunaan',
        paragraphs: [
          'Klorin dipakai untuk disinfeksi air dan pembuatan PVC. Fluorin muncul dalam pasta gigi sebagai fluorida dan pada senyawa PTFE (Teflon). Iodin dibutuhkan kelenjar tiroid untuk membentuk hormon tiroksin.',
        ],
      },
      {
        heading: 'Keselamatan',
        paragraphs: [
          'Gas klorin dan fluorin sangat beracun serta mengiritasi saluran napas. Jangan mencampur pembersih berbasis klorin dengan asam karena dapat melepaskan gas klorin berbahaya.',
        ],
      },
    ],
  },
  noble: {
    title: 'Gas Mulia: Golongan 18 dan Sifatnya | PeriodikLab',
    heading: 'Gas Mulia — Golongan 18',
    description:
      'Sifat gas mulia (He, Ne, Ar, Kr, Xe, Rn): oktat lengkap, sangat stabil, titik didih rendah, dan kegunaan pada lampu serta las.',
    intro: [
      'Gas mulia menempati golongan 18: helium, neon, argon, kripton, xenon, dan radon. Kulit elektron terluarnya terisi penuh — dua elektron untuk helium, delapan untuk lainnya — sehingga energinya rendah dan sangat sukar bereaksi.',
      'Kestabilan inilah yang membuat gas mulia dipakai saat reaksi tidak boleh terganggu oksigen: atmosfer argon pada pengelasan, helium pada campuran napas penyelam, dan neon pada lampu tanda.',
    ],
    facts: [
      { label: 'Golongan', value: '18' },
      { label: 'Elektron valensi', value: '8 (ns²np⁶), He: 2' },
      { label: 'Wujud', value: 'gas monoatomik' },
      { label: 'Reaktivitas', value: 'sangat rendah' },
    ],
    sections: [
      {
        heading: 'Mengapa sukar bereaksi',
        paragraphs: [
          'Konfigurasi elektron yang penuh membuat energi ionisasi tinggi dan afinitas elektron sangat rendah. Tidak ada keuntungan energi dari melepas atau menerima elektron, sehingga gas mulia cenderung tetap monoatomik.',
          'Meski begitu, senyawa gas mulia tetap ada. Xenon membentuk XeF₂ dan XeF₄ dengan fluorin yang sangat elektronegatif, dan senyawa kripton serta radon juga telah dibuat di laboratorium.',
        ],
      },
      {
        heading: 'Sifat fisik dan kegunaan',
        paragraphs: [
          'Titik didih gas mulia sangat rendah karena antarmolekul hanya ditahan gaya dispersi. Helium memiliki titik didih terendah di antara semua unsur, yaitu 4,2 K, sehingga menjadi pendingin utama magnet superkonduktor.',
          'Neon menghasilkan cahaya merah-oranye pada tabung lucutan, argon melindungi las dari oksidasi, dan kripton dipakai pada lampu kilat berkecepatan tinggi.',
        ],
      },
    ],
  },
  lanthanide: {
    title: 'Lantanida: Deret Unsur Tanah Jarang | PeriodikLab',
    heading: 'Lantanida — Deret Tanah Jarang',
    description:
      'Ciri lantanida (La sampai Lu): pengisian orbital 4f, sifat kimia mirip, magnet kuat, dan peran pada magnet serta layar.',
    intro: [
      'Lantanida adalah 15 unsur dari lantanum (57) hingga lutesium (71) yang mengisi orbital 4f. Mereka sering disebut unsur tanah jarang, meskipun sebenarnya tidak semua langka — yang sulit adalah memisahkannya karena sifat kimianya sangat mirip.',
      'Semua lantanida cenderung membentuk ion +3, sehingga dalam bijih mereka selalu bercampur. Pemisahan membutuhkan serangkaian ekstraksi pelarut yang panjang dan menjadi salah satu proses industri paling rumit.',
    ],
    facts: [
      { label: 'Nomor atom', value: '57–71' },
      { label: 'Blok', value: 'f' },
      { label: 'Bilangan oksidasi', value: '+3 (umum)' },
      { label: 'Contoh', value: 'La, Ce, Nd, Eu, Gd' },
    ],
    sections: [
      {
        heading: 'Ciri khas',
        paragraphs: [
          'Logam lantanida berwarna keperakan dan cukup reaktif; mereka mudah teroksidasi di udara sehingga disimpan dalam minyak atau atmosfer inert. Oksidanya bersifat basa dan larut dalam asam.',
          'Elektron 4f yang terisi bertahap menghasilkan sifat magnetik dan optik yang khas. Neodimium dan disprosium dipakai pada magnet permanen terkuat, sedangkan europium dan terbium memberi warna pada layar dan lampu LED.',
        ],
      },
      {
        heading: 'Kegunaan modern',
        paragraphs: [
          'Magnet neodimium–besi–boron ada di motor listrik kendaraan, generator turbin angin, dan pengeras suara. Serium oksida menjadi bahan pemoles kaca, sedangkan lantanum dipakai pada lensa kamera dan baterai nikel–metal hidrida.',
        ],
      },
      {
        heading: 'Catatan lingkungan',
        paragraphs: [
          'Penambangan dan pengolahan lantanida menghasilkan limbah yang perlu dikelola hati-hati karena sering membawa thorium dan uranium. Daur ulang magnet bekas menjadi salah satu upaya mengurangi beban tambang.',
        ],
      },
    ],
  },
  actinide: {
    title: 'Aktinida: Deret Unsur Radioaktif | PeriodikLab',
    heading: 'Aktinida — Deret Unsur Radioaktif',
    description:
      'Ciri aktinida (Ac sampai Lr): pengisian orbital 5f, radioaktif, bilangan oksidasi beragam, dan peran uranium serta plutonium.',
    intro: [
      'Aktinida mencakup 15 unsur dari aktinium (89) hingga lawrencium (103) yang mengisi orbital 5f. Semuanya radioaktif; hanya uranium dan torium yang masih ditemukan dalam jumlah berarti di alam, sisanya diperoleh lewat reaksi nuklir.',
      'Uranium dan plutonium menjadi bahan bakar reaktor dan sumber radioisotop. Unsur setelah plutonium umumnya sangat tidak stabil dan hanya dibuat dalam jumlah mikrogram di laboratorium.',
    ],
    facts: [
      { label: 'Nomor atom', value: '89–103' },
      { label: 'Blok', value: 'f' },
      { label: 'Sifat', value: 'radioaktif' },
      { label: 'Contoh', value: 'Ac, Th, U, Pu, Am' },
    ],
    sections: [
      {
        heading: 'Perbedaan dari lantanida',
        paragraphs: [
          'Aktinida lebih mudah bereaksi dan memiliki bilangan oksidasi yang lebih beragam karena orbital 5f lebih dekat ke permukaan. Uranium dapat muncul sebagai +3 hingga +6, sedangkan amerisium umumnya +3.',
          'Radioaktivitasnya berasal dari inti yang tidak stabil. Peluruhan alfa, beta, dan gamma terjadi sampai terbentuk inti stabil, seringkali timbal.',
        ],
      },
      {
        heading: 'Pemanfaatan dan keselamatan',
        paragraphs: [
          'Uranium-235 mengalami fisi berantai dan menjadi bahan bakar reaktor. Plutonium-238 dipakai sebagai sumber panas pada wahana antariksa karena peluruhannya menghasilkan panas stabil.',
          'Semua material aktinida harus ditangani dengan alat pelindung, pemantau dosis, dan pengelolaan limbah jangka panjang. Debu aktinida berbahaya bila terhirup karena radiasi alfa sangat merusak jaringan bila berada di dalam tubuh.',
        ],
      },
    ],
  },
};

interface PeriodCopy {
  intro: string[];
  sections: GuideSection[];
  description: string;
}

const PERIOD_COPY: Record<number, PeriodCopy> = {
  1: {
    description:
      'Periode 1 hanya berisi hidrogen dan helium: pengisian kulit K, dari satu elektron hingga oktat penuh.',
    intro: [
      'Periode 1 adalah baris terpendek tabel periodik. Hanya ada dua unsur di sini: hidrogen dan helium. Keduanya mengisi kulit pertama (kulit K) yang hanya mampu menampung dua elektron.',
      'Meski jumlahnya sedikit, keduanya sangat penting: hidrogen menjadi bahan bakar bintang, sedangkan helium adalah hasil fusi yang sama dan mengisi sekitar 24% massa alam semesta.',
    ],
    sections: [
      {
        heading: 'Pengisian kulit',
        paragraphs: [
          'Hidrogen memiliki konfigurasi 1s¹ dan helium 1s². Helium sudah memenuhi kapasitas kulit K, sehingga digolongkan gas mulia dengan kestabilan tinggi.',
          'Hidrogen bisa melepas elektron menjadi H⁺ atau menerima satu elektron menjadi H⁻, perilaku yang membuatnya unik dan tidak sepenuhnya mirip golongan mana pun.',
        ],
      },
      {
        heading: 'Tren di periode ini',
        paragraphs: [
          'Karena hanya berisi dua unsur, tren periodik tidak terlalu terlihat. Namun perbedaan sifat sudah tajam: hidrogen adalah nonlogam reaktif, sedangkan helium hampir tidak bereaksi sama sekali.',
        ],
      },
    ],
  },
  2: {
    description:
      'Periode 2 berisi delapan unsur dari litium sampai neon: pengisian orbital 2s dan 2p, tren logam ke nonlogam.',
    intro: [
      'Periode 2 memuat delapan unsur: Li, Be, B, C, N, O, F, dan Ne. Di sini orbital 2s dan 2p mulai terisi, memberi pola sifat yang menjadi dasar pemahaman tabel periodik.',
      'Sepanjang periode, sifat berubah dari logam reaktif di kiri menjadi nonlogam reaktif di kanan, lalu ditutup gas mulia yang stabil. Perubahan ini terjadi hanya dalam delapan nomor atom.',
    ],
    sections: [
      {
        heading: 'Pengisian kulit',
        paragraphs: [
          'Litium mengisi 2s¹, berilium 2s², lalu boron hingga neon mengisi orbital 2p. Neon mencapai konfigurasi 2s²2p⁶ yang penuh sehingga sangat stabil.',
          'Karena kulit kedua lebih kecil dari kulit ketiga, unsur periode 2 tidak pernah melebihi delapan elektron valensi. Ini menjelaskan mengapa aturan oktet bekerja baik untuk unsur periode ini.',
        ],
      },
      {
        heading: 'Tren sifat',
        paragraphs: [
          'Jari-jari atom mengecil dari litium ke fluorin karena muatan inti efektif bertambah sementara jumlah kulit tetap. Energi ionisasi dan elektronegativitas naik searah, sedangkan sifat logam melemah.',
          'Litium dan berilium membentuk oksida basa, boron amfoter, sedangkan karbon hingga fluorin membentuk oksida asam. Neon tidak membentuk oksida pada kondisi normal.',
        ],
      },
    ],
  },
  3: {
    description:
      'Periode 3 berisi delapan unsur dari natrium sampai argon: pengisian 3s dan 3p, dengan sifat mirip periode 2.',
    intro: [
      'Periode 3 berisi Na, Mg, Al, Si, P, S, Cl, dan Ar. Pola sifatnya menyerupai periode 2, tetapi jari-jari atom lebih besar sehingga reaktivitas logamnya meningkat dan ikatan kimianya sedikit berbeda.',
      'Natrium dan magnesium adalah logam yang sangat reaktif, aluminium sudah menunjukkan sifat amfoter, silikon menjadi metaloid, lalu fosfor, belerang, dan klorin adalah nonlogam dengan reaktivitas menurun ke arah argon.',
    ],
    sections: [
      {
        heading: 'Pengisian kulit',
        paragraphs: [
          'Unsur periode 3 mengisi orbital 3s dan 3p. Argon mencapai 3s²3p⁶ dan menjadi gas mulia. Orbital 3d belum terisi pada periode ini, sehingga jumlah unsur tetap delapan.',
          'Kemungkinan ekspansi oktet muncul mulai periode 3 karena orbital d tersedia, misalnya pada senyawa sulfur seperti SF₆.',
        ],
      },
      {
        heading: 'Tren sifat',
        paragraphs: [
          'Elektronegativitas naik dari natrium ke klorin, sedangkan oksida berubah dari basa (Na₂O, MgO) menjadi amfoter (Al₂O₃) lalu asam (SiO₂, P₄O₁₀, SO₂).',
          'Klorin membentuk asam kuat HCl, sedangkan argon praktis tidak bereaksi. Perbedaan ini menjadi contoh jelas hubungan posisi dan sifat kimia.',
        ],
      },
    ],
  },
  4: {
    description:
      'Periode 4 berisi 18 unsur: blok s, 3d, dan p. Tempat logam transisi pertama dan deret kimia industri seperti besi.',
    intro: [
      'Periode 4 adalah periode pertama yang memuat logam transisi, dari skandium sampai seng. Totalnya 18 unsur, dimulai dari kalium dan diakhiri kripton.',
      'Di sinilah muncul keragaman bilangan oksidasi, warna senyawa, dan sifat magnetik yang menjadi ciri blok d. Besi, tembaga, nikel, dan seng — empat logam paling banyak dipakai industri — semuanya ada di periode ini.',
    ],
    sections: [
      {
        heading: 'Urutan pengisian',
        paragraphs: [
          'Setelah 4s terisi pada kalium dan kalsium, elektron masuk ke orbital 3d dari skandium hingga seng, lalu kembali ke 4p pada galium hingga kripton. Urutan ini mengikuti aturan Aufbau, dengan pengecualian krom dan tembaga.',
          'Krom memiliki konfigurasi [Ar] 3d⁵ 4s¹ dan tembaga [Ar] 3d¹⁰ 4s¹ karena konfigurasi setengah penuh dan penuh lebih stabil.',
        ],
      },
      {
        heading: 'Tren sifat',
        paragraphs: [
          'Jari-jari atom mengecil dari kalium ke kripton, tetapi penurunannya tidak rata: pada blok d hampir datar karena elektron masuk ke kulit dalam. Elektronegativitas umumnya naik, meski logam transisi memiliki nilai serupa.',
          'Titik leleh logam transisi periode 4 tinggi karena ikatan logam kuat; tungsten di periode 6 bahkan lebih tinggi. Sebaliknya, kalium dan kalsium jauh lebih lunak.',
        ],
      },
    ],
  },
  5: {
    description:
      'Periode 5 berisi 18 unsur dari rubidium sampai xenon, termasuk logam mulia dan unsur beracun seperti kadmium.',
    intro: [
      'Periode 5 memuat 18 unsur, dari rubidium hingga xenon. Polanya mirip periode 4, dengan blok 4d yang terisi di tengah dan dihuni logam seperti perak, kadmium, dan indium.',
      'Beberapa unsur periode ini punya peran khas: perak sebagai konduktor terbaik, xenon pada lampu dan anestesi, serta kadmium yang bermanfaat tetapi beracun.',
    ],
    sections: [
      {
        heading: 'Pengisian kulit',
        paragraphs: [
          'Elektron mengisi 5s, kemudian 4d, lalu 5p. Perak dan kadmium menjadi contoh pengecualian konfigurasi karena orbital d yang penuh lebih stabil.',
          'Setelah 5s dan 4d terisi, orbital 5p diisi dari indium hingga xenon, menghasilkan logam pascatransisi dan nonlogam.',
        ],
      },
      {
        heading: 'Tren sifat',
        paragraphs: [
          'Reaktivitas logam alkali pada periode ini meningkat dibanding periode 4 karena jari-jari lebih besar. Sebaliknya, nonlogam seperti iodin lebih besar dan kurang reaktif daripada klorin.',
          'Sifat logam makin kuat di tengah periode, terlihat dari titik leleh tinggi molibdenum dan rutenium, lalu menurun menjelang kadmium dan indium.',
        ],
      },
    ],
  },
  6: {
    description:
      'Periode 6 berisi 32 unsur: blok 4f (lantanida), 5d, dan 6p, termasuk emas, merkuri, dan timbal.',
    intro: [
      'Periode 6 adalah periode terpanjang pertama dengan 32 unsur, dari sesium sampai radon. Di tengahnya terselip deret lantanida yang mengisi orbital 4f, sehingga tabel periodik memecahnya ke baris terpisah.',
      'Unsur-unsur terkenal di periode ini antara lain emas, merkuri, timbal, dan bismut. Emas dan merkuri menunjukkan sifat blok d yang dipengaruhi kontraksi lantanida.',
    ],
    sections: [
      {
        heading: 'Pengisian kulit',
        paragraphs: [
          'Setelah 6s terisi, elektron masuk ke 4f dari serium hingga lutesium, lalu ke 5d, dan akhirnya 6p. Karena orbital 4f sangat dalam, lantanida memiliki sifat kimia yang sangat mirip.',
          'Kontraksi lantanida membuat jari-jari atom setelah lantanida lebih kecil dari perkiraan, sehingga emas memiliki kerapatan tinggi dan sifat tidak reaktif.',
        ],
      },
      {
        heading: 'Tren sifat',
        paragraphs: [
          'Sesium dan barium sangat reaktif, sedangkan emas dan platina di blok d sangat stabil. Timbal di ujung blok p memiliki bilangan oksidasi +2 yang lebih stabil daripada +4 karena efek pasangan inert.',
        ],
      },
    ],
  },
  7: {
    description:
      'Periode 7 berisi 32 unsur dari fransium sampai oganeson: deret aktinida dan unsur sintetis terberat.',
    intro: [
      'Periode 7 memuat 32 unsur, dimulai dari fransium dan diakhiri oganeson. Sebagian besar unsurnya sangat radioaktif atau hanya dapat dibuat di laboratorium dengan waktu paruh singkat.',
      'Deret aktinida mengisi orbital 5f, lalu 6d dan 7p. Unsur di ujung periode, seperti tenesin dan oganeson, hanya pernah teramati dalam jumlah atom dan sifat kimianya masih diteliti.',
    ],
    sections: [
      {
        heading: 'Pengisian kulit',
        paragraphs: [
          'Konfigurasi aktinida mengikuti pola 7s, 6d, 5f, kemudian 7p. Uranium dan plutonium memiliki elektron 5f yang terlibat dalam ikatan, membuat bilangan oksidasinya lebih beragam daripada lantanida.',
          'Relativitas berpengaruh kuat pada unsur superberat, mengubah sifat kimia yang diperkirakan dari posisi golongan.',
        ],
      },
      {
        heading: 'Tren sifat',
        paragraphs: [
          'Fransium sangat tidak stabil sehingga sulit dipelajari. Radium bersifat radioaktif kuat, sedangkan aktinida menampilkan reaktivitas tinggi dan kimia yang kompleks.',
          'Unsur transuranium dibuat lewat reaksi nuklir dan tidak tersedia di alam dalam jumlah berarti.',
        ],
      },
    ],
  },
};

function memberLinks(elements: GuideElement[], category: ElementCategory): GuideLink[] {
  return elements
    .filter((element) => element.category === category)
    .sort((a, b) => a.z - b.z)
    .map((element) => ({
      path: elementPath(element.symbol),
      label: `${element.name} (${element.symbol})`,
      hint: `nomor atom ${element.z}`,
    }));
}

function categoryFacts(elements: GuideElement[], category: ElementCategory): GuideFact[] {
  const members = elements.filter((element) => element.category === category);
  const states = new Set(members.map((element) => STATE_LABELS[element.stateSTP] ?? element.stateSTP));
  return [
    { label: 'Jumlah unsur', value: String(members.length) },
    { label: 'Rentang nomor atom', value: `${members[0]?.z ?? '—'}–${members[members.length - 1]?.z ?? '—'}` },
    { label: 'Wujud pada suhu kamar', value: [...states].join(', ') },
  ];
}

function buildGroupPages(elements: GuideElement[], site: string): GuidePage[] {
  return CATEGORY_ORDER.map((category) => {
    const copy = GROUP_COPY[category];
    const slug = CATEGORY_SLUGS[category];
    const members = memberLinks(elements, category);
    const path = `/golongan/${slug}`;
    const label = CATEGORY_LABELS[category];
    return {
      path,
      title: copy.title,
      description: copy.description,
      heading: copy.heading,
      intro: copy.intro,
      facts: [...copy.facts, ...categoryFacts(elements, category)],
      sections: [
        ...copy.sections,
        {
          heading: `Daftar ${label.toLowerCase()}`,
          paragraphs: [
            `${members.length} unsur tergolong ${label.toLowerCase()} menurut pengelompokan PeriodikLab. Buka salah satu untuk melihat nomor atom, massa, konfigurasi elektron, dan sifat terukurnya.`,
          ],
          list: members,
        },
      ],
      groups: [
        {
          heading: 'Golongan lain',
          items: CATEGORY_ORDER.filter((item) => item !== category).map((item) => ({
            path: groupPath(item),
            label: CATEGORY_LABELS[item],
            hint: CATEGORY_GROUP_RANGE[item],
          })),
        },
        {
          heading: 'Jelajahi lebih lanjut',
          items: [
            { path: '/daftar-unsur', label: 'Indeks 118 unsur' },
            { path: '/konfigurasi-elektron', label: 'Konfigurasi elektron' },
            { path: '/tanya-jawab', label: 'Tanya jawab kimia' },
          ],
        },
      ],
      breadcrumb: [
        { name: 'Tabel periodik', path: '/' },
        { name: 'Golongan', path: '/daftar-unsur' },
        { name: label, path },
      ],
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: copy.heading,
          description: copy.description,
          url: `${site}${path}`,
          inLanguage: 'id',
          isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
          hasPart: members.map((item) => ({
            '@type': 'ChemicalSubstance',
            name: item.label,
            url: `${site}${item.path}`,
          })),
        },
      ],
    };
  });
}

function buildPeriodPages(elements: GuideElement[], site: string): GuidePage[] {
  return [1, 2, 3, 4, 5, 6, 7].map((period) => {
    const copy = PERIOD_COPY[period];
    const members = elements
      .filter((element) => element.period === period)
      .sort((a, b) => a.z - b.z);
    const path = `/periode/${period}`;
    return {
      path,
      title: `Periode ${period} Tabel Periodik: Unsur dan Trennya | PeriodikLab`,
      description: copy.description,
      heading: `Periode ${period} Tabel Periodik`,
      intro: copy.intro,
      facts: [
        { label: 'Jumlah unsur', value: String(members.length) },
        { label: 'Rentang nomor atom', value: members.length ? `${members[0].z}–${members[members.length - 1].z}` : '—' },
        { label: 'Kulit yang diisi', value: period === 1 ? 'K' : `${'KLMNOPQ'[period - 1]}` },
      ],
      sections: [
        ...copy.sections,
        {
          heading: `Unsur pada periode ${period}`,
          list: members.map((element) => ({
            path: elementPath(element.symbol),
            label: `${element.name} (${element.symbol})`,
            hint: `nomor atom ${element.z} · ${CATEGORY_LABELS[element.category]}`,
          })),
        },
      ],
      groups: [
        {
          heading: 'Periode lain',
          items: [1, 2, 3, 4, 5, 6, 7]
            .filter((item) => item !== period)
            .map((item) => ({
              path: periodPath(item),
              label: `Periode ${item}`,
              hint: `${elements.filter((element) => element.period === item).length} unsur`,
            })),
        },
        {
          heading: 'Jelajahi lebih lanjut',
          items: [
            { path: '/daftar-unsur', label: 'Indeks 118 unsur' },
            { path: '/konfigurasi-elektron', label: 'Konfigurasi elektron' },
            { path: '/golongan/logam-transisi', label: 'Logam transisi' },
          ],
        },
      ],
      breadcrumb: [
        { name: 'Tabel periodik', path: '/' },
        { name: 'Periode', path: '/daftar-unsur' },
        { name: `Periode ${period}`, path },
      ],
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Periode ${period} tabel periodik`,
          description: copy.description,
          url: `${site}${path}`,
          inLanguage: 'id',
          isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
          hasPart: members.map((element) => ({
            '@type': 'ChemicalSubstance',
            name: `${element.name} (${element.symbol})`,
            url: `${site}${elementPath(element.symbol)}`,
          })),
        },
      ],
    };
  });
}

const FAQ_ITEMS: GuideFaq[] = [
  {
    question: 'Apa itu tabel periodik?',
    answer:
      'Tabel periodik adalah susunan semua unsur kimia menurut nomor atom, disusun dalam baris (periode) dan kolom (golongan). Unsur dengan sifat mirip berada pada golongan yang sama, sehingga tabel ini menjadi peta hubungan sifat dan reaktivitas unsur.',
  },
  {
    question: 'Bagaimana cara membaca nomor atom dan massa atom?',
    answer:
      'Nomor atom adalah jumlah proton dalam inti dan menentukan identitas unsur; pada atom netral jumlahnya sama dengan elektron. Massa atom relatif adalah rata-rata massa isotop unsur dalam satuan u, sehingga biasanya berupa angka desimal.',
  },
  {
    question: 'Apa perbedaan golongan dan periode?',
    answer:
      'Golongan adalah kolom vertikal yang menyatukan unsur dengan jumlah elektron valensi serupa, misalnya golongan 17 untuk halogen. Periode adalah baris horizontal yang menunjukkan kulit elektron utama yang sedang diisi, dari periode 1 hingga 7.',
  },
  {
    question: 'Mengapa unsur dalam satu golongan memiliki sifat mirip?',
    answer:
      'Karena mereka memiliki jumlah elektron valensi yang sama. Elektron valensi menentukan cara atom berikatan, sehingga litium dan natrium sama-sama mudah membentuk ion +1, sedangkan fluorin dan klorin sama-sama mudah membentuk ion −1.',
  },
  {
    question: 'Apa itu konfigurasi elektron?',
    answer:
      'Konfigurasi elektron adalah susunan elektron pada orbital atom, misalnya 1s² 2s² 2p⁶ untuk neon. Susunan ini menjelaskan kestabilan, warna, kemagnetan, dan kecenderungan unsur bereaksi.',
  },
  {
    question: 'Apa arti [Ar] dalam konfigurasi elektron?',
    answer:
      'Tanda [Ar] adalah singkatan untuk konfigurasi argon, yaitu 1s² 2s² 2p⁶ 3s² 3p⁶. Penulisan ini mempersingkat konfigurasi unsur yang lebih berat, misalnya besi ditulis [Ar] 3d⁶ 4s².',
  },
  {
    question: 'Mengapa gas mulia sukar bereaksi?',
    answer:
      'Karena kulit terluarnya sudah terisi penuh, sehingga energi ionisasi tinggi dan tidak ada keuntungan energi dari membentuk ikatan. Meski begitu, xenon dapat membentuk senyawa dengan fluorin seperti XeF₂ pada kondisi khusus.',
  },
  {
    question: 'Apa itu isotop?',
    answer:
      'Isotop adalah atom dari unsur yang sama dengan jumlah proton sama tetapi jumlah neutron berbeda. Contohnya karbon-12 dan karbon-14; keduanya karbon, tetapi massa dan kestabilan intinya berbeda.',
  },
  {
    question: 'Apa bedanya logam, nonlogam, dan metaloid?',
    answer:
      'Logam menghantarkan listrik dan panas, mengilap, serta mudah ditempa. Nonlogam umumnya isolator dan rapuh. Metaloid berada di antaranya dan bersifat semikonduktor, seperti silikon yang menjadi dasar chip komputer.',
  },
  {
    question: 'Apakah PeriodikLab gratis dan bisa dipakai offline?',
    answer:
      'Ya. PeriodikLab tidak memerlukan akun, tidak menampilkan iklan, dan bisa dipasang sebagai aplikasi (PWA). Setelah dibuka sekali, tabel periodik, laboratorium reaksi, dan tantangan tetap dapat diakses tanpa koneksi internet.',
  },
];

function buildFaqPage(site: string): GuidePage {
  return {
    path: '/tanya-jawab',
    title: 'Tanya Jawab Kimia: Tabel Periodik & Elektron | PeriodikLab',
    description:
      'Sepuluh pertanyaan umum tentang tabel periodik, golongan, periode, konfigurasi elektron, isotop, dan gas mulia — dijawab singkat.',
    heading: 'Tanya Jawab Kimia Dasar',
    intro: [
      'Kumpulan pertanyaan yang paling sering muncul saat belajar tabel periodik. Setiap jawaban dibuat ringkas agar mudah dipakai untuk mengulang materi sebelum ujian.',
      'Jika kamu ingin melihat langsung, setiap jawaban bisa ditelusuri ke halaman unsur atau golongan terkait di PeriodikLab.',
    ],
    faq: FAQ_ITEMS,
    groups: [
      {
        heading: 'Lanjut belajar',
        items: [
          { path: '/daftar-unsur', label: 'Indeks 118 unsur' },
          { path: '/konfigurasi-elektron', label: 'Konfigurasi elektron' },
          { path: '/golongan/logam-alkali', label: 'Logam alkali' },
          { path: '/golongan/gas-mulia', label: 'Gas mulia' },
        ],
      },
    ],
    breadcrumb: [
      { name: 'Tabel periodik', path: '/' },
      { name: 'Tanya jawab', path: '/tanya-jawab' },
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        url: `${site}/tanya-jawab`,
        inLanguage: 'id',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

function buildListPage(elements: GuideElement[], site: string): GuidePage {
  const sorted = [...elements].sort((a, b) => a.z - b.z);
  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: sorted.filter((element) => element.category === category),
  }));

  return {
    path: '/daftar-unsur',
    title: 'Daftar 118 Unsur Kimia Lengkap dan Terurut | PeriodikLab',
    description:
      'Indeks 118 unsur kimia: daftar menurut nomor atom, pengelompokan golongan, dan tautan ke halaman tiap unsur beserta sifatnya.',
    heading: 'Daftar 118 Unsur Kimia',
    intro: [
      'Halaman ini memuat seluruh unsur yang ada di PeriodikLab, diurutkan menurut nomor atom. Setiap tautan menuju halaman unsur berisi massa atom, konfigurasi elektron, wujud pada suhu kamar, dan sifat terukurnya.',
      'Gunakan indeks ini sebagai titik masuk cepat ketika kamu hanya ingat nama atau simbol unsur, tanpa harus menggulir tabel periodik interaktif.',
    ],
    facts: [
      { label: 'Jumlah unsur', value: String(sorted.length) },
      { label: 'Golongan', value: '18' },
      { label: 'Periode', value: '7' },
      { label: 'Kategori', value: String(CATEGORY_ORDER.length) },
    ],
    sections: [
      {
        heading: 'Urut nomor atom',
        list: sorted.map((element) => ({
          path: elementPath(element.symbol),
          label: `${element.z}. ${element.name} (${element.symbol})`,
          hint: `${CATEGORY_LABELS[element.category]} · ${element.electronConfig}`,
        })),
      },
      ...byCategory
        .filter((group) => group.items.length > 0)
        .map((group) => ({
          heading: `${CATEGORY_LABELS[group.category]} (${group.items.length})`,
          list: group.items.map((element) => ({
            path: elementPath(element.symbol),
            label: `${element.name} (${element.symbol})`,
            hint: `nomor atom ${element.z}`,
          })),
        })),
    ],
    groups: [
      {
        heading: 'Lihat menurut golongan',
        items: CATEGORY_ORDER.map((category) => ({
          path: groupPath(category),
          label: CATEGORY_LABELS[category],
          hint: CATEGORY_GROUP_RANGE[category],
        })),
      },
      {
        heading: 'Lihat menurut periode',
        items: [1, 2, 3, 4, 5, 6, 7].map((period) => ({
          path: periodPath(period),
          label: `Periode ${period}`,
          hint: `${elements.filter((element) => element.period === period).length} unsur`,
        })),
      },
      {
        heading: 'Bacaan lain',
        items: [
          { path: '/konfigurasi-elektron', label: 'Konfigurasi elektron semua unsur' },
          { path: '/tanya-jawab', label: 'Tanya jawab kimia dasar' },
          { path: '/', label: 'Tabel periodik interaktif' },
        ],
      },
    ],
    breadcrumb: [
      { name: 'Tabel periodik', path: '/' },
      { name: 'Daftar unsur', path: '/daftar-unsur' },
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Daftar 118 unsur kimia',
        description:
          'Indeks lengkap 118 unsur kimia beserta nomor atom, kategori, dan konfigurasi elektron.',
        url: `${site}/daftar-unsur`,
        inLanguage: 'id',
        isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: sorted.length,
          itemListElement: sorted.map((element, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `${element.name} (${element.symbol})`,
            url: `${site}${elementPath(element.symbol)}`,
          })),
        },
      },
    ],
  };
}

function buildConfigPage(elements: GuideElement[], site: string): GuidePage {
  const sorted = [...elements].sort((a, b) => a.z - b.z);
  return {
    path: '/konfigurasi-elektron',
    title: 'Konfigurasi Elektron 118 Unsur & Aturan Aufbau | PeriodikLab',
    description:
      'Cara menulis konfigurasi elektron, urutan pengisian orbital, pengecualian krom dan tembaga, plus daftar konfigurasi 118 unsur.',
    heading: 'Konfigurasi Elektron dan Aturan Aufbau',
    intro: [
      'Konfigurasi elektron menunjukkan sebaran elektron pada orbital atom. Penulisannya mengikuti aturan Aufbau: orbital dengan energi lebih rendah diisi lebih dulu, dengan memperhatikan kapasitas setiap subkulit (s = 2, p = 6, d = 10, f = 14).',
      'Urutan pengisian yang biasa dipakai adalah 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p, 7s, 5f, 6d, 7p. Setelah terisi, penulisan dirapikan menurut nomor kulit.',
    ],
    facts: [
      { label: 'Aturan utama', value: 'Aufbau, Pauli, Hund' },
      { label: 'Kapasitas orbital', value: 's2 p6 d10 f14' },
      { label: 'Unsur terdaftar', value: String(sorted.length) },
      { label: 'Pengecualian umum', value: 'Cr, Cu, Nb, Mo, Ru, Rh, Pd, Ag' },
    ],
    sections: [
      {
        heading: 'Tiga aturan dasar',
        items: [
          {
            label: 'Aufbau',
            value: 'Elektron mengisi orbital dari energi terendah ke tertinggi.',
          },
          {
            label: 'Larangan Pauli',
            value: 'Satu orbital maksimal berisi dua elektron dengan spin berlawanan.',
          },
          {
            label: 'Aturan Hund',
            value: 'Pada subkulit yang setara, elektron menempati orbital berbeda dengan spin sejajar sebelum berpasangan.',
          },
        ],
      },
      {
        heading: 'Mengapa ada pengecualian',
        paragraphs: [
          'Konfigurasi dengan subkulit setengah penuh (d⁵) atau penuh (d¹⁰) lebih stabil secara energi. Karena itu krom ditulis [Ar] 3d⁵ 4s¹, bukan [Ar] 3d⁴ 4s², dan tembaga ditulis [Ar] 3d¹⁰ 4s¹.',
          'Pengecualian serupa muncul pada beberapa logam transisi periode 5 dan 6. Tabel di bawah memakai konfigurasi yang lazim dipakai buku teks dan data NIST.',
        ],
      },
      {
        heading: 'Hubungan dengan blok tabel periodik',
        paragraphs: [
          'Unsur blok s mengisi orbital s, blok p mengisi orbital p, blok d mengisi orbital d, dan blok f mengisi orbital f. Posisi blok menjelaskan mengapa lantanida dan aktinida dipisahkan ke baris bawah: orbital f baru terisi setelah orbital s di kulit luar.',
        ],
      },
      {
        heading: `Konfigurasi ${sorted.length} unsur`,
        items: sorted.map((element) => ({
          label: `${element.z}. ${element.symbol} — ${element.name}`,
          value: element.electronConfig,
        })),
      },
    ],
    groups: [
      {
        heading: 'Bacaan terkait',
        items: [
          { path: '/daftar-unsur', label: 'Indeks 118 unsur' },
          { path: '/golongan/logam-transisi', label: 'Logam transisi dan orbital d' },
          { path: '/golongan/lantanida', label: 'Lantanida dan orbital f' },
          { path: '/tanya-jawab', label: 'Tanya jawab kimia dasar' },
        ],
      },
    ],
    breadcrumb: [
      { name: 'Tabel periodik', path: '/' },
      { name: 'Konfigurasi elektron', path: '/konfigurasi-elektron' },
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: 'Konfigurasi elektron dan aturan Aufbau',
        description:
          'Penjelasan aturan Aufbau, Pauli, Hund, pengecualian konfigurasi, serta daftar konfigurasi elektron 118 unsur.',
        url: `${site}/konfigurasi-elektron`,
        inLanguage: 'id',
        learningResourceType: 'Referensi',
        educationalLevel: 'Sekolah menengah',
        isAccessibleForFree: true,
        about: { '@type': 'Thing', name: 'Konfigurasi elektron' },
        isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
      },
    ],
  };
}

/** Semua halaman pendukung yang dibangun dari data unsur. */
export function buildGuidePages(elements: GuideElement[], site: string): GuidePage[] {
  return [
    buildListPage(elements, site),
    buildConfigPage(elements, site),
    buildFaqPage(site),
    ...buildGroupPages(elements, site),
    ...buildPeriodPages(elements, site),
  ];
}

const fmt = (value: number | null | undefined, unit = '', digits = 1): string | null =>
  value == null ? null : `${value.toLocaleString('id-ID', { maximumFractionDigits: digits })}${unit}`;

/** Bagian tambahan untuk halaman unsur yang punya konten mendalam. */
export function elementDetailSections(
  element: GuideElement,
  detail: ElementDetail | undefined,
): GuideSection[] {
  const sections: GuideSection[] = [];
  if (detail) {
    sections.push({ heading: 'Kegunaan', paragraphs: detail.uses });
    sections.push({ heading: 'Sifat penting', paragraphs: detail.properties });
    sections.push({ heading: 'Sejarah penemuan', paragraphs: [detail.history] });
    sections.push({
      heading: 'Senyawa umum',
      items: detail.compounds.map((compound) => ({
        label: `${compound.formula} — ${compound.name}`,
        value: compound.note,
      })),
    });
  }

  const measured: GuideFact[] = [
    { label: 'Titik leleh', value: fmt(element.meltingK, ' K') ?? '—' },
    { label: 'Titik didih', value: fmt(element.boilingK, ' K') ?? '—' },
    { label: 'Massa jenis', value: fmt(element.densityGcm3, ' g/cm³', 3) ?? '—' },
    { label: 'Elektronegativitas', value: fmt(element.electronegativity, '', 2) ?? '—' },
    { label: 'Jari-jari atom', value: fmt(element.atomicRadiusPm, ' pm', 0) ?? '—' },
    { label: 'Energi ionisasi pertama', value: fmt(element.ionizationKJmol, ' kJ/mol') ?? '—' },
  ];
  sections.push({ heading: 'Data terukur', items: measured });

  if (element.oxidationStates?.length) {
    sections.push({
      heading: 'Bilangan oksidasi umum',
      paragraphs: [
        `Bilangan oksidasi yang lazim untuk ${element.name}: ${element.oxidationStates
          .map((state) => (state > 0 ? `+${state}` : String(state)))
          .join(', ')}.`,
      ],
    });
  }

  return sections;
}

export const guidePaths = (): string[] => [
  '/daftar-unsur',
  '/konfigurasi-elektron',
  '/tanya-jawab',
  ...CATEGORY_ORDER.map((category) => groupPath(category)),
  ...([1, 2, 3, 4, 5, 6, 7] as const).map((period) => periodPath(period)),
];

export { elementDetails };
export { CATEGORY_LABELS, CATEGORY_ORDER, groupPath, periodPath };
