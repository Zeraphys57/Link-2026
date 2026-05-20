'use client'

import { useState, useEffect, useRef } from 'react'
import { Timer } from 'lucide-react'

interface StopwatchProps {
  startTime: string
  frozenSeconds?: number
  /** When set, the timer counts DOWN from this many seconds and stops at 0. */
  countdownFrom?: number
  /** Fired once when a countdown reaches 0. */
  onExpire?: () => void
  className?: string
  showIcon?: boolean
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  return formatTime(seconds)
}

export default function Stopwatch({
  startTime,
  frozenSeconds,
  countdownFrom,
  onExpire,
  className = '',
  showIcon = true,
}: StopwatchProps) {
  const [elapsed, setElapsed] = useState(0)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (frozenSeconds !== undefined) {
      setElapsed(frozenSeconds)
      return
    }

    const start = new Date(startTime).getTime()
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startTime, frozenSeconds])

  const isCountdown = countdownFrom !== undefined
  const remaining = isCountdown ? Math.max(0, countdownFrom - elapsed) : 0
  const expired = isCountdown && remaining === 0

  useEffect(() => {
    if (expired && !expiredRef.current) {
      expiredRef.current = true
      onExpire?.()
    }
  }, [expired, onExpire])

  const isLive = frozenSeconds === undefined
  const display = isCountdown ? remaining : elapsed

  // Countdown mode applies its own urgency color (callers pass size classes only).
  // Plain stopwatch keeps whatever color the caller supplied via className.
  const countdownColor = !isCountdown
    ? ''
    : expired
    ? 'text-red-400'
    : remaining <= 60
    ? 'text-red-300'
    : remaining <= 300
    ? 'text-amber-300'
    : 'text-blue-300'

  const iconColor = isCountdown
    ? expired
      ? 'text-red-400'
      : 'text-blue-400 animate-pulse'
    : isLive
    ? 'text-blue-400 animate-pulse'
    : 'text-gray-400'

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${countdownColor} ${className}`}>
      {showIcon && <Timer className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />}
      <span>{formatTime(display)}</span>
    </span>
  )
}
