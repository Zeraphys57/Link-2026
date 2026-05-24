export type Role = 'peserta' | 'panitia'
export type Level = 'easy' | 'medium' | 'hard' | 'super'
export type ProblemStatus = 'available' | 'in_progress' | 'submitted' | 'accepted' | 'rejected'
export type Verdict = 'accepted' | 'rejected'

export interface Profile {
  id: string
  role: Role
  display_name: string
  team_name: string | null
  created_at: string
}

export interface Problem {
  id: string
  title: string
  description: string
  level: Level
  points: number
  created_by: string
  created_by_name: string
  is_taken: boolean
  taken_by_team: string | null
  taken_by_user_id: string | null
  taken_at: string | null
  status: ProblemStatus
  created_at: string
}

export interface Submission {
  id: string
  problem_id: string
  team_name: string
  user_id: string
  started_at: string
  submitted_at: string | null
  duration_seconds: number | null
  graded_by: string | null
  graded_at: string | null
  verdict: Verdict | null
  notes: string | null
  answer: string | null
  points_awarded: number | null
  created_at: string
}

export interface LeaderboardEntry {
  team_name: string
  total_points: number
  total_duration: number
  accepted_count: number
  accepted_problems: Array<{
    problem_id: string
    title: string
    points: number
    duration: number
  }>
}

export const LEVEL_POINTS: Record<Level, number> = {
  easy: 100,
  medium: 300,
  hard: 1000,
  super: 50,
}

export const LEVEL_LABELS: Record<Level, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  super: 'Challenge',
}

// Soal Challenge (level 'super') punya batas waktu mundur 30 menit sejak diambil.
export const CHALLENGE_DURATION_SECONDS = 30 * 60
