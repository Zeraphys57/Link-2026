# Draft Soal Bryan — 6 Easy, 7 Medium, 2 Hard

Target: peserta = mahasiswa semester 2 yang baru selesai dasar pemrograman.
Tema umum: pertambangan / geologi / bawah tanah (konsisten dengan soal panitia lain).

Konsep yang dipakai sengaja BELUM dipakai panitia lain:
- Easy: palindrom, modulus+integer division (konversi waktu), bilangan prima, reverse string, sum of digits, pattern printing (nested loop output)
- Medium: 2D array, string instruksi/parsing, frequency counting, konversi desimal→biner, linear search dengan multi-query, histogram (counting + display ASCII), substring search
- Hard: AoR + multi-tarif calc + sort + agregat (bubble/insertion/selection cukup, N ≤ 1000), analisis matriks 2D multi-output

---

## EASY 1 — Palindrom Kode Batu  (100 pts, easy)

## Deskripsi
Setiap batu tambang yang ditemukan diberi kode penanda berupa string. Tim ahli geologi tertarik dengan batu yang kodenya merupakan **palindrom** — yaitu kode yang terbaca sama dari depan maupun dari belakang.

Tugasmu: cek apakah sebuah kode batu adalah palindrom atau bukan.

## Input
Satu string `S` yang merupakan kode batu (tanpa spasi, hanya huruf besar dan/atau angka).

## Output
- Tampilkan "Palindrom" jika kode terbaca sama dari depan dan belakang.
- Tampilkan "Bukan Palindrom" jika tidak.

## Contoh
**Input:**
```
KATAK
```

**Output:**
```
Palindrom
```

## Penjelasan
KATAK dibaca dari kiri = KATAK, dibaca dari kanan = KATAK. Karena sama, maka string adalah palindrom.

## Batasan
- 1 ≤ panjang S ≤ 100

---

## EASY 2 — Konversi Waktu Penggalian  (100 pts, easy)

## Deskripsi
Seorang penambang mencatat total waktu kerjanya dalam satuan menit. Atasannya ingin tahu berapa jam dan berapa menit total waktu kerja tersebut.

## Input
Satu bilangan bulat `N` yang menyatakan total waktu kerja dalam menit.

## Output
Tampilkan total waktu dalam format:
```
X jam Y menit
```
Dengan X = banyak jam (bilangan bulat) dan Y = sisa menit.

## Contoh
**Input:**
```
145
```

**Output:**
```
2 jam 25 menit
```

## Penjelasan
145 menit = 2 jam (120 menit) + 25 menit sisa.

## Batasan
- 0 ≤ N ≤ 100000

---

## EASY 3 — Cek Bilangan Prima Kode Sampel  (100 pts, easy)

## Deskripsi
Sebuah laboratorium geologi memberi nomor sampel pada setiap batu yang ditemukan. Tim peneliti curiga bahwa nomor sampel yang merupakan **bilangan prima** menandakan kandungan mineral langka.

Tugasmu: cek apakah nomor sampel yang diberikan adalah bilangan prima.

Bilangan prima adalah bilangan bulat lebih dari 1 yang hanya bisa dibagi habis oleh 1 dan dirinya sendiri.

## Input
Satu bilangan bulat `N`.

## Output
- "Prima" jika N adalah bilangan prima.
- "Bukan Prima" jika bukan.

## Contoh
**Input:**
```
13
```

**Output:**
```
Prima
```

## Penjelasan
13 hanya bisa dibagi habis oleh 1 dan 13, jadi 13 adalah bilangan prima.

## Batasan
- 2 ≤ N ≤ 1000000

---

## EASY 4 — Pembalik Kode Sampel  (100 pts, easy)

## Deskripsi
Sebuah laboratorium geologi menyimpan kode sampel batu di dalam database. Karena gangguan sistem, kode-kode tersebut tercatat dalam urutan terbalik. Bantu petugas lab dengan membalik kembali setiap karakter pada kode sampel sehingga kembali ke urutan semula.

## Input
Satu string `S` tanpa spasi (hanya huruf dan/atau angka).

## Output
String `S` yang dibaca dari karakter terakhir ke karakter pertama.

## Contoh
**Input:**
```
GRANIT01
```

**Output:**
```
10TINARG
```

