import type { Level } from '@/lib/types'

interface LevelBadgeProps {
  level: Level
  size?: 'sm' | 'md'
}

const CONFIG: Record<Level, { label: string; className: string }> = {
  easy: {
    label: 'Easy',
    className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  },
  medium: {
    label: 'Medium',
    className: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  },
  hard: {
    label: 'Hard',
    className: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  },
  super: {
    label: 'Super',
    className: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  },
}

export default function LevelBadge({ level, size = 'sm' }: LevelBadgeProps) {
  const { label, className } = CONFIG[level]
  return (
    <span
      className={`inline-flex items-center font-semibold border rounded-md ${className} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
    >
      {label}
    </span>
  )
}

export function levelGlowClass(level: Level): string {
  return {
    easy: 'border-emerald-500/20 hover:border-emerald-500/40',
    medium: 'border-amber-500/20 hover:border-amber-500/40',
    hard: 'border-orange-500/20 hover:border-orange-500/40',
    super: 'border-purple-500/20 hover:border-purple-500/40',
  }[level]
}

export function levelAccentClass(level: Level): string {
  return {
    easy: 'bg-emerald-500/5',
    medium: 'bg-amber-500/5',
    hard: 'bg-orange-500/5',
    super: 'bg-purple-500/5',
  }[level]
}

export function levelBorderClass(level: Level): string {
  return {
    easy: 'border-emerald-500/25',
    medium: 'border-amber-500/25',
    hard: 'border-orange-500/25',
    super: 'border-purple-500/25',
  }[level]
}

export function levelRingClass(level: Level): string {
  return {
    easy: 'ring-1 ring-emerald-500/35',
    medium: 'ring-1 ring-amber-500/35',
    hard: 'ring-1 ring-orange-500/35',
    super: 'ring-1 ring-purple-500/35',
  }[level]
}

export function levelAvailableAnimation(level: Level): string {
  return {
    easy: 'glow-easy 2.5s ease-in-out infinite',
    medium: 'glow-medium 2.5s ease-in-out infinite',
    hard: 'glow-hard 2.5s ease-in-out infinite',
    super: 'glow-super 2.5s ease-in-out infinite',
  }[level]
}

export const LEVEL_HOVER_CLASS: Record<Level, string> = {
  easy: 'hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/60',
  medium: 'hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-950/60',
  hard: 'hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-950/60',
  super: 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/60',
}

export const LEVEL_COUNT_PILL: Record<Level, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  hard: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  super: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
}
