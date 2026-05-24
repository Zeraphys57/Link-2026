# Kunci Jawaban — Soal Bryan

Semua solusi ditulis dalam **C** (sesuai dasar pemrograman sem 2). Setiap solusi dibuat lulus contoh kasus yang ada di soal.

---

## EASY 1 — Palindrom Kode Batu

**Konsep:** loop string, bandingkan karakter ke-i dengan ke-(n-1-i).

```c
#include <stdio.h>
#include <string.h>

int main() {
    char s[105];
    scanf("%s", s);
    int n = strlen(s);
    int palindrom = 1;
    for (int i = 0; i < n / 2; i++) {
        if (s[i] != s[n - 1 - i]) {
            palindrom = 0;
            break;
        }
    }
    if (palindrom) printf("Palindrom\n");
    else printf("Bukan Palindrom\n");
    return 0;
}
```

---

## EASY 2 — Konversi Waktu Penggalian

**Konsep:** integer division (`/`) dan modulus (`%`).

```c
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int jam = n / 60;
    int menit = n % 60;
    printf("%d jam %d menit\n", jam, menit);
    return 0;
}
```

---

## EASY 3 — Cek Bilangan Prima Kode Sampel

**Konsep:** loop dari 2 sampai √N, cek modulus.

```c
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int prima = 1;
    if (n < 2) {
        prima = 0;
    } else {
        for (int i = 2; (long long)i * i <= n; i++) {
            if (n % i == 0) {
                prima = 0;
                break;
            }
        }
    }
    if (prima) printf("Prima\n");
    else printf("Bukan Prima\n");
    return 0;
}
```

---

## EASY 4 — Pembalik Kode Sampel

**Konsep:** iterasi string dari indeks terakhir ke awal.

```c
#include <stdio.h>
#include <string.h>

int main() {
    char s[105];
    scanf("%s", s);
    int n = strlen(s);
    for (int i = n - 1; i >= 0; i--) {
        printf("%c", s[i]);
    }
    printf("\n");
    return 0;
}
```

---

## EASY 5 — Total Digit Berat Batuan

**Konsep:** while loop dengan `% 10` (ambil digit terakhir) dan `/ 10` (buang digit terakhir).

```c
#include <stdio.h>

int main() {
    long long n;
    scanf("%lld", &n);
    int total = 0;
    if (n == 0) {
        total = 0;
    } else {
        while (n > 0) {
            total += n % 10;
            n /= 10;
        }
    }
    printf("%d\n", total);
    return 0;
}
```

---

## EASY 6 — Pola Susunan Batu Tambang

**Konsep:** nested loop — loop luar untuk baris, loop dalam untuk cetak `#` sebanyak nomor baris.

```c
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            printf("#");
        }
        printf("\n");
    }
    return 0;
}
```

---

## MEDIUM 1 — Peta Bawah Tanah

**Konsep:** baca grid 2D sebagai array string, double loop, track baris dengan jumlah `M` terbanyak.

```c
#include <stdio.h>
#include <string.h>

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    char grid[105][105];
    for (int i = 0; i < n; i++) {
        scanf("%s", grid[i]);
    }

    int totalB = 0, totalM = 0, totalK = 0;
    int barisMax = 1, mineralMax = -1;
    for (int i = 0; i < n; i++) {
        int countM = 0;
        for (int j = 0; j < m; j++) {
            if (grid[i][j] == 'B') totalB++;
            else if (grid[i][j] == 'M') { totalM++; countM++; }
            else if (grid[i][j] == '.') totalK++;
        }
        if (countM > mineralMax) {
            mineralMax = countM;
            barisMax = i + 1;
        }
    }

    printf("Batuan: %d\n", totalB);
    printf("Mineral: %d\n", totalM);
    printf("Kosong: %d\n", totalK);
    printf("Baris dengan mineral terbanyak: %d\n", barisMax);
    return 0;
}
```

---

## MEDIUM 2 — Robot Penjelajah Tambang

**Konsep:** loop karakter, update (x, y) berdasarkan instruksi.

```c
#include <stdio.h>
#include <string.h>

int main() {
    char s[1005];
    scanf("%s", s);
    int n = strlen(s);
    int x = 0, y = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] == 'U') y++;
        else if (s[i] == 'D') y--;
        else if (s[i] == 'R') x++;
        else if (s[i] == 'L') x--;
    }
    printf("Posisi akhir: (%d, %d)\n", x, y);
    printf("Total langkah: %d\n", n);
    return 0;
}
```

