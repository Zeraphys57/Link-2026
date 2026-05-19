import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
})

interface UserToCreate {
  email: string
  password: string
  display_name: string
  role: 'peserta' | 'panitia'
  team_name?: string
}

const USERS: UserToCreate[] = [
  // Panitia — login pakai email masing-masing, password: panitiaLink2026!
  { email: 'bryanjacquellino5757@gmail.com', password: 'panitiaLink2026!', display_name: 'Bryan', role: 'panitia' },
  { email: 'ahmad.fauzi@link2026.id', password: 'panitiaLink2026!', display_name: 'Ahmad Fauzi', role: 'panitia' },
  { email: 'budi.santoso@link2026.id', password: 'panitiaLink2026!', display_name: 'Budi Santoso', role: 'panitia' },
  { email: 'citra.dewi@link2026.id', password: 'panitiaLink2026!', display_name: 'Citra Dewi', role: 'panitia' },
  // Peserta — 1 akun per tim, login pakai nama tim, password: Link2026!
  { email: 'garuda@link2026.team', password: 'Link2026!', display_name: 'Tim Garuda', role: 'peserta', team_name: 'Garuda' },
  { email: 'elang@link2026.team', password: 'Link2026!', display_name: 'Tim Elang', role: 'peserta', team_name: 'Elang' },
  { email: 'rajawali@link2026.team', password: 'Link2026!', display_name: 'Tim Rajawali', role: 'peserta', team_name: 'Rajawali' },
]

