'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { LogOut, ClipboardList, LayoutList, PlusCircle, Eye, EyeOff, Trophy } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Problem, Submission } from '@/lib/types'
import MyProblems from './MyProblems'
import AllProblems from './AllProblems'
import AddProblemModal from './AddProblemModal'
import Leaderboard from '@/components/peserta/Leaderboard'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useIdleLogout } from '@/lib/useIdleLogout'

interface Props {
  profile: Profile
  initialProblems: Problem[]
  initialSubmissions: Submission[]
  isAdmin: boolean
  initialChallengeOnly: boolean
}

type Tab = 'my-problems' | 'all-problems' | 'leaderboard' | 'add-problem'

export default function PanitiaDashboard({ profile, initialProblems, initialSubmissions, isAdmin, initialChallengeOnly }: Props) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems)
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [activeTab, setActiveTab] = useState<Tab>('my-problems')
  const [loggingOut, setLoggingOut] = useState(false)
  const [challengeOnly, setChallengeOnly] = useState(initialChallengeOnly)
  const [togglingChallenge, setTogglingChallenge] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useIdleLogout()

  const handleProblemChange = useCallback((payload: { eventType: string; new: Record<string, unknown> }) => {
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

  const handleSettingsChange = useCallback((payload: { new: Record<string, unknown> }) => {
    const row = payload.new as { key?: string; bool_value?: boolean }
    if (row.key === 'challenge_only' && typeof row.bool_value === 'boolean') {
      setChallengeOnly(row.bool_value)
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('panitia-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'problems' }, handleProblemChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, handleSubmissionChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, handleSettingsChange)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [handleProblemChange, handleSubmissionChange, handleSettingsChange, supabase])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleChallengeOnly = async () => {
    setTogglingChallenge(true)
    const next = !challengeOnly
    const { error } = await supabase
      .from('app_settings')
      .update({ bool_value: next, updated_at: new Date().toISOString() })
      .eq('key', 'challenge_only')
    if (error) {
      toast.error('Gagal mengubah pengaturan.')
    } else {
      setChallengeOnly(next)
      toast.success(next
        ? 'Soal Final disembunyikan — peserta hanya melihat soal Challenge.'
        : 'Soal Final kini terlihat oleh peserta.')
    }
    setTogglingChallenge(false)
  }

  // Admin melihat & menilai/mengedit soal SEMUA panitia; panitia biasa hanya soal sendiri.
  const myProblems = isAdmin ? problems : problems.filter(p => p.created_by === profile.id)
  const mySubmissions = isAdmin
    ? submissions
    : submissions.filter(s => {
        const p = problems.find(pr => pr.id === s.problem_id)
        return p?.created_by === profile.id
      })

  const pendingCount = submissions.filter(s => {
    if (s.verdict || !s.submitted_at) return false
    if (isAdmin) return true
    const problem = problems.find(p => p.id === s.problem_id)
    return problem?.created_by === profile.id
  }).length

  return (
    <div className="relative z-[1] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-bold text-white text-sm">LINK 2026</span>
              <span className="hidden sm:inline text-amber-500/60 text-xs ml-2">Panitia Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {isAdmin && (
              <button
                onClick={toggleChallengeOnly}
                disabled={togglingChallenge}
                title={challengeOnly
                  ? 'Soal Final disembunyikan dari peserta — klik untuk menampilkan'
                  : 'Soal Final terlihat peserta — klik untuk menyembunyikan'}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                  challengeOnly
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {challengeOnly ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {challengeOnly ? 'Soal Final disembunyikan' : 'Soal Final terlihat'}
                </span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="text-xs font-bold bg-amber-500/10 border border-amber-500/25 text-amber-300 px-3 py-1 rounded-full tracking-wide">
                {isAdmin ? 'Admin' : 'Panitia'}
              </span>
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
              active={activeTab === 'my-problems'}
              onClick={() => setActiveTab('my-problems')}
              icon={<ClipboardList className="w-4 h-4" />}
              label={isAdmin ? 'Koreksi Soal' : 'Soal Saya'}
              badge={pendingCount > 0 ? pendingCount : undefined}
            />
            <TabButton
              active={activeTab === 'all-problems'}
              onClick={() => setActiveTab('all-problems')}
              icon={<LayoutList className="w-4 h-4" />}
              label="Semua Soal"
            />
            <TabButton
              active={activeTab === 'leaderboard'}
              onClick={() => setActiveTab('leaderboard')}
              icon={<Trophy className="w-4 h-4" />}
              label="Papan Skor"
            />
            <TabButton
              active={activeTab === 'add-problem'}
              onClick={() => setActiveTab('add-problem')}
              icon={<PlusCircle className="w-4 h-4" />}
              label="Tambah Soal"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div key={activeTab} style={{ animation: 'fadeIn 0.18s ease-out both' }}>
          {activeTab === 'my-problems' && (
            <MyProblems
              isAdmin={isAdmin}
              problems={myProblems}
              submissions={mySubmissions}
              onSubmissionsChange={(updated) => setSubmissions(prev => prev.map(s => {
                const u = updated.find(up => up.id === s.id)
                return u ?? s
              }))}
              onProblemUpdated={(updated) => setProblems(prev => prev.map(p => p.id === updated.id ? updated : p))}
            />
          )}
          {activeTab === 'all-problems' && (
            <AllProblems problems={problems} submissions={submissions} />
          )}
          {activeTab === 'leaderboard' && (
            <Leaderboard problems={problems} submissions={submissions} />
          )}
          {activeTab === 'add-problem' && (
            <AddProblemModal
              profile={profile}
              onCreated={(newProblem) => {
                setProblems(prev => [...prev, newProblem])
                toast.success(`Soal "${newProblem.title}" berhasil ditambahkan!`)
                setActiveTab('my-problems')
              }}
            />
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
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? 'text-amber-400 border-amber-500 bg-amber-500/5'
          : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800/50'
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {badge}
        </span>
      )}
    </button>
  )
}
