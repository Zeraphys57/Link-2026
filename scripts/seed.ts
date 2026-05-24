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

const PANITIA: UserToCreate[] = [
  // Panitia — login pakai email masing-masing, password: panitiaLink2026!
  { email: 'roymalvin1919@gmail.com',         password: 'panitiaLink2026!', display_name: 'Roy',     role: 'panitia' },
  { email: 'divopratamaputra604@gmail.com',   password: 'panitiaLink2026!', display_name: 'Divo',    role: 'panitia' },
  { email: 'edwardchristiani.t@gmail.com',    password: 'panitiaLink2026!', display_name: 'Edward',  role: 'panitia' },
  { email: 'wsusanto2007@gmail.com',          password: 'panitiaLink2026!', display_name: 'Willy',   role: 'panitia' },
  { email: 'andikaxz12@gmail.com',            password: 'panitiaLink2026!', display_name: 'Andika',  role: 'panitia' },
  { email: 'joanthio09@gmail.com',            password: 'panitiaLink2026!', display_name: 'Joaquin', role: 'panitia' },
  { email: 'bryanjacquellino5757@gmail.com',  password: 'panitiaLink2026!', display_name: 'Bryan',   role: 'panitia' },
  { email: 'widyatama009@gmail.com',          password: 'panitiaLink2026!', display_name: 'Widy',    role: 'panitia' },
]

// Tim peserta — 1 akun per tim. Anggota 1 = baris berisi nama tim saat pendaftaran.
const TEAMS: { name: string; npm1: string; npm2: string }[] = [
  { name: 'Dev C++ ez',                    npm1: '250713285', npm2: '250713181' }, // Octaviano + Alexandria
  { name: 'Ayam Geprek Atma Jaya',         npm1: '250713196', npm2: '250713212' }, // Iwang + Jonathan Lie
  { name: 'gugu gaga phoebe chibi mambo~', npm1: '250713191', npm2: '250713195' }, // Thomas Wilson + Maximillian
  { name: 'Loh ini lomba???',              npm1: '250713174', npm2: '250713173' }, // Tristan + Richard Setiawan
  { name: 'Yojo Pride',                    npm1: '250713179', npm2: '250713649' }, // Yohana + Veronika
  { name: 'Codex',                         npm1: '250713219', npm2: '250713277' }, // Daniel + Nathanael
  { name: 'Nas',                           npm1: '250713614', npm2: '250713657' }, // Andrew + Maximianus
  { name: 'Kagak Tau',                     npm1: '250713281', npm2: '250713348' }, // Angelina Stella + Parardhya
  { name: 'Jaya Jaya',                     npm1: '250713189', npm2: '250713202' }, // Christian Arya + Klemens
  { name: 'JGN GAGAL LAGI PLS',            npm1: '250713387', npm2: '250713575' }, // Nadya + Dwi Enzelica
  { name: 'anu iya itu',                   npm1: '250713143', npm2: '250713183' }, // Clarence + Celine
  { name: 'desperate',                     npm1: '250713172', npm2: '250713193' }, // Paulina + Armilette
  { name: 'ATM',                           npm1: '250713489', npm2: '250713458' }, // Benedictus + Jansen
  { name: 'jangan error please',           npm1: '250713519', npm2: '250713629' }, // Jonathan Evquarel + Michelle
  { name: 'PECCATOR 13 JUNI 2026',         npm1: '250713182', npm2: '250713188' }, // Petrus + Constantine
  { name: 'nayka404',                      npm1: '250713574', npm2: '250713454' }, // Devina + Collin
  { name: 'kicaumania',                    npm1: '250713221', npm2: '250713269' }, // Karina + Vionita
  { name: 'VANCHA',                        npm1: '250713456', npm2: '250713490' }, // Ivana + Trifosa
  { name: 'Yolo',                          npm1: '250713215', npm2: '250713279' }, // Doni + M. Fajar
  { name: 'Pasrah aja dah',                npm1: '250713201', npm2: '250713200' }, // I Komang + Jonea
  { name: 'Lux Mundi',                     npm1: '250713515', npm2: '250713549' }, // Bagus + Rasya
  { name: 'Bjorka pake blangkon',          npm1: '250713323', npm2: '250713327' }, // Joseph Diamond + Angellyna
  { name: 'SANA',                          npm1: '250713377', npm2: '250713417' }, // Sabrina + Natasya
  { name: 'Mpruyy',                        npm1: '250713186', npm2: '250713185' }, // Graciano Marcel + Kristoforus
]

// Konversi nama tim → slug email. HARUS sama dengan LoginForm.tsx.
const teamSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')

const PESERTA: UserToCreate[] = TEAMS.map(t => ({
  email: `${teamSlug(t.name)}@link2026.team`,
  // Password = 5 digit terakhir NPM anggota 1 + 5 digit terakhir NPM anggota 2
  password: t.npm1.slice(-5) + t.npm2.slice(-5),
  display_name: `Tim ${t.name}`,
  role: 'peserta' as const,
  team_name: t.name,
}))

const USERS: UserToCreate[] = [...PANITIA, ...PESERTA]

async function main() {
  console.log('🌱 LINK 2026 — Starting seed...\n')

  const userIds: Record<string, string> = {}

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

  console.log(`\n🎉 Seed complete!`)
  console.log(`   Users created/updated: ${Object.keys(userIds).length}`)
  console.log('\n📋 Login credentials:')
  console.log('   Panitia (login pakai email, password: panitiaLink2026!):')
  for (const u of USERS.filter(u => u.role === 'panitia')) {
    console.log(`     ${u.email}`)
  }
  console.log('   Peserta (login pakai nama tim):')
  for (const u of USERS.filter(u => u.role === 'peserta')) {
    console.log(`     ${u.team_name}  →  password: ${u.password}`)
  }
  console.log('\n📚 Soal: tidak ada soal yang di-seed. Panitia tambah soal lewat tab "Tambah Soal".')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
