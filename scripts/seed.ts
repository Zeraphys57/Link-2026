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
  { email: 'roymalvin1919@gmail.com',         password: 'panitiaLink2026!', display_name: 'Roy',     role: 'panitia' },
  { email: 'divopratamaputra604@gmail.com',   password: 'panitiaLink2026!', display_name: 'Divo',    role: 'panitia' },
  { email: 'edwardchristiani.t@gmail.com',    password: 'panitiaLink2026!', display_name: 'Edward',  role: 'panitia' },
  { email: 'wsusanto2007@gmail.com',          password: 'panitiaLink2026!', display_name: 'Willy',   role: 'panitia' },
  { email: 'andikaxz12@gmail.com',            password: 'panitiaLink2026!', display_name: 'Andika',  role: 'panitia' },
  { email: 'joanthio09@gmail.com',            password: 'panitiaLink2026!', display_name: 'Joaquin', role: 'panitia' },
  { email: 'bryanjacquellino5757@gmail.com',  password: 'panitiaLink2026!', display_name: 'Bryan',   role: 'panitia' },
  // Peserta — 1 akun per tim, login pakai nama tim, password: Link2026!
  { email: 'garuda@link2026.team',   password: 'Link2026!', display_name: 'Tim Garuda',   role: 'peserta', team_name: 'Garuda' },
  { email: 'elang@link2026.team',    password: 'Link2026!', display_name: 'Tim Elang',    role: 'peserta', team_name: 'Elang' },
  { email: 'rajawali@link2026.team', password: 'Link2026!', display_name: 'Tim Rajawali', role: 'peserta', team_name: 'Rajawali' },
]

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
  console.log('   Peserta (login pakai nama tim, password: Link2026!):')
  for (const u of USERS.filter(u => u.role === 'peserta')) {
    console.log(`     ${u.team_name}`)
  }
  console.log('\n📚 Soal: tidak ada soal yang di-seed. Panitia tambah soal lewat tab "Tambah Soal".')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
