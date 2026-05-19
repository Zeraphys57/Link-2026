import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PanitiaDashboard from '@/components/panitia/PanitiaDashboard'

export default async function PanitiaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, problemsResult, submissionsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('problems').select('*').order('level', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('submissions').select('*').order('created_at', { ascending: false }),
  ])

  if (!profileResult.data || profileResult.data.role !== 'panitia') redirect('/login')

  return (
    <PanitiaDashboard
      profile={profileResult.data}
      initialProblems={problemsResult.data ?? []}
      initialSubmissions={submissionsResult.data ?? []}
    />
  )
}
