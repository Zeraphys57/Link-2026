'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { LogOut, LayoutGrid, Trophy, Gem } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Problem, Submission } from '@/lib/types'
import ProblemBoard from './ProblemBoard'
import Leaderboard from './Leaderboard'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Props {
  profile: Profile
  initialProblems: Problem[]
  initialSubmissions: Submission[]
}

type Tab = 'problems' | 'leaderboard'

export default function PesertaDashboard({ profile, initialProblems, initialSubmissions }: Props) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems)
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [activeTab, setActiveTab] = useState<Tab>('problems')
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleProblemChange = useCallback((payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
    if (payload.eventType === 'UPDATE') {
      const updated = payload.new as unknown as Problem
      setProblems(prev => prev.map(p => p.id === updated.id ? updated : p))
    } else if (payload.eventType === 'INSERT') {
      const incoming = payload.new as unknown as Problem
      setProblems(prev => prev.some(p => p.id === incoming.id) ? prev : [...prev, incoming])
    }
  }, [])

  const handleSubmissionChange = useCallback((payload: { eventType: string; new: Record<string, unknown> }) => {
    if (payload.eventType === 'INSERT') {
      const incoming = payload.new as unknown as Submission
      setSubmissions(prev => prev.some(s => s.id === incoming.id) ? prev : [incoming, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      const updated = payload.new as unknown as Submission
      setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s))
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('peserta-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'problems' }, handleProblemChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, handleSubmissionChange)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [handleProblemChange, handleSubmissionChange, supabase])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative z-[1] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
              <Gem className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">LINK 2026</span>
              <span className="hidden sm:inline text-gray-500 text-xs ml-2">Competitive Programming</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              {profile.team_name && (
                <span className="text-xs font-bold bg-amber-500/10 border border-amber-500/25 text-amber-300 px-3 py-1 rounded-full tracking-wide">
                  {profile.team_name}
                </span>
              )}
              <p className="text-sm font-medium text-gray-300">{profile.display_name}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 pt-3">
            <TabButton
              active={activeTab === 'problems'}
              onClick={() => setActiveTab('problems')}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Papan Soal"
            />
            <TabButton
              active={activeTab === 'leaderboard'}
              onClick={() => setActiveTab('leaderboard')}
              icon={<Trophy className="w-4 h-4" />}
              label="Papan Skor"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div
          key={activeTab}
          style={{ animation: 'fadeIn 0.18s ease-out both' }}
        >
          {activeTab === 'problems' ? (
            <ProblemBoard
              problems={problems}
              submissions={submissions}
              profile={profile}
              onProblemsChange={setProblems}
              onSubmissionsChange={setSubmissions}
            />
          ) : (
            <Leaderboard problems={problems} submissions={submissions} />
          )}
        </div>
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? 'text-amber-400 border-amber-500 bg-amber-500/5'
          : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800/50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