## Penjelasan
Karakter pertama output adalah karakter terakhir input (`1`), karakter kedua output adalah karakter sebelum terakhir input (`0`), demikian seterusnya hingga karakter terakhir output yaitu karakter pertama input (`G`).

## Batasan
- 1 ≤ panjang S ≤ 100

---

## EASY 5 — Total Digit Berat Batuan  (100 pts, easy)

## Deskripsi
Setiap batu yang ditambang ditimbang dan diberi label berdasarkan beratnya (dalam gram). Untuk keperluan kode pelacakan internal, sistem menyimpan **total digit** dari nilai berat batu tersebut.

Tugasmu: hitung jumlah seluruh digit dari sebuah bilangan bulat non-negatif `N`.

## Input
Satu bilangan bulat `N`.

## Output
Total seluruh digit dari `N`.

## Contoh
**Input:**
```
4729
```

**Output:**
```
22
```

## Penjelasan
Digit-digit dari 4729 adalah 4, 7, 2, dan 9. Totalnya = 4 + 7 + 2 + 9 = 22.

## Batasan
- 0 ≤ N ≤ 1000000000

---

## EASY 6 — Pola Susunan Batu Tambang  (100 pts, easy)

## Deskripsi
Sebuah tambang menyusun hasil galiannya berupa tumpukan batu berbentuk segitiga siku-siku, di mana setiap lapisan ke bawah memiliki batu lebih banyak satu dari lapisan di atasnya. Lapisan paling atas memiliki 1 batu, lapisan ke-2 memiliki 2 batu, dan seterusnya hingga lapisan ke-`N`.

Bantu mandor tambang mencetak pola susunan batu tersebut dengan karakter `#`.

## Input
Satu bilangan bulat `N` yang menyatakan jumlah lapisan.

## Output
`N` baris, baris ke-i berisi `i` karakter `#` (tanpa spasi).

## Contoh
**Input:**
```
4
```

**Output:**
```
#
##
###
####
```

## Penjelasan
- Lapisan 1: 1 batu → `#`
- Lapisan 2: 2 batu → `##`
- Lapisan 3: 3 batu → `###`
- Lapisan 4: 4 batu → `####`

## Batasan
- 1 ≤ N ≤ 100

---

## MEDIUM 1 — Peta Bawah Tanah  (250 pts, medium)

## Deskripsi
Tim pemetaan tambang membuat peta wilayah bawah tanah dalam bentuk grid `N` baris × `M` kolom. Setiap kotak pada peta diisi salah satu karakter:
- `B` = batuan keras
- `M` = mineral berharga
- `.` = ruang kosong

Tim ingin tahu:
1. Berapa banyak `B`, `M`, dan `.` di seluruh peta.
2. Baris keberapa yang memiliki **mineral (`M`) terbanyak**. Jika ada beberapa baris dengan jumlah mineral sama, ambil baris dengan indeks paling kecil. Baris pertama dihitung sebagai baris 1.

## Input
- Baris pertama berisi dua bilangan bulat `N` dan `M` dipisahkan spasi.
- `N` baris berikutnya masing-masing berisi string sepanjang `M` karakter (hanya berisi 'B', 'M', '.').

## Output
Tampilkan dalam format:
```
Batuan: X
Mineral: Y
Kosong: Z
Baris dengan mineral terbanyak: K
```

## Contoh
**Input:**
```
3 4
B.M.
MMBM
..B.
```

**Output:**
```
Batuan: 3
Mineral: 4
Kosong: 5
Baris dengan mineral terbanyak: 2
```

## Penjelasan
- Baris 1 (`B.M.`): 1 batuan, 1 mineral, 2 kosong
- Baris 2 (`MMBM`): 1 batuan, 3 mineral, 0 kosong
- Baris 3 (`..B.`): 1 batuan, 0 mineral, 3 kosong

Total: 3 batuan, 4 mineral, 5 kosong. Baris 2 memiliki mineral terbanyak (3 mineral).

## Batasan
- 1 ≤ N, M ≤ 100

---

## MEDIUM 2 — Robot Penjelajah Tambang  (250 pts, medium)

## Deskripsi
Sebuah robot penjelajah diturunkan ke koordinat (0, 0) pada peta tambang. Robot menerima sebuah string instruksi yang terdiri dari karakter:
- `U` = naik (y bertambah 1)
- `D` = turun (y berkurang 1)
- `R` = ke kanan (x bertambah 1)
- `L` = ke kiri (x berkurang 1)

