import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PanitiaDashboard from '@/components/panitia/PanitiaDashboard'
import { isAdminEmail } from '@/lib/admin'
import { DEFAULT_CONTEST_DURATION_SECONDS } from '@/lib/types'

export default async function PanitiaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, problemsResult, submissionsResult, settingsResult, timerResult, leaderboardHiddenResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('problems').select('*').order('level', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('submissions').select('*').order('created_at', { ascending: false }),
    supabase.from('app_settings').select('bool_value').eq('key', 'challenge_only').maybeSingle(),
    supabase.from('app_settings').select('ts_value, int_value').eq('key', 'contest_timer').maybeSingle(),
    supabase.from('app_settings').select('bool_value').eq('key', 'leaderboard_hidden').maybeSingle(),
  ])

  if (!profileResult.data || profileResult.data.role !== 'panitia') redirect('/login')

  return (
    <PanitiaDashboard
      profile={profileResult.data}
      initialProblems={problemsResult.data ?? []}
      initialSubmissions={submissionsResult.data ?? []}
      isAdmin={isAdminEmail(user.email)}
      initialChallengeOnly={settingsResult.data?.bool_value ?? true}
      initialContestTimer={{
        startAt: timerResult.data?.ts_value ?? null,
        durationSeconds: timerResult.data?.int_value ?? DEFAULT_CONTEST_DURATION_SECONDS,
      }}
      initialLeaderboardHidden={leaderboardHiddenResult.data?.bool_value ?? false}
    />
  )
}
