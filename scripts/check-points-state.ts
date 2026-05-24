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

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
})

async function main() {
  const { data: problems } = await supabase
    .from('problems')
    .select('level, points')
  const byLevel: Record<string, number[]> = {}
  for (const p of problems ?? []) {
    byLevel[p.level] = byLevel[p.level] ?? []
    byLevel[p.level].push(p.points)
  }
  console.log('Problems by level:')
  for (const lv of ['easy', 'medium', 'hard', 'super']) {
    const arr = byLevel[lv] ?? []
    const uniq = [...new Set(arr)]
    console.log(`  ${lv}: ${arr.length} problem(s), points: ${uniq.join(', ') || '-'}`)
  }

  const { data: accSubs } = await supabase
    .from('submissions')
    .select('verdict, points_awarded, problem_id')
    .eq('verdict', 'accepted')
  console.log(`\nAccepted submissions: ${(accSubs ?? []).length}`)
  if ((accSubs ?? []).length > 0) {
    const { data: probList } = await supabase
      .from('problems')
      .select('id, level')
    const levelById = new Map(probList?.map(p => [p.id, p.level]))
    const byLv: Record<string, number> = {}
    for (const s of accSubs!) {
      const lv = levelById.get(s.problem_id) ?? 'unknown'
      byLv[lv] = (byLv[lv] ?? 0) + 1
    }
    for (const [lv, cnt] of Object.entries(byLv)) {
      console.log(`  ${lv}: ${cnt} accepted submission(s)`)
    }
  }
}

main().catch(err => { console.error(err); process.exit(1) })