Tugasmu: hitung posisi akhir robot setelah seluruh instruksi dijalankan, dan hitung total langkah yang dilakukan.

## Input
Satu string `S` yang berisi karakter instruksi.

## Output
Tampilkan dalam format:
```
Posisi akhir: (X, Y)
Total langkah: T
```

## Contoh
**Input:**
```
UURDDL
```

**Output:**
```
Posisi akhir: (0, 0)
Total langkah: 6
```

## Penjelasan
- U: (0, 1)
- U: (0, 2)
- R: (1, 2)
- D: (1, 1)
- D: (1, 0)
- L: (0, 0)

Robot kembali ke (0, 0) setelah 6 langkah.

## Batasan
- 1 ≤ panjang S ≤ 1000
- S hanya berisi karakter 'U', 'D', 'L', 'R'.

---

## MEDIUM 3 — Mineral Paling Sering Ditemukan  (250 pts, medium)

## Deskripsi
Tim survei mencatat setiap mineral yang ditemukan di lokasi tambang. Setelah seluruh data terkumpul, tim ingin tahu jenis mineral apa yang **paling sering muncul** dan berapa kali mineral tersebut ditemukan.

Jika terdapat beberapa mineral dengan frekuensi yang sama, pilih nama mineral yang lebih kecil secara alfabet.

## Input
- Baris pertama berisi sebuah bilangan bulat `N` yang menyatakan jumlah temuan.
- `N` baris berikutnya masing-masing berisi nama mineral (satu kata, huruf saja).

## Output
Tampilkan dalam format:
```
NamaMineral X
```
Dengan X = jumlah kemunculan mineral tersebut.

## Contoh
**Input:**
```
6
Kuarsa
Granit
Kuarsa
Basalt
Granit
Kuarsa
```

**Output:**
```
Kuarsa 3
```

## Penjelasan
Kuarsa muncul 3 kali, Granit 2 kali, Basalt 1 kali. Yang paling sering adalah Kuarsa.

## Batasan
- 1 ≤ N ≤ 1000
- 1 ≤ panjang nama mineral ≤ 20
- Nama mineral hanya berisi huruf.

---

## MEDIUM 4 — Kode Biner Penanda Tambang  (250 pts, medium)

## Deskripsi
Setiap terowongan di area tambang diberi kode pengenal berupa bilangan desimal. Untuk keperluan sistem otomasi, kode tersebut harus dikonversi ke dalam representasi **bilangan biner**.

Tugasmu: konversi sebuah bilangan bulat desimal `N` menjadi representasi binernya (string yang hanya terdiri dari karakter '0' dan '1').

Catatan: untuk N = 0, output adalah "0".

## Input
Satu bilangan bulat `N`.

## Output
String representasi biner dari N (tanpa angka 0 di depan, kecuali untuk N = 0).

## Contoh
**Input:**
```
13
```

**Output:**
```
1101
```

## Penjelasan
13 = 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13. Jadi representasi binernya adalah 1101.

## Batasan
- 0 ≤ N ≤ 1000000

---

## MEDIUM 5 — Pencarian Sampel Mineral  (250 pts, medium)

## Deskripsi
Sebuah laboratorium memiliki database `N` sampel batu mineral. Setiap sampel memiliki:
- Kode sampel (string tanpa spasi)
- Nama mineral (string tanpa spasi)
- Tingkat kekerasan (skala Mohs 1–10, bilangan bulat)

Tim peneliti ingin mencari informasi sampel berdasarkan kodenya. Diberikan `Q` pertanyaan, untuk setiap kode target yang ditanyakan, tampilkan informasi sampel yang sesuai.

## Input
- Baris pertama: bilangan bulat `N`.
- `N` baris berikutnya: `kode nama kekerasan` dipisahkan spasi.
- Baris berikutnya: bilangan bulat `Q`.
- `Q` baris berikutnya: satu kode target per baris.

## Output
Untuk setiap kode target, cetak satu baris:
- Jika ditemukan: `kode nama kekerasan` (sama persis dengan data tersimpan).
- Jika tidak ditemukan: `Tidak Ditemukan`.

## Contoh
**Input:**
```
4
S001 Granit 7
S002 Kalsit 3
S003 Topas 8
S004 Gipsum 2
3
S002
S005
S003
```