---

## MEDIUM 3 — Mineral Paling Sering Ditemukan

**Konsep:** double loop frequency counting, simpan kandidat terbaik (frekuensi tertinggi, tiebreaker alfabet terkecil).

```c
#include <stdio.h>
#include <string.h>

int main() {
    int n;
    scanf("%d", &n);
    char data[1005][25];
    for (int i = 0; i < n; i++) {
        scanf("%s", data[i]);
    }

    char hasilNama[25] = "";
    int hasilCount = 0;

    for (int i = 0; i < n; i++) {
        // skip kalau nama ini sudah pernah dihitung sebelumnya
        int sudah = 0;
        for (int j = 0; j < i; j++) {
            if (strcmp(data[i], data[j]) == 0) { sudah = 1; break; }
        }
        if (sudah) continue;

        // hitung frekuensi data[i]
        int cnt = 0;
        for (int j = 0; j < n; j++) {
            if (strcmp(data[i], data[j]) == 0) cnt++;
        }

        // update hasil
        if (cnt > hasilCount) {
            hasilCount = cnt;
            strcpy(hasilNama, data[i]);
        } else if (cnt == hasilCount && strcmp(data[i], hasilNama) < 0) {
            strcpy(hasilNama, data[i]);
        }
    }

    printf("%s %d\n", hasilNama, hasilCount);
    return 0;
}
```

---

## MEDIUM 4 — Kode Biner Penanda Tambang

**Konsep:** while loop `% 2` dan `/ 2`, simpan digit, cetak terbalik.

```c
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    if (n == 0) {
        printf("0\n");
        return 0;
    }
    char hasil[35];
    int idx = 0;
    while (n > 0) {
        hasil[idx++] = (n % 2) + '0';
        n /= 2;
    }
    for (int i = idx - 1; i >= 0; i--) {
        printf("%c", hasil[i]);
    }
    printf("\n");
    return 0;
}
```

---

## MEDIUM 5 — Pencarian Sampel Mineral

**Konsep:** linear search pada array of record, dijalankan untuk tiap query.

```c
#include <stdio.h>
#include <string.h>

int main() {
    int n;
    scanf("%d", &n);
    char kode[1005][25], nama[1005][25];
    int kekerasan[1005];
    for (int i = 0; i < n; i++) {
        scanf("%s %s %d", kode[i], nama[i], &kekerasan[i]);
    }

    int q;
    scanf("%d", &q);
    while (q--) {
        char target[25];
        scanf("%s", target);
        int idx = -1;
        for (int i = 0; i < n; i++) {
            if (strcmp(kode[i], target) == 0) {
                idx = i;
                break;
            }
        }
        if (idx == -1) {
            printf("Tidak Ditemukan\n");
        } else {
            printf("%s %s %d\n", kode[idx], nama[idx], kekerasan[idx]);
        }
    }
    return 0;
}
```

---

## MEDIUM 6 — Histogram Kedalaman Tambang

**Konsep:** if-else range untuk bin, lalu nested loop untuk cetak `*`.

```c
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int dangkal = 0, menengah = 0, dalam = 0, sangatDalam = 0;
    for (int i = 0; i < n; i++) {
        int d;
        scanf("%d", &d);
        if (d <= 10) dangkal++;
        else if (d <= 25) menengah++;
        else if (d <= 50) dalam++;
        else sangatDalam++;
    }

    printf("Dangkal     (0-10) : ");
    for (int i = 0; i < dangkal; i++) printf("*");
    printf("\n");

    printf("Menengah    (11-25): ");
    for (int i = 0; i < menengah; i++) printf("*");
    printf("\n");

    printf("Dalam       (26-50): ");
    for (int i = 0; i < dalam; i++) printf("*");
    printf("\n");

    printf("SangatDalam (51+)  : ");
    for (int i = 0; i < sangatDalam; i++) printf("*");
    printf("\n");
    return 0;
}
```

---

## MEDIUM 7 — Pencarian Pola Kode Tambang

**Konsep:** nested loop manual substring search (O(|T|×|P|)).

