import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) dotenv.config({ path: envPath })
else dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
})

const BRYAN_EMAIL = 'bryanjacquellino5757@gmail.com'

interface Problem {
  title: string
  description: string
  level: 'easy' | 'medium' | 'hard'
  points: number
}

function parseProblems(content: string): Problem[] {
  const normalized = content.replace(/\r\n/g, '\n')
  const sections = normalized.split(/\n---\n/)
  const problems: Problem[] = []
  for (const section of sections) {
    const trimmed = section.trim()
    const headerMatch = trimmed.match(/^## (EASY|MEDIUM|HARD) \d+ — (.+?)\s+\((\d+) pts, (\w+)\)/m)
    if (!headerMatch) continue
    const [, , title, pointsStr, level] = headerMatch
    const lines = trimmed.split('\n')
    const description = lines.slice(1).join('\n').trim()
    problems.push({
      title: title.trim(),
      description,
      level: level as 'easy' | 'medium' | 'hard',
      points: parseInt(pointsStr, 10),
    })
  }
  return problems
}

async function main() {
  console.log('📚 Insert Bryan problems...\n')

  const { data: users } = await supabase.auth.admin.listUsers()
  const bryanAuth = users?.users?.find(u => u.email === BRYAN_EMAIL)
  if (!bryanAuth) {
    console.error(`Bryan auth user not found (${BRYAN_EMAIL}). Run npm run seed first.`)
    process.exit(1)
  }
  const bryanId = bryanAuth.id

  const { data: bryanProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', bryanId)
    .single()
  const bryanName = bryanProfile?.display_name ?? 'Bryan'

  console.log(`Bryan ID:   ${bryanId}`)
  console.log(`Bryan Name: ${bryanName}\n`)

  const draftPath = path.resolve(process.cwd(), 'scripts/bryan-problems-draft.md')
  const content = fs.readFileSync(draftPath, 'utf-8')
  const problems = parseProblems(content)

  console.log(`Parsed ${problems.length} problems from draft.\n`)
  if (problems.length === 0) {
    console.error('No problems parsed. Check draft format.')
    process.exit(1)
  }

  const { data: existing } = await supabase
    .from('problems')
    .select('title')
    .eq('created_by_name', bryanName)
  const existingTitles = new Set((existing ?? []).map(p => p.title))

  let inserted = 0, skipped = 0
  for (const p of problems) {
    if (existingTitles.has(p.title)) {
      console.log(`⏭️  Skip (sudah ada): [${p.level}] ${p.title}`)
      skipped++
      continue
    }

    const { error } = await supabase.from('problems').insert({
      title: p.title,
      description: p.description,
      level: p.level,
      points: p.points,
      created_by: bryanId,
      created_by_name: bryanName,
    })

    if (error) {
      console.error(`❌ Failed: ${p.title} — ${error.message}`)
    } else {
      console.log(`✅ Inserted: [${p.level} ${p.points}pts] ${p.title}`)
      inserted++
    }
  }

  console.log(`\n🎉 Done. Inserted: ${inserted}, Skipped: ${skipped}, Total parsed: ${problems.length}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