**Output:**
```
S002 Kalsit 3
Tidak Ditemukan
S003 Topas 8
```

## Penjelasan
- Kode `S002` ditemukan, namanya Kalsit dengan kekerasan 3.
- Kode `S005` tidak ada di database.
- Kode `S003` ditemukan, namanya Topas dengan kekerasan 8.

## Batasan
- 1 ≤ N, Q ≤ 1000
- 1 ≤ panjang kode dan nama mineral ≤ 20
- 1 ≤ kekerasan ≤ 10
- Setiap kode sampel di database bersifat unik.

---

## MEDIUM 6 — Histogram Kedalaman Tambang  (250 pts, medium)

## Deskripsi
Tim survei mengumpulkan `N` data kedalaman titik pengeboran di area tambang (dalam meter). Untuk keperluan visualisasi laporan, data perlu dikelompokkan ke dalam empat kategori kedalaman:
- **Dangkal**: 0 – 10 meter
- **Menengah**: 11 – 25 meter
- **Dalam**: 26 – 50 meter
- **SangatDalam**: lebih dari 50 meter

Tampilkan histogram berupa karakter `*` untuk setiap kategori. Jumlah `*` sama dengan banyaknya data pada kategori tersebut. Jika kategori tidak memiliki data, label tetap dicetak tanpa karakter `*`.

## Input
- Baris pertama: bilangan bulat `N`.
- Baris kedua: `N` bilangan bulat dipisahkan spasi (kedalaman setiap titik pengeboran).

## Output
Empat baris dengan format persis (perhatikan spasi):
```
Dangkal     (0-10) : <bintang sesuai jumlah>
Menengah    (11-25): <bintang sesuai jumlah>
Dalam       (26-50): <bintang sesuai jumlah>
SangatDalam (51+)  : <bintang sesuai jumlah>
```

## Contoh
**Input:**
```
8
5 12 30 8 25 60 17 75
```

**Output:**
```
Dangkal     (0-10) : **
Menengah    (11-25): ***
Dalam       (26-50): *
SangatDalam (51+)  : **
```

## Penjelasan
- Dangkal: 5, 8 → 2 data
- Menengah: 12, 25, 17 → 3 data
- Dalam: 30 → 1 data
- SangatDalam: 60, 75 → 2 data

## Batasan
- 1 ≤ N ≤ 1000
- 0 ≤ kedalaman ≤ 1000

---

## MEDIUM 7 — Pencarian Pola Kode Tambang  (250 pts, medium)

## Deskripsi
Setiap terowongan tambang diberi kode pengenal berupa string panjang. Tim keamanan ingin mengecek apakah suatu **pola pendek** muncul di dalam kode terowongan. Jika muncul, tampilkan posisi awal (1-indexed) di mana pola tersebut pertama kali ditemukan.

## Input
- Baris pertama: string `T` (kode terowongan, tanpa spasi).
- Baris kedua: string `P` (pola yang dicari, tanpa spasi).

## Output
- Jika pola `P` ditemukan di dalam `T`, tampilkan posisi awal kemunculan **pertama** (1-indexed).
- Jika tidak ditemukan, tampilkan `-1`.

## Contoh
**Input:**
```
GRANITBATUANKALSIT
BATUAN
```

**Output:**
```
7
```

## Penjelasan
String `GRANITBATUANKALSIT`:
- Karakter ke-1 adalah `G`.
- Karakter ke-7 adalah `B`, diikuti `A T U A N` di posisi 8 – 12.

Sehingga pola `BATUAN` ditemukan mulai dari posisi ke-7.

## Batasan
- 1 ≤ panjang T, P ≤ 1000
- Panjang P ≤ panjang T
- T dan P hanya berisi huruf dan/atau angka, tanpa spasi.

---

## HARD 1 — Sistem Penggajian Penambang  (500 pts, hard)

## Deskripsi
Perusahaan tambang ingin menghitung gaji harian setiap penambang. Setiap penambang memiliki:
- Nama (satu kata tanpa spasi)
- Jam kerja (bilangan bulat)
- Jenis pekerjaan: `gali`, `angkut`, atau `sorting`

Tarif gaji per jam berbeda untuk setiap jenis pekerjaan:
- `gali` : 50000 per jam
- `angkut` : 30000 per jam
- `sorting` : 40000 per jam