```c
#include <stdio.h>
#include <string.h>

int main() {
    char t[1005], p[1005];
    scanf("%s", t);
    scanf("%s", p);
    int nt = strlen(t), np = strlen(p);
    int hasil = -1;
    for (int i = 0; i <= nt - np; i++) {
        int cocok = 1;
        for (int j = 0; j < np; j++) {
            if (t[i + j] != p[j]) {
                cocok = 0;
                break;
            }
        }
        if (cocok) {
            hasil = i + 1; // 1-indexed
            break;
        }
    }
    printf("%d\n", hasil);
    return 0;
}
```

---

## HARD 1 — Sistem Penggajian Penambang

**Konsep:** baca record → hitung gaji per record → bubble sort dengan dua kunci (gaji desc, nama asc) → cetak ranking + rata-rata.

> Catatan: bubble/insertion/selection sort sama-sama valid karena N ≤ 1000.

```c
#include <stdio.h>
#include <string.h>

int main() {
    int n;
    scanf("%d", &n);
    char nama[1005][25];
    int jam[1005];
    char jenis[1005][15];
    long long gaji[1005];

    for (int i = 0; i < n; i++) {
        scanf("%s %d %s", nama[i], &jam[i], jenis[i]);
        int tarif = 0;
        if (strcmp(jenis[i], "gali") == 0) tarif = 50000;
        else if (strcmp(jenis[i], "angkut") == 0) tarif = 30000;
        else if (strcmp(jenis[i], "sorting") == 0) tarif = 40000;
        gaji[i] = (long long)jam[i] * tarif;
    }

    // Bubble sort: desc by gaji, tiebreaker asc by nama
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            int swap = 0;
            if (gaji[j] < gaji[j + 1]) {
                swap = 1;
            } else if (gaji[j] == gaji[j + 1] && strcmp(nama[j], nama[j + 1]) > 0) {
                swap = 1;
            }
            if (swap) {
                long long tg = gaji[j]; gaji[j] = gaji[j + 1]; gaji[j + 1] = tg;
                int tj = jam[j]; jam[j] = jam[j + 1]; jam[j + 1] = tj;
                char tmp[25]; strcpy(tmp, nama[j]); strcpy(nama[j], nama[j + 1]); strcpy(nama[j + 1], tmp);
                char tk[15]; strcpy(tk, jenis[j]); strcpy(jenis[j], jenis[j + 1]); strcpy(jenis[j + 1], tk);
            }
        }
    }

    long long total = 0;
    printf("Ranking Penambang:\n");
    for (int i = 0; i < n; i++) {
        printf("%d. %s - %lld\n", i + 1, nama[i], gaji[i]);
        total += gaji[i];
    }
    printf("Rata-rata gaji: %lld\n", total / n);
    return 0;
}
```

---

## HARD 2 — Analisis Peta Tambang 2D

**Konsep:** baca matriks 2D, hitung total per baris/kolom/grid sekaligus, cari indeks dengan total tertinggi (tiebreaker indeks terkecil), hitung persentase sel target.

```c
#include <stdio.h>

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    int grid[105][105];
    long long totalBaris[105] = {0};
    long long totalKolom[105] = {0};
    long long totalGrid = 0;

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            scanf("%d", &grid[i][j]);
            totalBaris[i] += grid[i][j];
            totalKolom[j] += grid[i][j];
            totalGrid += grid[i][j];
        }
    }

    int barisMax = 0, kolomMax = 0;
    for (int i = 1; i < n; i++) {
        if (totalBaris[i] > totalBaris[barisMax]) barisMax = i;
    }
    for (int j = 1; j < m; j++) {
        if (totalKolom[j] > totalKolom[kolomMax]) kolomMax = j;
    }

    int r, c;
    scanf("%d %d", &r, &c);
    double persen = (double)grid[r - 1][c - 1] / totalGrid * 100.0;

    printf("Total grid: %lld\n", totalGrid);
    printf("Baris tertinggi: %d (total %lld)\n", barisMax + 1, totalBaris[barisMax]);
    printf("Kolom tertinggi: %d (total %lld)\n", kolomMax + 1, totalKolom[kolomMax]);
    printf("Persentase sel (%d,%d): %.2f%%\n", r, c, persen);
    return 0;
}
```
