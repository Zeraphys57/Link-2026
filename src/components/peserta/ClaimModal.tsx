'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Problem, Submission } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import LevelBadge from '@/components/ui/LevelBadge'
import toast from 'react-hot-toast'

interface Props {
  problem: Problem
  profile: Profile
  onClose: () => void
  onClaimed: (submission: Submission) => void
}

export default function ClaimModal({ problem, profile, onClose, onClaimed }: Props) {
  const [loading, setLoading] = useState(false)

  const handleClaim = async () => {
    if (!profile.team_name) {
      toast.error('Akun kamu tidak memiliki nama tim!')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { count: activeCount } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('team_name', profile.team_name)
      .is('verdict', null)

    if ((activeCount ?? 0) >= 2) {
      toast.error('Tim kamu sudah punya 2 soal aktif. Selesaikan dulu sebelum ambil soal baru.')
      setLoading(false)
      return
    }

    const { data: existing, error: existingError } = await supabase
      .from('submissions')
      .select('id, verdict, submitted_at')
      .eq('problem_id', problem.id)
      .eq('team_name', profile.team_name)

    if (existingError) {
      toast.error('Gagal memeriksa status soal. Coba lagi.')
      setLoading(false)
      return
    }

    const alreadyAccepted = existing?.some(s => s.verdict === 'accepted')
    if (alreadyAccepted) {
      toast.error('Tim kamu sudah dapat poin dari soal ini. Pilih soal lain.')
      setLoading(false)
      onClose()
      return
    }

    const inProgress = existing?.some(s => s.verdict === null && s.submitted_at === null)
    if (inProgress) {
      toast.error('Tim kamu sedang mengerjakan soal ini.')
      setLoading(false)
      onClose()
      return
    }

    const awaitingGrade = existing?.some(s => s.verdict === null && s.submitted_at !== null)
    if (awaitingGrade) {
      toast.error('Tim kamu sudah submit soal ini, tunggu penilaian panitia dulu.')
      setLoading(false)
      onClose()
      return
    }

    const now = new Date().toISOString()

    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        problem_id: problem.id,
        team_name: profile.team_name,
        user_id: profile.id,
        started_at: now,
      })
      .select()
      .single()

    if (subError || !submission) {
      toast.error('Gagal membuat submission. Hubungi panitia.')
      setLoading(false)
      return
    }

    toast.success(`Soal "${problem.title}" berhasil diambil!`)
    onClaimed(submission as Submission)
  }

  return (
    <Modal open onClose={onClose} size="lg" title={problem.title}>
      <div className="p-6 space-y-6">
        {/* Meta info */}
        <div className="flex items-center gap-3 flex-wrap">
          <LevelBadge level={problem.level} size="md" />
          <span className="text-sm font-bold text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
            {problem.points} poin
          </span>
          <span className="text-sm text-gray-500">Oleh {problem.created_by_name}</span>
        </div>

        {/* Problem description */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 max-h-[50vh] overflow-y-auto">
          <div className="prose prose-invert prose-sm max-w-none prose-code:bg-gray-800 prose-code:text-amber-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {problem.description}
            </ReactMarkdown>
          </div>
        </div>

        {/* Claim warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-amber-300">
            <strong>Perhatian:</strong> Setelah diambil, soal ini tidak bisa diambil tim lain. Timer langsung berjalan. Maksimal 2 soal aktif per tim — selesaikan atau tunggu penilaian dulu sebelum ambil soal ketiga.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">
            Batal
          </button>
          <button
            onClick={handleClaim}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Mengambil...' : 'Ambil Soal'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