Gaji harian = jam kerja × tarif per jam.

Tugas program:
1. Hitung gaji setiap penambang.
2. Urutkan penambang berdasarkan gaji dari yang **tertinggi ke terendah**. Jika ada gaji yang sama, urutkan berdasarkan nama secara alfabet menaik.
3. Tampilkan ranking lengkap penambang beserta gajinya.
4. Tampilkan rata-rata gaji semua penambang (dibulatkan ke bawah / integer division).

## Input
- Baris pertama berisi bilangan bulat `N`.
- `N` baris berikutnya masing-masing berisi: `nama jam_kerja jenis_pekerjaan` dipisahkan spasi.

## Output
```
Ranking Penambang:
1. nama1 - gaji1
2. nama2 - gaji2
...
Rata-rata gaji: AVG
```

## Contoh
**Input:**
```
4
Andi 8 gali
Budi 10 angkut
Caca 7 sorting
Dani 9 gali
```

**Output:**
```
Ranking Penambang:
1. Dani - 450000
2. Andi - 400000
3. Budi - 300000
4. Caca - 280000
Rata-rata gaji: 357500
```

## Penjelasan
- Andi: 8 × 50000 = 400000
- Budi: 10 × 30000 = 300000
- Caca: 7 × 40000 = 280000
- Dani: 9 × 50000 = 450000

Urut dari yang terbesar: Dani (450000), Andi (400000), Budi (300000), Caca (280000).
Rata-rata = (450000 + 400000 + 300000 + 280000) / 4 = 1430000 / 4 = 357500.

## Batasan
- 1 ≤ N ≤ 1000
- 1 ≤ jam_kerja ≤ 24
- jenis_pekerjaan ∈ {gali, angkut, sorting}
- 1 ≤ panjang nama ≤ 20
- Nama berupa satu kata tanpa spasi.

---

## HARD 2 — Analisis Peta Tambang 2D  (500 pts, hard)

## Deskripsi
Tim eksplorasi memetakan area tambang ke dalam grid `N` baris × `M` kolom. Setiap sel pada grid berisi bilangan bulat yang menyatakan **nilai mineral** yang ditemukan di sel tersebut (bisa 0 jika tidak ada mineral).

Tugas program:
1. Hitung total nilai mineral di seluruh grid.
2. Hitung total nilai mineral per baris dan per kolom.
3. Tampilkan baris dengan total tertinggi. Jika lebih dari satu, ambil indeks terkecil. Baris pertama = baris 1.
4. Tampilkan kolom dengan total tertinggi. Jika lebih dari satu, ambil indeks terkecil. Kolom pertama = kolom 1.
5. Tampilkan persentase nilai mineral pada sel `(R, C)` terhadap total grid, dengan format 2 angka di belakang koma. `R` dan `C` diberikan sebagai input (1-indexed).

## Input
- Baris pertama berisi dua bilangan bulat `N` dan `M`.
- `N` baris berikutnya masing-masing berisi `M` bilangan bulat dipisahkan spasi (nilai mineral per sel).
- Baris terakhir berisi dua bilangan bulat `R` dan `C`.

## Output
Tampilkan dalam format:
```
Total grid: T
Baris tertinggi: BR (total BT)
Kolom tertinggi: KC (total KT)
Persentase sel (R,C): P%
```
P ditampilkan dengan 2 angka di belakang koma.

## Contoh
**Input:**
```
3 3
10 20 30
40 50 60
70 80 90
2 3
```

**Output:**
```
Total grid: 450
Baris tertinggi: 3 (total 240)
Kolom tertinggi: 3 (total 180)
Persentase sel (2,3): 13.33%
```

## Penjelasan
- Total grid = 10+20+30+40+50+60+70+80+90 = 450.
- Total per baris: baris 1 = 60, baris 2 = 150, baris 3 = 240. Tertinggi = baris 3.
- Total per kolom: kolom 1 = 120, kolom 2 = 150, kolom 3 = 180. Tertinggi = kolom 3.
- Sel (2,3) bernilai 60. Persentase = 60 / 450 × 100% = 13.33%.

## Batasan
- 1 ≤ N, M ≤ 100
- 0 ≤ nilai sel ≤ 10000
- 1 ≤ R ≤ N, 1 ≤ C ≤ M
- Total grid > 0
