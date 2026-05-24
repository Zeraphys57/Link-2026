import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) dotenv.config({ path: envPath })
else dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  }
)

// Should mirror LEVEL_POINTS in src/lib/types.ts. Idempotent.
const TARGETS: Record<'easy' | 'medium' | 'hard' | 'super', number> = {
  easy: 100,
  medium: 300,
  hard: 700,
  super: 200,
}

async function main() {
  console.log('Syncing problem points to:', TARGETS, '\n')

  for (const [level, points] of Object.entries(TARGETS) as [keyof typeof TARGETS, number][]) {
    const { data, error } = await supabase
      .from('problems')
      .update({ points })
      .eq('level', level)
      .select('id')
    if (error) {
      console.error(`❌ ${level} error:`, error.message)
      process.exit(1)
    }
    console.log(`✅ ${level}: ${data?.length ?? 0} problem(s) → ${points} pts`)

    // Update accepted submissions' points_awarded to match (kalau ada)
    const { data: probs } = await supabase
      .from('problems')
      .select('id')
      .eq('level', level)
    const ids = (probs ?? []).map(p => p.id)
    if (ids.length === 0) continue
    const { data: subs, error: sErr } = await supabase
      .from('submissions')
      .update({ points_awarded: points })
      .eq('verdict', 'accepted')
      .in('problem_id', ids)
      .select('id')
    if (sErr) {
      console.error(`   ⚠️  submissions error: ${sErr.message}`)
    } else if ((subs?.length ?? 0) > 0) {
      console.log(`   ↳ retro: ${subs?.length} accepted submission(s) → ${points} pts`)
    }
  }

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
