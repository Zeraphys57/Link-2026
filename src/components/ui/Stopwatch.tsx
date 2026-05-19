'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'

interface StopwatchProps {
  startTime: string
  frozenSeconds?: number
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

export default function Stopwatch({ startTime, frozenSeconds, className = '', showIcon = true }: StopwatchProps) {
  const [elapsed, setElapsed] = useState(0)

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

  const isLive = frozenSeconds === undefined

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${className}`}>
      {showIcon && (
        <Timer className={`w-3.5 h-3.5 flex-shrink-0 ${isLive ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`} />
      )}
      <span>{formatTime(elapsed)}</span>
    </span>
  )
}
