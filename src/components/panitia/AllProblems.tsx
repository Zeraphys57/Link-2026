'use client'

import { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown, CheckCircle2, Hourglass, PlayCircle, XCircle } from 'lucide-react'
import type { Problem, Submission, Level } from '@/lib/types'
import LevelBadge from '@/components/ui/LevelBadge'

interface Props {
  problems: Problem[]
  submissions: Submission[]
}

type SortKey = 'level' | 'activity' | 'title' | 'points'
type SortDir = 'asc' | 'desc'

const LEVEL_ORDER: Record<Level, number> = { easy: 0, medium: 1, hard: 2, super: 3 }

interface ProblemStats {
  inProgress: number
  awaitingGrade: number
  accepted: number
  rejected: number
}

function statsFor(problemId: string, submissions: Submission[]): ProblemStats {
  const stats: ProblemStats = { inProgress: 0, awaitingGrade: 0, accepted: 0, rejected: 0 }
  for (const s of submissions) {
    if (s.problem_id !== problemId) continue
    if (s.verdict === 'accepted') stats.accepted++
    else if (s.verdict === 'rejected') stats.rejected++
    else if (s.submitted_at) stats.awaitingGrade++
    else stats.inProgress++
  }
  return stats
}

// Rank by urgency: pending grading first, then active work, then completed.
function activityRank(s: ProblemStats): number {
  return s.awaitingGrade * 1000 + s.inProgress * 10 + s.accepted
}

export default function AllProblems({ problems, submissions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('activity')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const teamsByProblem = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const s of submissions) {
      if (!map.has(s.problem_id)) map.set(s.problem_id, new Set())
      map.get(s.problem_id)!.add(s.team_name)
    }
    return map
  }, [submissions])

  const statsByProblem = useMemo(() => {
    const map = new Map<string, ProblemStats>()
    for (const p of problems) map.set(p.id, statsFor(p.id, submissions))
    return map
  }, [problems, submissions])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'activity' ? 'desc' : 'asc') }
  }

  const sorted = useMemo(() => {
    return [...problems].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'level') cmp = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
      else if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortKey === 'points') cmp = a.points - b.points
      else if (sortKey === 'activity') {
        cmp = activityRank(statsByProblem.get(a.id)!) - activityRank(statsByProblem.get(b.id)!)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [problems, sortKey, sortDir, statsByProblem])

  const pendingGradeCount = submissions.filter(s => !s.verdict && s.submitted_at).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">{problems.length} soal total</p>
        {pendingGradeCount > 0 && (
          <span className="text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full">
            {pendingGradeCount} submission menunggu penilaian
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              {([
                { key: 'title', label: 'Judul Soal' },
                { key: 'level', label: 'Level' },
                { key: 'points', label: 'Poin' },
                { key: 'activity', label: 'Aktivitas' },
              ] as { key: SortKey; label: string }[]).map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium cursor-pointer whitespace-nowrap transition-colors group"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className={`flex items-center gap-1.5 ${sortKey === col.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    {col.label}
                    {sortKey === col.key
                      ? sortDir === 'asc'
                        ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                        : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                      : <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60" />
                    }
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">Tim Terlibat</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">Pembuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {sorted.map(problem => {
              const stats = statsByProblem.get(problem.id)!
              const teams = teamsByProblem.get(problem.id)
              const rowBg = stats.awaitingGrade > 0
                ? 'bg-amber-950/20 hover:bg-amber-950/30'
                : stats.inProgress > 0
                ? 'bg-blue-950/10 hover:bg-blue-950/20'
                : 'bg-gray-900/50 hover:bg-gray-800/40'

              return (
                <tr key={problem.id} className={`transition-colors ${rowBg}`}>
                  <td className="px-4 py-3 font-medium text-white">{problem.title}</td>
                  <td className="px-4 py-3">
                    <LevelBadge level={problem.level} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono tabular-nums">{problem.points}</td>
                  <td className="px-4 py-3">
                    <ActivityChips stats={stats} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {teams && teams.size > 0
                      ? <span className="text-gray-300">{[...teams].join(', ')}</span>
                      : <span className="text-gray-700">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500">{problem.created_by_name}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActivityChips({ stats }: { stats: ProblemStats }) {
  const allZero = stats.inProgress + stats.awaitingGrade + stats.accepted + stats.rejected === 0
  if (allZero) {
    return <span className="text-xs text-gray-700">belum ada aktivitas</span>
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {stats.awaitingGrade > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
          <Hourglass className="w-3 h-3" />
          {stats.awaitingGrade}
        </span>
      )}
      {stats.inProgress > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
          <PlayCircle className="w-3 h-3" />
          {stats.inProgress}
        </span>
      )}
      {stats.accepted > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          {stats.accepted}
        </span>
      )}
      {stats.rejected > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" />
          {stats.rejected}
        </span>
      )}
    </div>
  )
}
