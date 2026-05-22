'use client'

import { useState, useMemo } from 'react'
import { Leaf, Zap, Flame, Crown } from 'lucide-react'
import type { Profile, Problem, Submission, Level } from '@/lib/types'
import ProblemCard from './ProblemCard'
import ClaimModal from './ClaimModal'
import WorkingModal from './WorkingModal'
import { LEVEL_COUNT_PILL } from '@/components/ui/LevelBadge'

interface Props {
  problems: Problem[]
  submissions: Submission[]
  profile: Profile
  // Sesi Challenge: kalau true, peserta hanya melihat soal Challenge — soal Final
  // (easy/medium/hard) disembunyikan. Dikontrol admin lewat tabel app_settings.
  challengeOnly: boolean
  onProblemsChange: (problems: Problem[]) => void
  onSubmissionsChange: (submissions: Submission[]) => void
}

const LEVEL_ORDER: Level[] = ['easy', 'medium', 'hard', 'super']
const LEVEL_LABELS: Record<Level, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  super: 'Challenge',
}
const LEVEL_COLORS: Record<Level, string> = {
  easy: 'text-emerald-400',
  medium: 'text-orange-400',
  hard: 'text-purple-400',
  super: 'text-blue-400',
}
const LEVEL_DIVIDER: Record<Level, string> = {
  easy: 'bg-emerald-500/15',
  medium: 'bg-orange-500/15',
  hard: 'bg-purple-500/15',
  super: 'bg-blue-500/15',
}
const LEVEL_ICONS = {
  easy: Leaf,
  medium: Zap,
  hard: Flame,
  super: Crown,
}

export default function ProblemBoard({ problems, submissions, profile, challengeOnly, onSubmissionsChange }: Props) {
  const [claimTarget, setClaimTarget] = useState<Problem | null>(null)
  const [workingTarget, setWorkingTarget] = useState<Problem | null>(null)

  const visibleProblems = challengeOnly
    ? problems.filter(p => p.level === 'super')
    : problems

  const grouped = LEVEL_ORDER.reduce<Record<Level, Problem[]>>((acc, level) => {
    acc[level] = visibleProblems.filter(p => p.level === level)
    return acc
  }, { easy: [], medium: [], hard: [], super: [] })

  // Latest submission per (my team, problem) — re-attempts after rejection produce
  // multiple rows, so we keep the most recent one.
  const myLatestByProblem = useMemo(() => {
    const map = new Map<string, Submission>()
    for (const sub of submissions) {
      if (sub.team_name !== profile.team_name) continue
      const existing = map.get(sub.problem_id)
      if (!existing || new Date(sub.created_at) > new Date(existing.created_at)) {
        map.set(sub.problem_id, sub)
      }
    }
    return map
  }, [submissions, profile.team_name])

  // Count of OTHER teams that have an accepted submission for each problem.
  const acceptedOtherCountByProblem = useMemo(() => {
    const teamsByProblem = new Map<string, Set<string>>()
    for (const sub of submissions) {
      if (sub.verdict !== 'accepted') continue
      if (sub.team_name === profile.team_name) continue
      if (!teamsByProblem.has(sub.problem_id)) teamsByProblem.set(sub.problem_id, new Set())
      teamsByProblem.get(sub.problem_id)!.add(sub.team_name)
    }
    return teamsByProblem
  }, [submissions, profile.team_name])

  return (
    <div className="space-y-8">
      {LEVEL_ORDER.map(level => {
        const levelProblems = grouped[level]
        if (levelProblems.length === 0) return null

        const LevelIcon = LEVEL_ICONS[level]
        return (
          <section key={level}>
            <div className="flex items-center gap-2.5 mb-5">
              <LevelIcon className={`w-4 h-4 ${LEVEL_COLORS[level]} flex-shrink-0`} />
              <h2 className={`text-sm font-bold tracking-wide ${LEVEL_COLORS[level]}`}>
                {LEVEL_LABELS[level]}
              </h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COUNT_PILL[level]}`}>
                {levelProblems.length} soal
              </span>
              <div className={`flex-1 h-px ${LEVEL_DIVIDER[level]}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {levelProblems.map(problem => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  profile={profile}
                  mySubmission={myLatestByProblem.get(problem.id)}
                  acceptedByOtherTeams={acceptedOtherCountByProblem.get(problem.id)?.size ?? 0}
                  onClaim={() => setClaimTarget(problem)}
                  onWork={() => setWorkingTarget(problem)}
                />
              ))}
            </div>
          </section>
        )
      })}

      {claimTarget && (
        <ClaimModal
          problem={claimTarget}
          profile={profile}
          onClose={() => setClaimTarget(null)}
          onClaimed={(newSubmission) => {
            onSubmissionsChange([newSubmission, ...submissions])
            setClaimTarget(null)
          }}
        />
      )}

      {workingTarget && myLatestByProblem.get(workingTarget.id) && (
        <WorkingModal
          problem={workingTarget}
          submission={myLatestByProblem.get(workingTarget.id)!}
          onClose={() => setWorkingTarget(null)}
          onSubmitted={(updatedSubmission) => {
            onSubmissionsChange(submissions.map(s => s.id === updatedSubmission.id ? updatedSubmission : s))
            setWorkingTarget(null)
          }}
        />
      )}
    </div>
  )
}
