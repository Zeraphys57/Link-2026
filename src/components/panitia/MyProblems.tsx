'use client'

import { useState, useMemo } from 'react'
import { ClipboardCheck, ClipboardList, Clock, CheckCircle2, XCircle, Hourglass, PlayCircle, Pencil, RotateCcw, TimerOff, ChevronDown, Search, X } from 'lucide-react'
import { CHALLENGE_DURATION_SECONDS } from '@/lib/types'
import type { Problem, Submission, Level } from '@/lib/types'
import LevelBadge from '@/components/ui/LevelBadge'
import Stopwatch, { formatDuration } from '@/components/ui/Stopwatch'
import TeamDetailModal from '@/components/ui/TeamDetailModal'
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
  const [teamDetailFor, setTeamDetailFor] = useState<string | null>(null)
  // User override per problem: true=expanded, false=collapsed. Absent = use default (expand if needs grading).
  const [userToggled, setUserToggled] = useState<Record<string, boolean>>({})

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

  // Search + filter state
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all')
  const [needsGradingOnly, setNeedsGradingOnly] = useState(false)

  const filteredProblems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sortedProblems.filter(p => {
      if (levelFilter !== 'all' && p.level !== levelFilter) return false
      if (q && !p.title.toLowerCase().includes(q)) return false
      if (needsGradingOnly) {
        const subs = subsByProblem.get(p.id) ?? []
        const needs = subs.some(s => stateOf(s) === 'awaiting_grade')
        if (!needs) return false
      }
      return true
    })
  }, [sortedProblems, search, levelFilter, needsGradingOnly, subsByProblem])

  if (problems.length === 0) {
    return (
      <div className="text-center py-24">
        <ClipboardCheck className="w-10 h-10 mx-auto mb-4 text-gray-700" />
        <p className="text-base font-semibold text-gray-500">Belum ada soal</p>
        <p className="text-sm text-gray-700 mt-1">Tambahkan soal baru di tab &quot;Tambah Soal&quot;.</p>
      </div>
    )
  }

  const totalNeedsGrading = sortedProblems.reduce((acc, p) => {
    const subs = subsByProblem.get(p.id) ?? []
    return acc + (subs.some(s => stateOf(s) === 'awaiting_grade') ? 1 : 0)
  }, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">
          {filteredProblems.length === sortedProblems.length
            ? `${sortedProblems.length} soal ${isAdmin ? 'dari semua panitia' : 'oleh kamu'}`
            : `${filteredProblems.length} dari ${sortedProblems.length} soal`}
        </p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
        needsGradingOnly={needsGradingOnly}
        onNeedsGradingChange={setNeedsGradingOnly}
        totalNeedsGrading={totalNeedsGrading}
      />

      {filteredProblems.length === 0 ? (
        <div className="text-center py-12 bg-gray-950/30 rounded-xl border border-gray-800/60">
          <Search className="w-8 h-8 mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500">Tidak ada soal yang cocok dengan filter.</p>
          <button
            onClick={() => { setSearch(''); setLevelFilter('all'); setNeedsGradingOnly(false) }}
            className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline"
          >
            Reset semua filter
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
      {filteredProblems.map(problem => {
        const subs = subsByProblem.get(problem.id) ?? []
        const needsGradingCount = subs.filter(s => stateOf(s) === 'awaiting_grade').length
        const canCollapse = subs.length > 0
        const defaultExpanded = needsGradingCount > 0
        const expanded = userToggled[problem.id] ?? defaultExpanded

        const cardBorder = needsGradingCount > 0 ? 'border-amber-500/50' : 'border-gray-800'
        const cardBg = needsGradingCount > 0 ? 'bg-amber-950/25' : 'bg-gray-900'

        return (
          <div
            key={problem.id}
            className={`border ${cardBorder} ${cardBg} rounded-xl p-5 transition-all duration-200`}
            style={needsGradingCount > 0 ? { animation: 'rank1-pulse 3s ease-in-out infinite' } : undefined}
          >
            {/* Header */}
            <div
              className={`flex items-start justify-between gap-4 flex-wrap ${canCollapse ? 'cursor-pointer select-none' : ''}`}
              onClick={canCollapse ? () => setUserToggled(prev => ({ ...prev, [problem.id]: !expanded })) : undefined}
            >
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
                  onClick={(e) => { e.stopPropagation(); setEditTarget(problem) }}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-amber-300 bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                {canCollapse && (
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
                  />
                )}
              </div>
            </div>

            {/* Submissions list */}
            {subs.length > 0 && expanded && (
              <div className="mt-4 pt-3 border-t border-gray-800/60 space-y-2">
                {subs.map(sub => (
                  <SubmissionRow
                    key={sub.id}
                    submission={sub}
                    isChallenge={problem.level === 'super'}
                    onGrade={() => setGradeTarget({ problem, submission: sub })}
                    onTeamClick={() => setTeamDetailFor(sub.team_name)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
      </div>
      )}

      <TeamDetailModal
        open={teamDetailFor !== null}
        teamName={teamDetailFor}
        problems={problems}
        submissions={submissions}
        onClose={() => setTeamDetailFor(null)}
      />

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

// Timer mundur soal Challenge di dashboard panitia. Saat 30 menit habis,
// berhenti dan berubah jadi badge "Timeout" hitam — tidak terus berjalan.
function ChallengeCountdown({ startedAt }: { startedAt: string }) {
  const [expired, setExpired] = useState(
    () => (Date.now() - new Date(startedAt).getTime()) / 1000 >= CHALLENGE_DURATION_SECONDS
  )

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 bg-black border border-gray-700 px-2 py-0.5 rounded-full">
        <TimerOff className="w-3 h-3" />
        Timeout
      </span>
    )
  }

  return (
    <Stopwatch
      startTime={startedAt}
      countdownFrom={CHALLENGE_DURATION_SECONDS}
      onExpire={() => setExpired(true)}
      className="text-xs tabular-nums"
      showIcon={false}
    />
  )
}

function SubmissionRow({ submission, isChallenge, onGrade, onTeamClick }: { submission: Submission; isChallenge: boolean; onGrade: () => void; onTeamClick: () => void }) {
  const state = stateOf(submission)

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 bg-gray-950/40 rounded-lg flex-wrap">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onTeamClick}
          className="text-sm font-medium text-gray-200 whitespace-nowrap hover:text-amber-300 transition-colors text-left"
          title="Lihat semua submission tim ini"
        >
          Tim <span className="text-white font-bold underline decoration-dotted decoration-gray-600 underline-offset-2 hover:decoration-amber-400">{submission.team_name}</span>
        </button>
        <StateBadge state={state} />
        {state === 'in_progress' && (
          isChallenge ? (
            <ChallengeCountdown startedAt={submission.started_at} />
          ) : (
            <Stopwatch
              startTime={submission.started_at}
              className="text-xs text-blue-400 tabular-nums"
              showIcon={false}
            />
          )
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

      {state === 'rejected' && (
        <button
          onClick={onGrade}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 active:scale-[0.98] text-gray-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 border border-gray-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Cek Ulang
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

const LEVEL_PILL_CONFIG: Record<Level | 'all', { label: string; className: string; activeClassName: string }> = {
  all:    { label: 'Semua',     className: 'text-gray-400 bg-gray-800 border-gray-700 hover:bg-gray-700',                   activeClassName: 'text-white bg-amber-500 border-amber-400 hover:bg-amber-400' },
  easy:   { label: 'Easy',      className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25 hover:bg-emerald-400/20', activeClassName: 'text-white bg-emerald-500 border-emerald-400' },
  medium: { label: 'Medium',    className: 'text-orange-400 bg-orange-400/10 border-orange-400/25 hover:bg-orange-400/20',     activeClassName: 'text-white bg-orange-500 border-orange-400' },
  hard:   { label: 'Hard',      className: 'text-purple-400 bg-purple-400/10 border-purple-400/25 hover:bg-purple-400/20',     activeClassName: 'text-white bg-purple-500 border-purple-400' },
  super:  { label: 'Challenge', className: 'text-blue-400 bg-blue-400/10 border-blue-400/25 hover:bg-blue-400/20',             activeClassName: 'text-white bg-blue-500 border-blue-400' },
}

function FilterBar({
  search, onSearchChange,
  levelFilter, onLevelChange,
  needsGradingOnly, onNeedsGradingChange,
  totalNeedsGrading,
}: {
  search: string
  onSearchChange: (v: string) => void
  levelFilter: Level | 'all'
  onLevelChange: (l: Level | 'all') => void
  needsGradingOnly: boolean
  onNeedsGradingChange: (v: boolean) => void
  totalNeedsGrading: number
}) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 space-y-2.5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Cari judul soal…"
          className="w-full bg-gray-950/60 border border-gray-800 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            title="Bersihkan pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'easy', 'medium', 'hard', 'super'] as const).map(l => {
          const cfg = LEVEL_PILL_CONFIG[l]
          const active = levelFilter === l
          return (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              className={`text-xs font-semibold border rounded-full px-3 py-1 transition-colors ${active ? cfg.activeClassName : cfg.className}`}
            >
              {cfg.label}
            </button>
          )
        })}

        <button
          onClick={() => onNeedsGradingChange(!needsGradingOnly)}
          disabled={totalNeedsGrading === 0 && !needsGradingOnly}
          className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            needsGradingOnly
              ? 'bg-amber-500 border-amber-400 text-white'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Hourglass className="w-3 h-3" />
          Perlu Dinilai
          {totalNeedsGrading > 0 && (
            <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${needsGradingOnly ? 'bg-amber-700/50' : 'bg-amber-500/20'}`}>
              {totalNeedsGrading}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
