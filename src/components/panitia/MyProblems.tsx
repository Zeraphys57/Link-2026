'use client'

import { useState, useMemo } from 'react'
import { ClipboardCheck, ClipboardList, Clock, CheckCircle2, XCircle, Hourglass, PlayCircle, Pencil } from 'lucide-react'
import type { Problem, Submission } from '@/lib/types'
import LevelBadge from '@/components/ui/LevelBadge'
import Stopwatch, { formatDuration } from '@/components/ui/Stopwatch'
import GradeModal from './GradeModal'
import EditProblemModal from './EditProblemModal'

interface Props {
  problems: Problem[]
  submissions: Submission[]
  isAdmin?: boolean
  onSubmissionsChange: (updated: Submission[]) => void
  onProblemUpdated: (problem: Problem) => void
}

type SubmissionState = 'in_progress' | 'awaiting_grade' | 'accepted' | 'rejected'

function stateOf(s: Submission): SubmissionState {
  if (s.verdict === 'accepted') return 'accepted'
  if (s.verdict === 'rejected') return 'rejected'
  if (s.submitted_at) return 'awaiting_grade'
  return 'in_progress'
}

export default function MyProblems({ problems, submissions, isAdmin = false, onSubmissionsChange, onProblemUpdated }: Props) {
  const [gradeTarget, setGradeTarget] = useState<{ problem: Problem; submission: Submission } | null>(null)
  const [editTarget, setEditTarget] = useState<Problem | null>(null)

  // Group submissions by problem.
  const subsByProblem = useMemo(() => {
    const map = new Map<string, Submission[]>()
    for (const sub of submissions) {
      if (!map.has(sub.problem_id)) map.set(sub.problem_id, [])
      map.get(sub.problem_id)!.push(sub)
    }
    // Sort within each problem: needs-grading first, then in-progress, then graded.
    const stateRank: Record<SubmissionState, number> = {
      awaiting_grade: 0, in_progress: 1, rejected: 2, accepted: 3,
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const cmp = stateRank[stateOf(a)] - stateRank[stateOf(b)]
        if (cmp !== 0) return cmp
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }
    return map
  }, [submissions])

  // Sort problems: any problem with submissions needing grading goes first.
  const sortedProblems = useMemo(() => {
    return [...problems].sort((a, b) => {
      const aNeeds = subsByProblem.get(a.id)?.some(s => stateOf(s) === 'awaiting_grade') ? 0 : 1
      const bNeeds = subsByProblem.get(b.id)?.some(s => stateOf(s) === 'awaiting_grade') ? 0 : 1
      if (aNeeds !== bNeeds) return aNeeds - bNeeds
      return a.title.localeCompare(b.title)
    })
  }, [problems, subsByProblem])

  if (problems.length === 0) {
    return (
      <div className="text-center py-24">
        <ClipboardCheck className="w-10 h-10 mx-auto mb-4 text-gray-700" />
        <p className="text-base font-semibold text-gray-500">Belum ada soal</p>
        <p className="text-sm text-gray-700 mt-1">Tambahkan soal baru di tab &quot;Tambah Soal&quot;.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">
        {problems.length} soal {isAdmin ? 'dari semua panitia' : 'oleh kamu'}
      </p>

      {sortedProblems.map(problem => {
        const subs = subsByProblem.get(problem.id) ?? []
        const needsGradingCount = subs.filter(s => stateOf(s) === 'awaiting_grade').length

        const cardBorder = needsGradingCount > 0 ? 'border-amber-500/50' : 'border-gray-800'
        const cardBg = needsGradingCount > 0 ? 'bg-amber-950/25' : 'bg-gray-900'

        return (
          <div
            key={problem.id}
            className={`border ${cardBorder} ${cardBg} rounded-xl p-5 transition-all duration-200`}
            style={needsGradingCount > 0 ? { animation: 'rank1-pulse 3s ease-in-out infinite' } : undefined}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <LevelBadge level={problem.level} />
                  <span className="text-xs text-gray-600 font-mono">{problem.points} pts</span>
                  {needsGradingCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {needsGradingCount} perlu dinilai
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white leading-snug">{problem.title}</h3>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-600">
                  {subs.length === 0 ? 'belum diambil tim' : `${subs.length} submission`}
                </span>
                <button
                  onClick={() => setEditTarget(problem)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-amber-300 bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>

            {/* Submissions list */}
            {subs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-800/60 space-y-2">
                {subs.map(sub => (
                  <SubmissionRow
                    key={sub.id}
                    submission={sub}
                    onGrade={() => setGradeTarget({ problem, submission: sub })}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {gradeTarget && (
        <GradeModal
          problem={gradeTarget.problem}
          submission={gradeTarget.submission}
          onClose={() => setGradeTarget(null)}
          onGraded={(updatedSubmission) => {
            onSubmissionsChange([updatedSubmission])
            setGradeTarget(null)
          }}
        />
      )}

      {editTarget && (
        <EditProblemModal
          problem={editTarget}
          hasSubmissions={(subsByProblem.get(editTarget.id)?.length ?? 0) > 0}
          onClose={() => setEditTarget(null)}
          onUpdated={(updated) => {
            onProblemUpdated(updated)
            setEditTarget(null)
          }}
        />
      )}
    </div>
  )
}

function SubmissionRow({ submission, onGrade }: { submission: Submission; onGrade: () => void }) {
  const state = stateOf(submission)

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 bg-gray-950/40 rounded-lg flex-wrap">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-200 whitespace-nowrap">
          Tim <span className="text-white font-bold">{submission.team_name}</span>
        </span>
        <StateBadge state={state} />
        {state === 'in_progress' && (
          <Stopwatch
            startTime={submission.started_at}
            className="text-xs text-blue-400 tabular-nums"
            showIcon={false}
          />
        )}
        {state !== 'in_progress' && submission.duration_seconds != null && (
          <span className="flex items-center gap-1 text-xs text-gray-500 tabular-nums">
            <Clock className="w-3 h-3" />
            {formatDuration(submission.duration_seconds)}
          </span>
        )}
        {state === 'accepted' && submission.points_awarded != null && (
          <span className="text-xs text-emerald-400 font-bold">+{submission.points_awarded} pts</span>
        )}
        {submission.notes && (
          <span className="text-xs text-gray-600 italic truncate min-w-0">&quot;{submission.notes}&quot;</span>
        )}
      </div>

      {state === 'awaiting_grade' && (
        <button
          onClick={onGrade}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 active:scale-[0.98] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Koreksi
        </button>
      )}
    </div>
  )
}

function StateBadge({ state }: { state: SubmissionState }) {
  if (state === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
        <PlayCircle className="w-3 h-3" />
        Dikerjakan
      </span>
    )
  }
  if (state === 'awaiting_grade') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full font-semibold">
        <Hourglass className="w-3 h-3" />
        Perlu Dinilai
      </span>
    )
  }
  if (state === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        Diterima
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" />
      Ditolak
    </span>
  )
}