function getProblemsByPanitia(panitiaName: string, panitiaId: string) {
  const problemSets: Record<string, Array<{ title: string; description: string; level: 'easy' | 'medium' | 'hard' | 'super'; points: number }>> = {
    'Ahmad Fauzi': [
      {
        title: 'Jumlah Dua Bilangan',
        level: 'easy',
        points: 100,
        description: `# Jumlah Dua Bilangan

Diberikan dua buah bilangan bulat **A** dan **B**. Tentukan jumlah kedua bilangan tersebut.

## Input
Satu baris berisi dua bilangan bulat A dan B, dipisahkan oleh spasi.

**Batasan:** -10⁹ ≤ A, B ≤ 10⁹

## Output
Satu bilangan bulat: hasil penjumlahan A dan B.

## Contoh

**Input:**
\`\`\`
3 7
\`\`\`

**Output:**
\`\`\`
10
\`\`\`

**Penjelasan:** 3 + 7 = 10`,
      },
      {
        title: 'Balik Kata',
        level: 'easy',
        points: 100,
        description: `# Balik Kata

Diberikan sebuah string **S**. Balik string tersebut dari depan ke belakang.

## Input
Satu baris berisi string S (1 ≤ |S| ≤ 10⁵), hanya terdiri dari huruf dan angka.

## Output
String S yang telah dibalik.

## Contoh

**Input:**
\`\`\`
kompetisi
\`\`\`

**Output:**
\`\`\`
isitepmoK
\`\`\`

**Penjelasan:** Balik setiap karakter dari kanan ke kiri.`,
      },
      {
        title: 'Pencarian Biner',
        level: 'medium',
        points: 250,
        description: `# Pencarian Biner

Diberikan array bilangan bulat yang sudah **terurut menaik** sebanyak **N** elemen dan **Q** query. Untuk setiap query berupa bilangan **X**, tentukan apakah X ada dalam array tersebut.

## Input
- Baris pertama: bilangan bulat N dan Q (1 ≤ N, Q ≤ 10⁵)
- Baris kedua: N bilangan bulat yang terurut menaik
- Q baris berikutnya: satu bilangan X per baris

## Output
Untuk setiap query, cetak "ADA" jika X ditemukan, atau "TIDAK" jika tidak.

## Contoh

**Input:**
\`\`\`
5 3
1 3 5 7 9
3
6
9
\`\`\`

**Output:**
\`\`\`
ADA
TIDAK
ADA
\`\`\`

**Batasan waktu:** 1 detik | **Memori:** 256 MB`,
      },
      {
        title: 'Subsequence Terpanjang',
        level: 'hard',
        points: 500,
        description: `# Longest Common Subsequence

Diberikan dua string **A** dan **B**. Temukan panjang dari **Longest Common Subsequence (LCS)** dari kedua string tersebut.

LCS adalah subsequence terpanjang yang merupakan subsequence dari kedua string. Subsequence tidak harus berurutan secara konsekutif.

## Input
- Baris pertama: string A (1 ≤ |A| ≤ 1000)
- Baris kedua: string B (1 ≤ |B| ≤ 1000)

## Output
Satu bilangan bulat: panjang LCS.

## Contoh

**Input:**
\`\`\`
ABCBDAB
BDCABA
\`\`\`

**Output:**
\`\`\`
4
\`\`\`

**Penjelasan:** LCS adalah "BCBA" atau "BDAB" dengan panjang 4.

**Petunjuk:** Gunakan Dynamic Programming dengan kompleksitas O(|A| × |B|).`,
      },
      {
        title: 'Rute Terpendek',
        level: 'super',
        points: 1000,
        description: `# Rute Terpendek dalam Graf Berbobot

Diberikan sebuah graf berbobot berarah dengan **N** simpul dan **M** sisi. Tentukan jarak terpendek dari simpul **S** ke simpul **T**.

## Input
- Baris pertama: N, M, S, T (1 ≤ N ≤ 10⁵, 1 ≤ M ≤ 3×10⁵)
- M baris berikutnya: U V W (sisi dari U ke V berbobot W)
  - 1 ≤ W ≤ 10⁶

## Output
Satu bilangan: jarak terpendek dari S ke T. Cetak -1 jika tidak ada jalur.

## Contoh

**Input:**
\`\`\`
5 7 1 5
1 2 2
1 3 6
2 3 3
2 4 8
3 5 7
4 5 2
3 4 1
\`\`\`

**Output:**
\`\`\`
8
\`\`\`

**Penjelasan:** Rute 1→2→3→4→5 dengan total bobot 2+3+1+2=8.

**Petunjuk:** Gunakan algoritma Dijkstra dengan Priority Queue.`,
      },
    ],
    'Budi Santoso': [
      {
        title: 'FizzBuzz Modifikasi',
        level: 'easy',
        points: 100,
        description: `# FizzBuzz Modifikasi

Untuk setiap bilangan dari 1 hingga **N**, cetak:
- "FIZZ" jika habis dibagi 3
- "BUZZ" jika habis dibagi 5
- "FIZZBUZZ" jika habis dibagi 3 dan 5
- Bilangan itu sendiri jika tidak ada kondisi di atas

## Input
Satu bilangan bulat N (1 ≤ N ≤ 10⁵).

## Output
N baris output sesuai aturan di atas.

## Contoh

**Input:**
\`\`\`
15
\`\`\`

**Output:**
\`\`\`
1
2
FIZZ
4
BUZZ
FIZZ
7
8
FIZZ
BUZZ
11
FIZZ
13
14
FIZZBUZZ
\`\`\``,
      },
      {
        title: 'Dua Angka Target',
        level: 'medium',
        points: 250,
        description: `# Dua Angka Target (Two Sum)

Diberikan array bilangan bulat **A** dengan **N** elemen dan sebuah target bilangan **T**. Temukan **dua indeks berbeda** i dan j sehingga A[i] + A[j] = T.

Dijamin tepat ada satu solusi. Cetak indeks (1-indexed, i < j).

## Input
- Baris pertama: N dan T (1 ≤ N ≤ 10⁵, -10⁹ ≤ T ≤ 10⁹)
- Baris kedua: N bilangan bulat A[i] (-10⁹ ≤ A[i] ≤ 10⁹)

## Output
Dua bilangan: indeks i dan j (1-indexed).

## Contoh

**Input:**
\`\`\`
4 9
2 7 11 15
\`\`\`

**Output:**
\`\`\`
1 2
\`\`\`

**Penjelasan:** A[1] + A[2] = 2 + 7 = 9.

**Petunjuk:** Gunakan HashMap untuk solusi O(N).`,
      },
      {
        title: 'Kurung Seimbang',
        level: 'medium',
        points: 250,
        description: `# Kurung Seimbang

Diberikan sebuah string **S** yang hanya berisi karakter \`(\`, \`)\`, \`[\`, \`]\`, \`{\`, \`}\`. Tentukan apakah string tersebut **valid** (seimbang).

String valid jika:
1. Setiap kurung buka memiliki kurung tutup yang sesuai.
2. Kurung tutup menutup dalam urutan yang benar.

## Input
Satu baris berisi string S (1 ≤ |S| ≤ 10⁴).

## Output
Cetak "VALID" atau "TIDAK VALID".

## Contoh

**Input 1:** \`([]{})\` → **Output:** \`VALID\`

**Input 2:** \`([)]\` → **Output:** \`TIDAK VALID\`

**Input 3:** \`{[]}\` → **Output:** \`VALID\`

**Petunjuk:** Gunakan struktur data Stack.`,
      },
      {
        title: 'Gabung K List Terurut',
        level: 'hard',
        points: 500,
        description: `# Gabung K List Terurut

Diberikan **K** list bilangan bulat yang masing-masing sudah terurut menaik. Gabungkan semua list tersebut menjadi satu list terurut menaik.

## Input
- Baris pertama: K (1 ≤ K ≤ 1000)
- K baris berikutnya: masing-masing dimulai dengan N (jumlah elemen), diikuti N bilangan

Total elemen ≤ 10⁶.

## Output
Satu baris: semua elemen terurut menaik.

## Contoh

**Input:**
\`\`\`
3
3 1 4 7
3 2 5 8
2 3 6
\`\`\`

**Output:**
\`\`\`
1 2 3 4 5 6 7 8
\`\`\`

**Petunjuk:** Gunakan Min-Heap / Priority Queue untuk efisiensi O(N log K).`,
      },
      {
        title: 'Pencocokan Pola Wildcard',
        level: 'super',
        points: 1000,
        description: `# Pencocokan Pola Wildcard

Implementasikan fungsi pencocokan string dengan dua wildcard:
- \`?\` cocok dengan tepat satu karakter apapun
- \`*\` cocok dengan nol atau lebih karakter apapun

Diberikan string **S** dan pola **P**, tentukan apakah S cocok dengan P.

## Input
- Baris pertama: T (jumlah test case, 1 ≤ T ≤ 100)
- Setiap test case: dua baris, string S dan pola P

**Batasan:** 1 ≤ |S|, |P| ≤ 1000

## Output
Untuk setiap test case: "COCOK" atau "TIDAK COCOK".

## Contoh

**Input:**
\`\`\`
3
aa
a*
cb
?a
adceb
a*c*b
\`\`\`

**Output:**
\`\`\`
COCOK
TIDAK COCOK
COCOK
\`\`\`

**Petunjuk:** Gunakan Dynamic Programming 2D. State: dp[i][j] = apakah S[0..i-1] cocok dengan P[0..j-1].`,
      },
    ],
    'Citra Dewi': [
      {
        title: 'Cek Palindrom',
        level: 'easy',
        points: 100,
        description: `# Cek Palindrom

Diberikan sebuah string **S**. Tentukan apakah S merupakan palindrom (sama jika dibaca dari depan maupun belakang).

Abaikan spasi dan perbedaan huruf kapital.

## Input
Satu baris berisi string S (1 ≤ |S| ≤ 10⁵).

## Output
Cetak "PALINDROM" atau "BUKAN PALINDROM".

## Contoh

**Input 1:** \`katak\` → **Output:** \`PALINDROM\`

**Input 2:** \`A man a plan a canal Panama\` → **Output:** \`PALINDROM\`

**Input 3:** \`hello\` → **Output:** \`BUKAN PALINDROM\`

**Penjelasan:** "amanaplanacanalpanama" setelah dihapus spasinya adalah palindrom.`,
      },
      {
        title: 'Subarray Jumlah Maksimum',
        level: 'medium',
        points: 250,
        description: `# Subarray dengan Jumlah Maksimum

Diberikan array bilangan bulat **A** dengan **N** elemen (boleh negatif). Temukan **subarray kontigu** yang memiliki **jumlah terbesar**.

## Input
- Baris pertama: N (1 ≤ N ≤ 10⁵)
- Baris kedua: N bilangan bulat (-10⁴ ≤ A[i] ≤ 10⁴)

## Output
Satu bilangan: jumlah subarray terbesar.

## Contoh

**Input:**
\`\`\`
9
-2 1 -3 4 -1 2 1 -5 4
\`\`\`

**Output:**
\`\`\`
6
\`\`\`

**Penjelasan:** Subarray [4, -1, 2, 1] memiliki jumlah 6.

**Petunjuk:** Algoritma Kadane — O(N). Pertahankan max_current dan max_global.`,
      },
      {
        title: 'Pemecahan Kata',
        level: 'hard',
        points: 500,
        description: `# Pemecahan Kata (Word Break)

Diberikan string **S** dan kamus **D** berisi daftar kata. Tentukan apakah S dapat dipecah menjadi satu atau lebih kata yang semuanya ada dalam kamus.

## Input
- Baris pertama: string S (1 ≤ |S| ≤ 300)
- Baris kedua: N (jumlah kata dalam kamus, 1 ≤ N ≤ 1000)
- N baris berikutnya: satu kata per baris

## Output
Cetak "BISA" atau "TIDAK BISA".

## Contoh

**Input:**
\`\`\`
leetcode
2
leet
code
\`\`\`

**Output:**
\`\`\`
BISA
\`\`\`

**Penjelasan:** "leetcode" = "leet" + "code".

**Petunjuk:** Gunakan DP. dp[i] = true jika S[0..i-1] dapat dipecah menggunakan kata-kata dari kamus.`,
      },
      {
        title: 'Traversal Graf Terpendek',
        level: 'hard',
        points: 500,
        description: `# Jarak Terpendek dalam Graf Tak Berbobot

Diberikan graf tak berarah dan tak berbobot dengan **N** simpul dan **M** sisi. Hitung jarak terpendek dari simpul **S** ke semua simpul lainnya.

## Input
- Baris pertama: N, M, S (1 ≤ N ≤ 10⁵, 1 ≤ M ≤ 3×10⁵)
- M baris berikutnya: U V (sisi antara U dan V)

## Output
N baris: jarak dari S ke simpul 1, 2, ..., N. Cetak -1 jika tidak terjangkau.

## Contoh

**Input:**
\`\`\`
6 7 1
1 2
1 3
2 4
3 4
4 5
5 6
3 6
\`\`\`

**Output:**
\`\`\`
0
1
1
2
3
2
\`\`\`

**Petunjuk:** Gunakan BFS dari simpul S. BFS menjamin jarak terpendek di graf tak berbobot.`,
      },
      {
        title: 'Jarak Edit Minimum',
        level: 'super',
        points: 1000,
        description: `# Jarak Edit Minimum (Edit Distance)

Diberikan dua string **A** dan **B**. Tentukan jumlah minimum operasi yang diperlukan untuk mengubah A menjadi B.

Operasi yang diizinkan:
1. **Insert**: Tambahkan satu karakter
2. **Delete**: Hapus satu karakter
3. **Replace**: Ganti satu karakter dengan karakter lain

## Input
- Baris pertama: string A (1 ≤ |A| ≤ 500)
- Baris kedua: string B (1 ≤ |B| ≤ 500)

## Output
Satu bilangan: jarak edit minimum.

## Contoh

**Input:**
\`\`\`
kitten
sitting
\`\`\`

**Output:**
\`\`\`
3
\`\`\`

**Penjelasan:**
1. kitten → sitten (ganti k→s)
2. sitten → sittin (ganti e→i)
3. sittin → sitting (insert g)

**Petunjuk:** DP klasik. dp[i][j] = edit distance antara A[0..i-1] dan B[0..j-1].`,
      },
    ],
  }

  return (problemSets[panitiaName] ?? []).map(p => ({
    ...p,
    created_by: panitiaId,
    created_by_name: panitiaName,
  }))
}

