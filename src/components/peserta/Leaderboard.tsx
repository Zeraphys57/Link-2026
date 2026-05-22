'use client'

import { Trophy, Medal, Clock, Star } from 'lucide-react'
import type { Problem, Submission, LeaderboardEntry } from '@/lib/types'
import { formatDuration } from '@/components/ui/Stopwatch'

interface Props {
  problems: Problem[]
  submissions: Submission[]
}

function computeLeaderboard(submissions: Submission[], problems: Problem[]): LeaderboardEntry[] {
  const problemMap = new Map(problems.map(p => [p.id, p]))

  // Dedup: satu tim hanya dihitung SEKALI per soal, walau ada beberapa
  // submission accepted untuk soal yang sama (akibat klaim ulang atau "Cek
  // Ulang" panitia). Diambil submission accepted dengan durasi tercepat.
  const bestByTeamProblem = new Map<string, Submission>()
  for (const sub of submissions) {
    if (sub.verdict !== 'accepted' || !sub.points_awarded) continue
    const key = `${sub.team_name} ${sub.problem_id}`
    const existing = bestByTeamProblem.get(key)
    if (!existing || (sub.duration_seconds ?? Infinity) < (existing.duration_seconds ?? Infinity)) {
      bestByTeamProblem.set(key, sub)
    }
  }

  const teamMap = new Map<string, LeaderboardEntry>()

  for (const sub of bestByTeamProblem.values()) {
    if (!teamMap.has(sub.team_name)) {
      teamMap.set(sub.team_name, {
        team_name: sub.team_name,
        total_points: 0,
        total_duration: 0,
        accepted_count: 0,
        accepted_problems: [],
      })
    }

    const entry = teamMap.get(sub.team_name)!
    entry.total_points += sub.points_awarded!
    entry.total_duration += sub.duration_seconds ?? 0
    entry.accepted_count++
    entry.accepted_problems.push({
      problem_id: sub.problem_id,
      title: problemMap.get(sub.problem_id)?.title ?? 'Unknown',
      points: sub.points_awarded!,
      duration: sub.duration_seconds ?? 0,
    })
  }

  return Array.from(teamMap.values()).sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    return a.total_duration - b.total_duration
  })
}

export default function Leaderboard({ problems, submissions }: Props) {
  const entries = computeLeaderboard(submissions, problems)

  if (entries.length === 0) {
    return (
      <div className="text-center py-24">
        <Trophy className="w-10 h-10 mx-auto mb-4 text-gray-700" />
        <p className="text-base font-semibold text-gray-500">Papan skor kosong</p>
        <p className="text-sm text-gray-700 mt-1">Akan muncul begitu ada soal yang diterima.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 mb-6">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h2 className="text-sm font-bold text-gray-200 tracking-wide">Papan Skor</h2>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {entries.map((entry, i) => {
        if (i === 0) return <RankFirst key={entry.team_name} entry={entry} />
        if (i === 1 || i === 2) return <RankPodium key={entry.team_name} entry={entry} rank={i} />
        return <RankRest key={entry.team_name} entry={entry} rank={i} />
      })}
    </div>
  )
}

function RankFirst({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className="relative border border-yellow-500/40 bg-yellow-950/20 rounded-2xl p-5 overflow-hidden"
      style={{ animation: 'rank1-pulse 3s ease-in-out infinite' }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div style={{ animation: 'trophy-float 3s ease-in-out infinite' }}>
            <Trophy className="w-7 h-7 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-xl text-yellow-200 tracking-tight">{entry.team_name}</span>
              <span className="text-[10px] font-bold bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full tracking-wider uppercase">1st</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-yellow-600/80 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-600" />
                {entry.accepted_count} soal selesai
              </span>
              <span className="text-xs text-yellow-700/70 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(entry.total_duration)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-black text-yellow-300 tabular-nums leading-none">{entry.total_points}</div>
          <div className="text-xs text-yellow-600/60 mt-0.5">poin</div>
        </div>
      </div>
      {entry.accepted_problems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-yellow-500/15">
          <div className="flex flex-wrap gap-1.5">
            {entry.accepted_problems.map(prob => (
              <span
                key={prob.problem_id}
                className="inline-flex items-center gap-1 text-xs bg-yellow-500/8 border border-yellow-500/15 text-yellow-500/80 px-2 py-0.5 rounded-md"
              >
                {prob.title}
                <span className="text-yellow-600/60">+{prob.points}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RankPodium({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const is2nd = rank === 1
  const iconColor = is2nd ? 'text-gray-300' : 'text-amber-600'
  const textColor = is2nd ? 'text-gray-200' : 'text-gray-300'
  const scoreColor = is2nd ? 'text-gray-200' : 'text-gray-300'
  const borderColor = is2nd ? 'border-gray-600/40' : 'border-amber-700/30'
  const label = is2nd ? '2nd' : '3rd'

  return (
    <div className={`border ${borderColor} bg-gray-900 rounded-xl p-4`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0`}>
            <Medal className={`w-4 h-4 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-base ${textColor}`}>{entry.team_name}</span>
              <span className={`text-[10px] font-semibold text-gray-500 tracking-wider uppercase`}>{label}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-600">{entry.accepted_count} soal</span>
              <span className="text-xs text-gray-700 tabular-nums">{formatDuration(entry.total_duration)}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-xl font-black tabular-nums ${scoreColor}`}>{entry.total_points}</div>
          <div className="text-xs text-gray-700">poin</div>
        </div>
      </div>
      {entry.accepted_problems.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-800">
          <div className="flex flex-wrap gap-1.5">
            {entry.accepted_problems.map(prob => (
              <span
                key={prob.problem_id}
                className="text-xs bg-emerald-500/8 border border-emerald-500/15 text-emerald-600/70 px-2 py-0.5 rounded-md"
              >
                {prob.title} <span className="text-emerald-700/50">+{prob.points}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RankRest({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-gray-800/60 bg-gray-900/50 rounded-xl">
      <span className="w-6 text-center text-sm font-bold text-gray-600 tabular-nums flex-shrink-0">{rank + 1}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-gray-300 truncate block">{entry.team_name}</span>
        <span className="text-xs text-gray-600">{entry.accepted_count} soal · {formatDuration(entry.total_duration)}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-base font-bold text-gray-400 tabular-nums">{entry.total_points}</span>
        <span className="text-xs text-gray-700 ml-1">pts</span>
      </div>
    </div>
  )
}
