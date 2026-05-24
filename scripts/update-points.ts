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

async function main() {
  console.log('Updating points: medium 250→300, hard 500→1000\n')

  const { data: mediums, error: mErr } = await supabase
    .from('problems')
    .update({ points: 300 })
    .eq('level', 'medium')
    .select('id')
  if (mErr) { console.error('medium error:', mErr.message); process.exit(1) }
  console.log(`✅ Medium updated: ${mediums?.length ?? 0} problem(s) → 300 pts`)

  const { data: hards, error: hErr } = await supabase
    .from('problems')
    .update({ points: 1000 })
    .eq('level', 'hard')
    .select('id')
  if (hErr) { console.error('hard error:', hErr.message); process.exit(1) }
  console.log(`✅ Hard updated: ${hards?.length ?? 0} problem(s) → 1000 pts`)

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
