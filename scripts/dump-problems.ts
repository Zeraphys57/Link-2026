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
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
})

async function main() {
  const { data, error } = await supabase
    .from('problems')
    .select('title, level, points, created_by_name, description, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Query error:', error.message)
    process.exit(1)
  }

  console.log(JSON.stringify(data, null, 2))
  console.log(`\n[Total: ${data?.length ?? 0} soal]`)
}

main()