async function main() {
  console.log('🌱 LINK 2026 — Starting seed...\n')

  const userIds: Record<string, string> = {}

  // Create users and profiles
  for (const user of USERS) {
    let userId: string

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email === user.email)

    if (existing) {
      console.log(`⚠️  User exists: ${user.email} — updating password`)
      userId = existing.id
      await supabase.auth.admin.updateUserById(userId, { password: user.password })
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })
      if (error || !data.user) {
        console.error(`❌ Failed to create ${user.email}:`, error?.message)
        continue
      }
      userId = data.user.id
      console.log(`✅ Created user: ${user.display_name} <${user.email}>`)
    }

    userIds[user.display_name] = userId

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      role: user.role,
      display_name: user.display_name,
      team_name: user.team_name ?? null,
    })

    if (profileError) {
      console.error(`❌ Profile error for ${user.email}:`, profileError.message)
    } else {
      console.log(`   Profile: ${user.role}${user.team_name ? ` | Team: ${user.team_name}` : ''}`)
    }
  }

  console.log('\n📚 Creating problems...\n')

  const panitiaNames = ['Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi']
  let totalProblems = 0

  for (const name of panitiaNames) {
    const id = userIds[name]
    if (!id) { console.error(`❌ No user ID for ${name}`); continue }

    const problems = getProblemsByPanitia(name, id)
    for (const problem of problems) {
      const { error } = await supabase.from('problems').insert(problem)
      if (error) {
        console.error(`❌ Failed to create problem "${problem.title}":`, error.message)
      } else {
        console.log(`✅ [${problem.level.toUpperCase()}] ${problem.title} (${problem.points} pts) — by ${name}`)
        totalProblems++
      }
    }
  }

  console.log(`\n🎉 Seed complete!`)
  console.log(`   Users created: ${Object.keys(userIds).length}`)
  console.log(`   Problems created: ${totalProblems}`)
  console.log('\n📋 Login credentials:')
  console.log('   Panitia (login pakai email, password: panitiaLink2026!):')
  console.log('     ahmad.fauzi@link2026.id')
  console.log('     budi.santoso@link2026.id')
  console.log('     citra.dewi@link2026.id')
  console.log('   Peserta (login pakai nama tim, password: Link2026!):')
  console.log('     Garuda')
  console.log('     Elang')
  console.log('     Rajawali')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
