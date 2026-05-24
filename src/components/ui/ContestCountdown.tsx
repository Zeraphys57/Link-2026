'use client'

import { useState, useEffect } from 'react'
import { Clock, TimerOff, Hourglass } from 'lucide-react'

interface Props {
  startAt: string | null
  durationSeconds: number
  compact?: boolean
}

export default function ContestCountdown({ startAt, durationSeconds, compact }: Props) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!startAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">
        <Hourglass className="w-3.5 h-3.5" />
        {compact ? 'Belum dimulai' : 'Kompetisi belum dimulai'}
      </span>
    )
  }

  const startMs = new Date(startAt).getTime()
  const endMs = startMs + durationSeconds * 1000
  const remainingMs = endMs - now

  if (remainingMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-black border border-gray-700 px-2.5 py-1 rounded-full">
        <TimerOff className="w-3.5 h-3.5" />
        Selesai
      </span>
    )
  }

  const totalSec = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const urgent = remainingMs < 5 * 60 * 1000        // < 5 menit → merah pulse
  const warning = remainingMs < 30 * 60 * 1000      // < 30 menit → kuning

  const tone = urgent
    ? 'text-red-300 bg-red-500/15 border-red-500/40 animate-pulse'
    : warning
    ? 'text-amber-300 bg-amber-500/15 border-amber-500/40'
    : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold tabular-nums px-2.5 py-1 rounded-full border ${tone}`}>
      <Clock className="w-3.5 h-3.5" />
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  )
}
