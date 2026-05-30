'use client'

import Modal from './Modal'
import LevelBadge from './LevelBadge'
import { formatDuration } from './Stopwatch'
import { CheckCircle2, XCircle, Hourglass, PlayCircle, Clock } from 'lucide-react'
import type { Problem, Submission } from '@/lib/types'

interface Props {
  open: boolean
  teamName: string | null
  problems: Problem[]
  submissions: Submission[]
  onClose: () => void
}

type SubState = 'in_progress' | 'awaiting_grade' | 'accepted' | 'rejected'

function stateOf(s: Submission): SubState {
  if (s.verdict === 'accepted') return 'accepted'
  if (s.verdict === 'rejected') return 'rejected'
  if (s.submitted_at) return 'awaiting_grade'
  return 'in_progress'
}

const STATE_RANK: Record<SubState, number> = {
  in_progress: 0,
  awaiting_grade: 1,
  rejected: 2,
  accepted: 3,
}

export default function TeamDetailModal({ open, teamName, problems, submissions, onClose }: Props) {
  if (!teamName) return null

  const teamSubs = submissions.filter(s => s.team_name === teamName)
  const problemMap = new Map(problems.map(p => [p.id, p]))

  const accepted = teamSubs.filter(s => s.verdict === 'accepted')
  const rejected = teamSubs.filter(s => s.verdict === 'rejected')
  const pending = teamSubs.filter(s => !s.verdict && s.submitted_at)
  const inProgress = teamSubs.filter(s => !s.verdict && !s.submitted_at)

  // Total poin: dedup, satu accepted per (team, problem), pilih durasi tercepat.
  const bestPerProblem = new Map<string, Submission>()
  for (const s of accepted) {
    if (!s.points_awarded) continue
    const existing = bestPerProblem.get(s.problem_id)
    if (!existing || (s.duration_seconds ?? Infinity) < (existing.duration_seconds ?? Infinity)) {
      bestPerProblem.set(s.problem_id, s)
    }
  }
  const totalPoints = [...bestPerProblem.values()].reduce((sum, s) => sum + (s.points_awarded ?? 0), 0)
  const totalDuration = [...bestPerProblem.values()].reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0)

  const totalGraded = accepted.length + rejected.length
  const accuracy = totalGraded > 0 ? Math.round(accepted.length / totalGraded * 100) : null

  // Urut: in-progress → pending → rejected → accepted, dalam tiap grup terbaru duluan.
  const sortedSubs = [...teamSubs].sort((a, b) => {
    const cmp = STATE_RANK[stateOf(a)] - STATE_RANK[stateOf(b)]
    if (cmp !== 0) return cmp
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <Modal open={open} onClose={onClose} title={`Detail Tim — ${teamName}`} size="lg">
      <div className="p-6 space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard label="Diterima" value={bestPerProblem.size} tone="emerald" />
          <StatCard label="Ditolak" value={rejected.length} tone="red" />
          <StatCard label="Menunggu" value={pending.length} tone="amber" />
          <StatCard label="Sedang Aktif" value={inProgress.length} tone="blue" />
        </div>

        {/* Total points + accuracy + duration */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold">Total Poin</div>
            <div className="text-3xl font-black text-yellow-300 tabular-nums leading-none mt-1">{totalPoints}</div>
          </div>
          {accuracy !== null && (
            <div className="text-center">
              <div className="text-[10px] text-yellow-600 uppercase tracking-widest font-medium">Winrate</div>
              <div className="text-2xl font-black tabular-nums leading-none mt-1" style={{ color: accuracy >= 70 ? '#86efac' : accuracy >= 50 ? '#fcd34d' : '#fca5a5' }}>
                {accuracy}%
              </div>
              <div className="text-[10px] text-yellow-700 mt-0.5">{accepted.length}/{totalGraded}</div>
            </div>
          )}
          <div className="text-right">
            <div className="text-[10px] text-yellow-700 uppercase tracking-widest font-medium">Total Durasi</div>
            <div className="text-sm text-yellow-500 tabular-nums mt-1.5 flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(totalDuration)}
            </div>
          </div>
        </div>

        {/* Submissions list */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-3">
            Semua Submission ({sortedSubs.length})
          </p>
          {sortedSubs.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8 bg-gray-950/40 rounded-xl">
              Tim ini belum ngambil soal apa pun.
            </p>
          ) : (
            <div className="space-y-1.5">
              {sortedSubs.map(s => (
                <SubRow key={s.id} sub={s} problem={problemMap.get(s.problem_id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'red' | 'amber' | 'blue' }) {
  const tones: Record<typeof tone, string> = {
    emerald: 'text-emerald-300 bg-emerald-500/8 border-emerald-500/25',
    red: 'text-red-300 bg-red-500/8 border-red-500/25',
    amber: 'text-amber-300 bg-amber-500/8 border-amber-500/25',
    blue: 'text-blue-300 bg-blue-500/8 border-blue-500/25',
  }
  return (
    <div className={`border rounded-lg p-3 text-center ${tones[tone]}`}>
      <div className="text-2xl font-bold tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest opacity-70 mt-1.5">{label}</div>
    </div>
  )
}

function SubRow({ sub, problem }: { sub: Submission; problem?: Problem }) {
  const state = stateOf(sub)
  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-gray-950/40 rounded-lg border border-gray-800/60 flex-wrap">
      {problem ? <LevelBadge level={problem.level} size="sm" /> : <span className="text-xs text-gray-700">—</span>}
      <span className="text-sm text-gray-200 font-medium flex-1 min-w-0 truncate">
        {problem?.title ?? '(soal terhapus)'}
      </span>
      <StateBadge state={state} />
      {sub.duration_seconds != null && (
        <span className="flex items-center gap-1 text-xs text-gray-500 tabular-nums">
          <Clock className="w-3 h-3" />
          {formatDuration(sub.duration_seconds)}
        </span>
      )}
      {state === 'accepted' && sub.points_awarded != null && (
        <span className="text-xs text-emerald-400 font-bold tabular-nums">+{sub.points_awarded}</span>
      )}
    </div>
  )
}

function StateBadge({ state }: { state: SubState }) {
  if (state === 'in_progress') {
    return <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded-full"><PlayCircle className="w-2.5 h-2.5" />Aktif</span>
  }
  if (state === 'awaiting_grade') {
    return <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-full font-semibold"><Hourglass className="w-2.5 h-2.5" />Menunggu</span>
  }
  if (state === 'accepted') {
    return <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full"><CheckCircle2 className="w-2.5 h-2.5" />Diterima</span>
  }
  return <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded-full"><XCircle className="w-2.5 h-2.5" />Ditolak</span>
}
