'use client'

import { CheckCircle, Clock, Lock, MessageSquareText, RotateCcw, Users } from 'lucide-react'
import type { Profile, Problem, Submission, Level } from '@/lib/types'
import { CHALLENGE_DURATION_SECONDS } from '@/lib/types'
import LevelBadge, {
  levelBorderClass,
  levelRingClass,
  levelAvailableAnimation,
  LEVEL_HOVER_CLASS,
} from '@/components/ui/LevelBadge'
import Stopwatch, { formatDuration } from '@/components/ui/Stopwatch'

interface Props {
  problem: Problem
  profile: Profile
  mySubmission: Submission | undefined
  acceptedByOtherTeams: number
  contestEnded?: boolean
  onClaim: () => void
  onWork: () => void
}

type CardState =
  | { kind: 'available'; previouslyRejected: boolean }
  | { kind: 'in_progress'; submission: Submission; isMyUser: boolean }
  | { kind: 'awaiting_grade'; submission: Submission }
  | { kind: 'accepted'; submission: Submission }

function deriveState(submission: Submission | undefined, profileId: string): CardState {
  if (!submission) return { kind: 'available', previouslyRejected: false }
  if (submission.verdict === 'accepted') return { kind: 'accepted', submission }
  if (submission.verdict === 'rejected') return { kind: 'available', previouslyRejected: true }
  if (submission.submitted_at) return { kind: 'awaiting_grade', submission }
  return { kind: 'in_progress', submission, isMyUser: submission.user_id === profileId }
}

export default function ProblemCard({ problem, profile, mySubmission, acceptedByOtherTeams, contestEnded = false, onClaim, onWork }: Props) {
  const state = deriveState(mySubmission, profile.id)

  const isAvailable = state.kind === 'available'
  // Soal Challenge yang sudah pernah dicoba: kartu tetap bisa diklik untuk
  // dibaca, tapi tidak bisa diklaim lagi (tanpa animasi "tersedia").
  const challengeLocked =
    state.kind === 'available' && state.previouslyRejected && problem.level === 'super'
  const isAccepted = state.kind === 'accepted'
  const isAwaiting = state.kind === 'awaiting_grade'

  const baseBorder = isAccepted
    ? 'border-emerald-500/50'
    : isAwaiting
    ? 'border-amber-500/40'
    : levelBorderClass(problem.level)

  const ringClass = (state.kind === 'in_progress' || isAwaiting) ? levelRingClass(problem.level) : ''

  // Catatan dari panitia setelah penilaian. Disimpan di submission, tapi pada
  // kartu yang Ditolak state-nya kembali jadi 'available' — jadi baca langsung
  // dari mySubmission, bukan dari state.
  const gradedNote =
    mySubmission?.notes && (mySubmission.verdict === 'accepted' || mySubmission.verdict === 'rejected')
      ? { notes: mySubmission.notes, verdict: mySubmission.verdict }
      : null

  const bgClass = isAccepted
    ? 'bg-emerald-950/30'
    : isAwaiting
    ? 'bg-amber-950/20'
    : 'bg-gray-900'

  return (
    <div
      className={`relative ${bgClass} border ${baseBorder} ${ringClass} rounded-xl overflow-hidden transition-all duration-250 ${
        isAvailable && !contestEnded ? `cursor-pointer hover:scale-[1.02] ${LEVEL_HOVER_CLASS[problem.level]}` : ''
      }`}
      style={isAvailable && !challengeLocked && !contestEnded ? { animation: levelAvailableAnimation(problem.level) } : undefined}
      onClick={isAvailable && !contestEnded ? onClaim : undefined}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <LevelBadge level={problem.level} />
          <span className="text-sm font-bold text-gray-300 tabular-nums whitespace-nowrap">
            {problem.points} <span className="text-gray-500 font-normal text-xs">pts</span>
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-semibold text-white text-sm leading-snug">{problem.title}</h3>
          <p className="text-xs text-gray-600 mt-0.5">oleh {problem.created_by_name}</p>
        </div>

        {/* Other-teams stat (only when relevant) */}
        {acceptedByOtherTeams > 0 && !isAccepted && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Users className="w-3 h-3" />
            <span>{acceptedByOtherTeams} tim lain sudah selesaikan</span>
          </div>
        )}

        {/* Status row */}
        <div className="pt-2 border-t border-gray-800/80">
          <StatusRow state={state} onWork={onWork} level={problem.level} contestEnded={contestEnded} />
        </div>

        {/* Catatan panitia — tampil setelah soal dinilai (diterima/ditolak) */}
        {gradedNote && (
          <div
            className={`flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] leading-snug border ${
              gradedNote.verdict === 'accepted'
                ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-200/80'
                : 'bg-orange-500/5 border-orange-500/15 text-orange-200/90'
            }`}
          >
            <MessageSquareText className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
            <span className="min-w-0">
              <span className="font-semibold">Catatan panitia: </span>
              <span className="italic break-words">{gradedNote.notes}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusRow({ state, onWork, level, contestEnded }: { state: CardState; onWork: () => void; level: Level; contestEnded?: boolean }) {
  if (state.kind === 'available') {
    const challengeLocked = level === 'super' && state.previouslyRejected
    if (contestEnded) {
      return (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border text-gray-500 bg-gray-500/10 border-gray-500/25">
            <Lock className="w-3 h-3" />
            Kompetisi Selesai
          </span>
          <span className="text-xs text-gray-700">klik untuk baca</span>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
          challengeLocked
            ? 'text-gray-400 bg-gray-500/10 border-gray-500/25'
            : state.previouslyRejected
            ? 'text-orange-300 bg-orange-500/10 border-orange-500/25'
            : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
        }`}>
          {challengeLocked ? (
            <>
              <Lock className="w-3 h-3" />
              Sudah dicoba
            </>
          ) : state.previouslyRejected ? (
            <>
              <RotateCcw className="w-3 h-3" />
              Coba lagi
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tersedia
            </>
          )}
        </span>
        <span className="text-xs text-gray-700">
          {challengeLocked ? 'klik untuk baca' : 'klik untuk ambil'}
        </span>
      </div>
    )
  }

  if (state.kind === 'in_progress') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-400 font-medium">
            {state.isMyUser ? 'Soal kamu' : 'Tim kamu sedang mengerjakan'}
          </span>
          <Stopwatch
            startTime={state.submission.started_at}
            countdownFrom={level === 'super' ? CHALLENGE_DURATION_SECONDS : undefined}
            className={level === 'super' ? 'text-xs tabular-nums' : 'text-xs text-gray-400 tabular-nums'}
          />
        </div>
        {state.isMyUser && (
          <button
            onClick={(e) => { e.stopPropagation(); onWork() }}
            className="group w-full text-xs bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
          >
            Kerjakan
            <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </button>
        )}
      </div>
    )
  }

  if (state.kind === 'awaiting_grade') {
    return (
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          Menunggu penilaian
        </span>
        {state.submission.duration_seconds != null && (
          <span className="text-xs text-gray-400 font-mono tabular-nums">
            {formatDuration(state.submission.duration_seconds)}
          </span>
        )}
      </div>
    )
  }

  // accepted
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3.5 h-3.5" />
        +{state.submission.points_awarded ?? 0} pts diterima
      </span>
      {state.submission.duration_seconds != null && (
        <span className="text-xs text-emerald-600/70 font-mono tabular-nums">
          {formatDuration(state.submission.duration_seconds)}
        </span>
      )}
    </div>
  )
}
