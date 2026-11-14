/**
 * Konten tambahan untuk 20 unsur yang paling sering dicari.
 * Ringkasan umum tetap berada di elements.json; berkas ini menambah
 * kegunaan, sifat, sejarah, dan senyawa penting agar halaman unsur
 * punya kedalaman yang cukup untuk pertanyaan long-tail.
 */
export interface ElementCompound {
  formula: string;
  name: string;
  note: string;
}

export interface ElementDetail {
  uses: string[];
  properties: string[];
  history: string;
  compounds: ElementCompound[];
}

export const elementDetails: Record<string, ElementDetail> = {
  H: {
    uses: [
      'Bahan baku amonia dan metanol lewat proses Haber–Bosch',
      'Sel bahan bakar yang mengubah hidrogen menjadi listrik tanpa emisi CO₂',
      'Hidrogenasi minyak nabati menjadi margarin dan shortening',
      'Pendingin kriogenik untuk magnet MRI dan akselerator partikel',
    ],
    properties: [
      'Gas paling ringan; massa jenisnya sekitar 1/14 massa jenis udara',
      'Mudah terbakar dan membentuk campuran eksplosif dengan oksigen pada rentang lebar',
      'Titik didih hanya 20,28 K sehingga mudah menguap pada suhu kamar',
      'Menyerap neutron lambat, karena itu dipakai sebagai moderator di beberapa reaktor',
    ],
    history:
      'Henry Cavendish mengenali hidrogen sebagai gas tersendiri pada 1766. Antoine Lavoisier memberi nama hidrogène — pembentuk air — pada 1783 setelah membuktikan bahwa pembakaran hidrogen menghasilkan air.',
    compounds: [
      { formula: 'H₂O', name: 'Air', note: 'Pelarut universal dan komponen utama tubuh makhluk hidup.' },
      { formula: 'NH₃', name: 'Amonia', note: 'Bahan baku pupuk nitrogen; diproduksi lewat proses Haber–Bosch.' },
      { formula: 'HCl', name: 'Asam klorida', note: 'Asam kuat yang juga diproduksi lambung untuk mencerna makanan.' },
      { formula: 'CH₄', name: 'Metana', note: 'Gas alam utama, sumber energi dan gas rumah kaca.' },
    ],
  },
  C: {
    uses: [
      'Baja dan besi tuang, dengan kadar karbon sebagai penentu kekerasan',
      'Grafit untuk elektrode, pensil, dan bahan pelumas kering',
      'Intan sintetis untuk mata bor, gergaji, dan abrasif',
      'Karbon aktif untuk menyaring air, gas, dan limbah cair',
    ],
    properties: [
      'Membentuk empat ikatan kovalen, sehingga punya alotrop yang sangat beragam',
      'Grafit menghantarkan listrik; intan justru isolator terbaik',
      'Sublimasi pada sekitar 3.900 K pada tekanan atmosfer',
      'Intan adalah mineral alami paling keras, sedangkan grafit sangat lunak',
    ],
    history:
      'Karbon dikenal sejak zaman purba sebagai arang, jelaga, dan intan. Pada 1772 Lavoisier membuktikan intan tersusun dari karbon, dan pada abad ke-20 difraksi sinar-X mengungkap perbedaan struktur grafit dan intan.',
    compounds: [
      { formula: 'CO₂', name: 'Karbon dioksida', note: 'Hasil respirasi dan pembakaran; terlibat dalam siklus karbon.' },
      { formula: 'CH₄', name: 'Metana', note: 'Hidrokarbon paling sederhana dengan satu atom karbon.' },
      { formula: 'CaCO₃', name: 'Kalsium karbonat', note: 'Batu kapur, marmer, dan cangkang kerang.' },
      { formula: 'C₆H₁₂O₆', name: 'Glukosa', note: 'Gula sederhana hasil fotosintesis dan bahan bakar sel.' },
    ],
  },
  N: {
    uses: [
      'Gas pengisi kemasan makanan agar tidak teroksidasi',
      'Bahan baku pupuk, asam nitrat, dan bahan peledak',
      'Pendingin cair untuk menyimpan sampel biologis dan sperma',
      'Atmosfer inert pada pengelasan dan penyimpanan bahan mudah terbakar',
    ],
    properties: [
      'Menyusun sekitar 78% volume udara kering',
      'Ikatan rangkap tiga N≡N sangat kuat, membuat gas N₂ relatif inert',
      'Tidak berwarna, tidak berbau, dan sedikit lebih ringan dari udara',
      'Cair pada 77 K sehingga dipakai sebagai pendingin kriogenik',
    ],
    history:
      'Daniel Rutherford mengisolasi nitrogen pada 1772 setelah menemukan gas yang tersisa saat karbon dioksida diserap. Lavoisier menyebutnya azote, lalu nama nitrogen dipakai karena ia membentuk nitrat.',
    compounds: [
      { formula: 'NH₃', name: 'Amonia', note: 'Senyawa nitrogen paling penting secara industri.' },
      { formula: 'HNO₃', name: 'Asam nitrat', note: 'Digunakan untuk pupuk dan pelarut logam mulia.' },
      { formula: 'NO₂', name: 'Nitrogen dioksida', note: 'Gas cokelat kemerahan, polutan udara dan komponen asap.' },
      { formula: 'N₂O', name: 'Dinitrogen oksida', note: 'Gas tertawa, dipakai sebagai anestesi ringan.' },
    ],
  },
  O: {
    uses: [
      'Terapi oksigen dan dukungan napas di rumah sakit',
      'Pembakaran pada pengelasan dan pemotongan baja',
      'Bahan baku pembuatan baja lewat proses oksigen dasar',
      'Pengolahan air limbah dan pemutih ramah lingkungan',
    ],
    properties: [
      'Gas pendukung pembakaran; tidak membakar sendiri',
      'Menyusun sekitar 21% volume udara kering',
      'Bersifat paramagnetik dalam bentuk molekul O₂',
      'Titik didih 90 K, sehingga mudah dicairkan untuk penyimpanan',
    ],
    history:
      'Carl Wilhelm Scheele dan Joseph Priestley berhasil mengisolasi oksigen pada awal 1770-an. Lavoisier menjelaskan perannya dalam pembakaran dan memberi nama oxygène pada 1777.',
    compounds: [
      { formula: 'H₂O', name: 'Air', note: 'Senyawa paling melimpah di permukaan bumi.' },
      { formula: 'CO₂', name: 'Karbon dioksida', note: 'Produk respirasi dan pembakaran sempurna.' },
      { formula: 'Fe₂O₃', name: 'Besi(III) oksida', note: 'Karat merah dan bijih hematit.' },
      { formula: 'SiO₂', name: 'Silikon dioksida', note: 'Kuarsa dan pasir, bahan dasar kaca.' },
    ],
  },
  Na: {
    uses: [
      'Pendingin pada reaktor nuklir cepat karena titik didihnya tinggi',
      'Lampu uap natrium untuk penerangan jalan',
      'Reduktor dalam pembuatan logam titanium dan zirkonium',
      'Reagen pada sintesis kimia organik',
    ],
    properties: [
      'Logam lunak berwarna perak yang bisa dipotong dengan pisau',
      'Bereaksi hebat dengan air menghasilkan hidrogen dan panas',
      'Titik lebur rendah, 371 K, sehingga mudah meleleh',
      'Disimpan dalam minyak mineral atau argon agar tidak teroksidasi',
    ],
    history:
      'Humphry Davy mengisolasi natrium pada 1807 lewat elektrolisis natrium hidroksida. Nama natrium berasal dari soda, sedangkan symbol Na dari kata Latin natrium.',
    compounds: [
      { formula: 'NaCl', name: 'Natrium klorida', note: 'Garam dapur, sumber utama natrium dan klorin.' },
      { formula: 'NaOH', name: 'Natrium hidroksida', note: 'Basa kuat untuk pembuatan sabun dan kertas.' },
      { formula: 'NaHCO₃', name: 'Natrium bikarbonat', note: 'Soda kue untuk pengembang dan penetral asam.' },
      { formula: 'Na₂CO₃', name: 'Natrium karbonat', note: 'Bahan pembuatan kaca dan deterjen.' },
    ],
  },
  Mg: {
    uses: [
      'Paduan ringan untuk bodi pesawat, mobil, dan laptop',
      'Kembang api dan flare karena menyala putih terang',
      'Suplemen magnesium untuk kesehatan otot dan saraf',
      'Anode korban untuk melindungi pemanas air dari korosi',
    ],
    properties: [
      'Logam ringan dengan massa jenis sekitar dua pertiga aluminium',
      'Terbakar dengan nyala putih menyilaukan; sulit dipadamkan air',
      'Lapisan magnesium oksida tipis melindungi permukaan dari korosi lanjut',
      'Titik lebur 923 K, cukup rendah untuk pengecoran mudah',
    ],
    history:
      'Humphry Davy mengisolasi magnesium pada 1808. Namanya diambil dari Magnesia, wilayah di Thessalia, Yunani, tempat senyawa magnesium pertama kali ditemukan.',
    compounds: [
      { formula: 'MgO', name: 'Magnesium oksida', note: 'Bahan refraktori tungku dan suplemen antasida.' },
      { formula: 'MgCl₂', name: 'Magnesium klorida', note: 'Komponen garam laut dan bahan penghilang es.' },
      { formula: 'MgSO₄', name: 'Magnesium sulfat', note: 'Garam Epsom untuk relaksasi otot dan pupuk.' },
      { formula: 'Mg(OH)₂', name: 'Magnesium hidroksida', note: 'Antasida dan bahan tahan api.' },
    ],
  },
  Al: {
    uses: [
      'Bodi, rangka, dan velg kendaraan',
      'Kaleng minuman serta foil pembungkus makanan',
      'Kabel listrik tegangan tinggi karena ringan',
      'Fasad bangunan, jendela, dan peralatan rumah tangga',
    ],
    properties: [
      'Ringan, sekitar sepertiga massa jenis baja',
      'Lapisan aluminium oksida tipis melindungi dari korosi',
      'Konduktor listrik dan panas yang baik',
      'Tidak beracun sehingga aman untuk kemasan makanan',
    ],
    history:
      'Hans Christian Ørsted memisahkan aluminium pada 1825, tetapi baru pada 1886 Charles Martin Hall dan Paul Héroult menemukan elektrolisis murah yang membuat aluminium jadi logam sehari-hari.',
    compounds: [
      { formula: 'Al₂O₃', name: 'Aluminium oksida', note: 'Bijih bauksit dan bahan abrasif korundum.' },
      { formula: 'AlCl₃', name: 'Aluminium klorida', note: 'Katalis pada reaksi Friedel–Crafts.' },
      { formula: 'Al(OH)₃', name: 'Aluminium hidroksida', note: 'Antasida dan bahan pemurni air.' },
      { formula: 'Al₂(SO₄)₃', name: 'Aluminium sulfat', note: 'Koagulan pada pengolahan air minum.' },
    ],
  },
  Si: {
    uses: [
      'Chip komputer, transistor, dan sel surya',
      'Kaca, keramik, dan semen',
      'Silikon sealant, karet sintetis, dan implan medis',
      'Paduan aluminium untuk komponen mesin',
    ],
    properties: [
      'Metaloid; konduktivitasnya naik saat dipanaskan',
      'Membentuk jaringan kovalen seperti intan, sehingga keras tetapi rapuh',
      'Unsur paling melimpah di kerak bumi setelah oksigen',
      'Kristal tunggal sangat murni dibutuhkan untuk elektronika',
    ],
    history:
      'Jöns Jacob Berzelius mengidentifikasi silikon pada 1824. Kemurnian tingkat elektronika baru tercapai pada 1950-an, membuka jalan bagi revolusi semikonduktor.',
    compounds: [
      { formula: 'SiO₂', name: 'Silikon dioksida', note: 'Pasir kuarsa dan bahan dasar kaca.' },
      { formula: 'SiC', name: 'Silikon karbida', note: 'Abrasif dan semikonduktor daya tinggi.' },
      { formula: 'Na₂SiO₃', name: 'Natrium silikat', note: 'Perekat keramik dan pengawet telur.' },
    ],
  },
  S: {
    uses: [
      'Bahan baku asam sulfat, salah satu kimia industri terbesar',
      'Vulkanisasi karet agar elastis dan tahan panas',
      'Fungisida dan pestisida di pertanian',
      'Bahan baku pupuk sulfat dan deterjen',
    ],
    properties: [
      'Padatan kuning yang tidak larut dalam air',
      'Terbakar dengan nyala biru menghasilkan sulfur dioksida',
      'Punya beberapa alotrop, termasuk belerang rombik dan monoklinik',
      'Menghantarkan listrik dengan sangat buruk',
    ],
    history:
      'Belerang dikenal sejak zaman purba sebagai bahan pemutih dan obat. Lavoisier memastikan belerang adalah unsur pada 1777, bukan senyawa.',
    compounds: [
      { formula: 'H₂SO₄', name: 'Asam sulfat', note: 'Asam industri terpenting; dipakai di hampir semua sektor.' },
      { formula: 'SO₂', name: 'Sulfur dioksida', note: 'Gas penyebab hujan asam dan bahan pengawet.' },
      { formula: 'H₂S', name: 'Hidrogen sulfida', note: 'Gas berbau telur busuk dan sangat beracun.' },
      { formula: 'CaSO₄', name: 'Kalsium sulfat', note: 'Gipsum untuk plester dan papan bangunan.' },
    ],
  },
  Cl: {
    uses: [
      'Desinfeksi air minum, kolam renang, dan air limbah',
      'Pembuatan PVC dan pelarut organik',
      'Pemutih kertas dan tekstil',
      'Bahan baku obat-obatan dan pestisida',
    ],
    properties: [
      'Gas kuning kehijauan dengan bau menyengat',
      'Oksidator kuat; bereaksi dengan banyak logam',
      'Sekitar 2,5 kali lebih berat dari udara sehingga menumpuk di ruang rendah',
      'Bersifat racun pada konsentrasi tinggi',
    ],
    history:
      'Carl Wilhelm Scheele mengisolasi klorin pada 1774. Humphry Davy membuktikannya sebagai unsur dan memberi nama chlorine pada 1810.',
    compounds: [
      { formula: 'NaCl', name: 'Natrium klorida', note: 'Garam dapur dan bahan baku klorin industri.' },
      { formula: 'HCl', name: 'Asam klorida', note: 'Asam kuat untuk pembersih logam dan pengatur pH.' },
      { formula: 'HClO', name: 'Asam hipoklorit', note: 'Zat aktif pemutih dan disinfektan.' },
      { formula: 'ClO₂', name: 'Klorin dioksida', note: 'Disinfektan air yang lebih selektif dari klorin.' },
    ],
  },
  K: {
    uses: [
      'Pupuk kalium untuk pertumbuhan tanaman',
      'Pembuatan sabun dan detergen',
      'Bahan kaca tahan panas dan keramik',
      'Elektrode pada baterai dan sel bahan bakar',
    ],
    properties: [
      'Logam alkali yang lebih reaktif daripada natrium',
      'Bereaksi sangat hebat dengan air, kadang menyala',
      'Titik lebur 336 K, lebih rendah dari natrium',
      'Disimpan dalam minyak mineral atau argon',
    ],
    history:
      'Humphry Davy mengisolasi kalium pada 1807 dari potas. Nama potassium berasal dari potash, sedangkan symbol K dari kata Latin kalium.',
    compounds: [
      { formula: 'KCl', name: 'Kalium klorida', note: 'Pupuk kalium dan pengganti garam bagi penderita hipertensi.' },
      { formula: 'KOH', name: 'Kalium hidroksida', note: 'Basa kuat untuk sabun cair.' },
      { formula: 'KNO₃', name: 'Kalium nitrat', note: 'Pupuk, pengawet makanan, dan bahan mesiu.' },
      { formula: 'K₂CO₃', name: 'Kalium karbonat', note: 'Bahan pembuatan sabun tradisional dan kaca.' },
    ],
  },
  Ca: {
    uses: [
      'Semen dan beton sebagai bahan bangunan utama',
      'Fluks pada pembuatan baja',
      'Suplemen kalsium dan penguat tulang',
      'Penetral asam pada proses industri dan pengolahan air',
    ],
    properties: [
      'Logam alkali tanah yang cukup reaktif',
      'Bereaksi dengan air menghasilkan hidrogen dan kalsium hidroksida',
      'Lapisan oksida melindungi permukaan dari korosi lanjut',
      'Titik lebur 1.115 K',
    ],
    history:
      'Humphry Davy mengisolasi kalsium pada 1808. Namanya berasal dari calx, istilah Latin untuk kapur yang diperoleh dari pembakaran batu kapur.',
    compounds: [
      { formula: 'CaCO₃', name: 'Kalsium karbonat', note: 'Batu kapur, marmer, dan bahan utama semen.' },
      { formula: 'CaO', name: 'Kalsium oksida', note: 'Kapur tohor untuk mortar dan penetral asam.' },
      { formula: 'Ca(OH)₂', name: 'Kalsium hidroksida', note: 'Kapur sirih, mortar, dan pengolahan air.' },
      { formula: 'CaSO₄', name: 'Kalsium sulfat', note: 'Gipsum untuk plester dan pengganti tulang.' },
    ],
  },
  Fe: {
    uses: [
      'Baja struktural untuk gedung, jembatan, dan rel kereta',
      'Besi tuang untuk mesin dan pipa',
      'Magnet permanen dan inti transformator',
      'Katalis pada proses Haber–Bosch dan Fischer–Tropsch',
    ],
    properties: [
      'Logam transisi yang feromagnetik pada suhu kamar',
      'Mudah berkarat di udara lembap membentuk besi oksida berlapis',
      'Membentuk ion Fe²⁺ dan Fe³⁺ dengan warna dan kereaktifan berbeda',
      'Titik lebur 1.811 K sehingga cocok untuk konstruksi',
    ],
    history:
      'Besi digunakan manusia sejak sekitar 3000 SM, awalnya dari meteorit. Kemampuan mengatur kadar karbon pada abad ke-19 menjadi kunci lahirnya baja massal dan Revolusi Industri.',
    compounds: [
      { formula: 'Fe₂O₃', name: 'Besi(III) oksida', note: 'Karat merah dan bijih hematit.' },
      { formula: 'Fe₃O₄', name: 'Besi(II,III) oksida', note: 'Magnetit, mineral magnetik alami.' },
      { formula: 'FeCl₃', name: 'Besi(III) klorida', note: 'Koagulan air dan etsa tembaga.' },
      { formula: 'FeSO₄', name: 'Besi(II) sulfat', note: 'Suplemen besi dan pengolahan krom.' },
    ],
  },
  Cu: {
    uses: [
      'Kabel listrik dan kawat telekomunikasi',
      'Pipa air, atap, dan instalasi pendingin',
      'Paduan kuningan dan perunggu',
      'Motor listrik, generator, dan papan sirkuit',
    ],
    properties: [
      'Konduktivitas listrik tertinggi setelah perak',
      'Konduktor panas yang sangat baik',
      'Tahan korosi; membentuk lapisan patina hijau pada atap tua',
      'Permukaannya bersifat antimikroba',
    ],
    history:
      'Tembaga adalah salah satu logam pertama yang dilebur manusia, sekitar 5000 SM. Paduannya dengan timah, perunggu, memberi nama Zaman Perunggu.',
    compounds: [
      { formula: 'CuSO₄', name: 'Tembaga(II) sulfat', note: 'Fungisida, elektrolit, dan reagen uji air.' },
      { formula: 'CuO', name: 'Tembaga(II) oksida', note: 'Pigmen dan bahan superkonduktor.' },
      { formula: 'CuCl₂', name: 'Tembaga(II) klorida', note: 'Katalis dan pewarna kembang api.' },
      { formula: 'Cu₂O', name: 'Tembaga(I) oksida', note: 'Pigmen merah dan komponen sel surya.' },
    ],
  },
  Zn: {
    uses: [
      'Galvanisasi baja agar tidak berkarat',
      'Paduan kuningan dan die-casting',
      'Anode baterai dan sel kering',
      'Suplemen zinc untuk imunitas dan penyembuhan luka',
    ],
    properties: [
      'Logam kebiruan yang cepat membentuk lapisan oksida pelindung',
      'Bereaksi dengan asam encer menghasilkan hidrogen',
      'Titik lebur 693 K, rendah untuk logam teknik',
      'Tidak bersifat magnetik',
    ],
    history:
      'Produksi seng skala besar sudah berjalan di India pada abad ke-12. Di Eropa, seng baru dipelajari sebagai logam tersendiri pada abad ke-18.',
    compounds: [
      { formula: 'ZnO', name: 'Seng oksida', note: 'Tabir surya fisik dan karet vulkanisasi.' },
      { formula: 'ZnCl₂', name: 'Seng klorida', note: 'Fluks solder dan deodoran.' },
      { formula: 'ZnSO₄', name: 'Seng sulfat', note: 'Suplemen zinc dan elektrolit.' },
    ],
  },
  Ag: {
    uses: [
      'Perhiasan dan peralatan makan',
      'Kontak listrik dan sambungan elektronik presisi',
      'Lapisan antimikroba pada tekstil dan perban',
      'Cermin, pelapis lensa, dan bahan fotografi',
    ],
    properties: [
      'Logam dengan konduktivitas listrik dan panas tertinggi',
      'Sangat ulet dan mudah ditempa menjadi lembaran tipis',
      'Menghitam karena bereaksi dengan sulfur membentuk perak sulfida',
      'Bersifat antibakteri karena ion Ag⁺ mengganggu metabolisme mikroba',
    ],
    history:
      'Perak telah dipakai sejak sekitar 3000 SM untuk perhiasan dan mata uang. Banyak peradaban menggunakan perak sebagai standar nilai bersama emas.',
    compounds: [
      { formula: 'AgNO₃', name: 'Perak nitrat', note: 'Reagen laboratorium dan antiseptik.' },
      { formula: 'AgCl', name: 'Perak klorida', note: 'Bahan fotografi dan elektrode referensi.' },
      { formula: 'Ag₂S', name: 'Perak sulfida', note: 'Lapisan hitam pada perhiasan yang memudar.' },
    ],
  },
  Au: {
    uses: [
      'Perhiasan dan cadangan nilai',
      'Kontak listrik dan konektor tahan korosi',
      'Lapisan cermin, satelit, dan visor antariksa',
      'Nanopartikel emas untuk uji medis',
    ],
    properties: [
      'Sangat tidak reaktif sehingga tidak berkarat atau memudar',
      'Konduktor listrik dan panas yang baik',
      'Lunak dan sangat mudah ditempa; satu gram bisa jadi lembaran luas',
      'Permukaannya memantulkan inframerah dengan sangat baik',
    ],
    history:
      'Emas digunakan sejak zaman prasejarah untuk perhiasan dan ritual. Standar emas menjadi dasar sistem moneter internasional dari 1870-an hingga 1970-an.',
    compounds: [
      { formula: 'AuCl₃', name: 'Emas(III) klorida', note: 'Prekursor nanopartikel dan pelapisan emas.' },
      { formula: 'KAu(CN)₂', name: 'Kalium dikianoaurat(I)', note: 'Elektrolit pada penyepuhan emas.' },
    ],
  },
  Hg: {
    uses: [
      'Lampu uap merkuri untuk pencahayaan lama',
      'Termometer dan barometer sebelum dilarang di banyak negara',
      'Amalgam gigi dan ekstraksi emas tradisional',
      'Elektrode pada proses klor-alkali',
    ],
    properties: [
      'Satu-satunya logam yang berwujud cair pada suhu kamar',
      'Uapnya beracun dan dapat terhirup tanpa terasa',
      'Membentuk amalgam dengan banyak logam lain',
      'Titik beku 234 K, jauh di bawah suhu kamar',
    ],
    history:
      'Merkuri dikenal sejak zaman Romawi untuk amalgam dan obat. Bahaya uapnya baru dipahami luas pada abad ke-19 hingga ke-20, mendorong pelarangan bertahap.',
    compounds: [
      { formula: 'HgS', name: 'Merkuri(II) sulfida', note: 'Sinabar, bijih merah merkuri.' },
      { formula: 'HgCl₂', name: 'Merkuri(II) klorida', note: 'Senyawa sangat beracun, pernah dipakai sebagai antiseptik.' },
      { formula: 'HgO', name: 'Merkuri(II) oksida', note: 'Pigmen merah dan bahan baterai lama.' },
    ],
  },
  Pb: {
    uses: [
      'Baterai asam timbal pada kendaraan',
      'Pelindung radiasi pada ruang radiologi',
      'Paduan solder dan bantalan sebelum dibatasi',
      'Kaca timbal untuk perisai radiasi dan kristal',
    ],
    properties: [
      'Logam berat, lunak, dan mudah dibentuk',
      'Densitas tinggi sehingga efektif menyerap radiasi',
      'Tahan korosi di udara dan air',
      'Bersifat neurotoksik dan dapat menumpuk di tubuh',
    ],
    history:
      'Timbal dipakai sejak zaman Romawi untuk pipa air dan wadah. Bahaya keracunan timbal pada anak diakui luas pada abad ke-20, memicu pelarangan bensin bertimbal dan cat timbal.',
    compounds: [
      { formula: 'PbO', name: 'Timbal(II) oksida', note: 'Bahan kaca timbal dan baterai.' },
      { formula: 'PbO₂', name: 'Timbal(IV) oksida', note: 'Elektrode positif baterai asam timbal.' },
      { formula: 'PbSO₄', name: 'Timbal(II) sulfat', note: 'Produk samping saat baterai dilepas muatan.' },
      { formula: 'Pb(NO₃)₂', name: 'Timbal(II) nitrat', note: 'Reagen laboratorium untuk uji iodida.' },
    ],
  },
  U: {
    uses: [
      'Bahan bakar reaktor nuklir melalui isotop U-235',
      'Sumber radioisotop untuk kedokteran dan industri',
      'Pewarna kaca dan keramik pada masa lalu',
      'Bahan dasar aloi berdensitas tinggi',
    ],
    properties: [
      'Radioaktif; U-235 dapat mengalami fisi berantai',
      'Logam berat dengan densitas sekitar 19 g/cm³',
      'U-238 memiliki waktu paruh sekitar 4,5 miliar tahun',
      'Bersifat piroforik dalam bentuk serbuk halus',
    ],
    history:
      'Martin Heinrich Klaproth mengidentifikasi uranium pada 1789 dari bijih pitchblende. Pada 1938 Otto Hahn dan Fritz Strassmann menemukan fisi nuklir, yang membuka era energi nuklir.',
    compounds: [
      { formula: 'UO₂', name: 'Uranium dioksida', note: 'Bahan bakar pelet reaktor air ringan.' },
      { formula: 'U₃O₈', name: 'Triuranium oktoksida', note: 'Bentuk stabil untuk penyimpanan dan transportasi.' },
      { formula: 'UF₆', name: 'Uranium heksafluorida', note: 'Gas untuk pengayaan isotop uranium.' },
    ],
  },
};

/** Kelompok kategori untuk dipakai halaman golongan. */
