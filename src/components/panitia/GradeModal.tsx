'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, User, FileText, Terminal, Maximize2, Minimize2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Problem, Submission } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import LevelBadge from '@/components/ui/LevelBadge'
import { formatDuration } from '@/components/ui/Stopwatch'
import toast from 'react-hot-toast'

interface Props {
  problem: Problem
  submission: Submission
  onClose: () => void
  onGraded: (updatedSubmission: Submission) => void
}

export default function GradeModal({ problem, submission, onClose, onGraded }: Props) {
  const [notes, setNotes] = useState(submission.notes ?? '')
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)

  // Submission yang sudah punya verdict = sedang dicek ulang (recheck).
  const isRegrade = submission.verdict !== null

  const [answerFull, setAnswerFull] = useState(false)

  // Esc menutup tampilan fullscreen jawaban lebih dulu, bukan seluruh modal.
  // Listener fase-capture agar jalan sebelum handler Esc milik Modal.
  useEffect(() => {
    if (!answerFull) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        setAnswerFull(false)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [answerFull])

  const grade = async (verdict: 'accepted' | 'rejected') => {
    setLoading(verdict === 'accepted' ? 'accept' : 'reject')
    const supabase = createClient()
    const now = new Date().toISOString()
    const { data: { user } } = await supabase.auth.getUser()

    const pointsAwarded = verdict === 'accepted' ? problem.points : 0

    const { data: updatedSub, error: subError } = await supabase
      .from('submissions')
      .update({
        verdict,
        notes: notes.trim() || null,
        graded_at: now,
        graded_by: user?.id,
        points_awarded: verdict === 'accepted' ? pointsAwarded : null,
      })
      .eq('id', submission.id)
      .select()
      .single()

    if (subError || !updatedSub) {
      toast.error('Gagal menyimpan penilaian.')
      setLoading(null)
      return
    }

    if (verdict === 'accepted') {
      toast.success(`Soal "${problem.title}" diterima! +${pointsAwarded} poin untuk Tim ${submission.team_name}`)
    } else {
      toast(`Soal "${problem.title}" ditolak. Tim ${submission.team_name} bisa coba lagi.`, { icon: '↩' })
    }

    onGraded(updatedSub as Submission)
  }

  const duration = submission.duration_seconds

  return (
    <>
    <Modal open onClose={onClose} title={isRegrade ? 'Cek Ulang Jawaban' : 'Koreksi Jawaban'} size="lg">
      <div className="p-6 space-y-5">
        {/* Problem info */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={problem.level} size="md" />
            <span className="text-sm font-bold text-white">{problem.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <User className="w-4 h-4 text-gray-500" />
              <span>Tim <span className="text-white font-medium">{submission.team_name}</span></span>
            </div>
            {duration !== null && duration !== undefined && (
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-white font-bold text-base">{formatDuration(duration)}</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-400">
            Nilai soal: <span className="text-white font-bold">{problem.points} poin</span>
          </div>
        </div>

        {/* Banner recheck: verdict sebelumnya */}
        {isRegrade && (
          <div className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
            submission.verdict === 'accepted'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-red-500/10 border-red-500/25 text-red-300'
          }`}>
            {submission.verdict === 'accepted'
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>
              Jawaban ini sebelumnya{' '}
              <span className="font-bold">
                {submission.verdict === 'accepted' ? 'Diterima' : 'Ditolak'}
              </span>
              . Penilaian baru akan menggantikan keputusan sebelumnya.
            </span>
          </div>
        )}

        {/* Submitted answer */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Jawaban Tim</span>
            </div>
            {submission.answer && (
              <button
                onClick={() => setAnswerFull(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-amber-300 bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Perbesar
              </button>
            )}
          </div>
          {submission.answer ? (
            <div className="bg-gray-950 border border-gray-700 rounded-xl p-4 max-h-48 overflow-y-auto">
              <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
                {submission.answer}
              </pre>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-600 italic">
              Tidak ada jawaban yang dikirim.
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Catatan (opsional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Berikan catatan untuk tim (misal: alasan penolakan atau pesan)..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none text-sm transition-colors"
            rows={3}
          />
        </div>

        {/* Verdict buttons */}
        <div className="flex gap-3 pt-2 border-t border-gray-800">
          <button
            onClick={onClose}
            className="btn-ghost"
            disabled={!!loading}
          >
            Batal
          </button>
          <button
            onClick={() => grade('rejected')}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-500 active:scale-[0.98] disabled:bg-red-900 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all border border-red-500/30"
          >
            <XCircle className="w-4 h-4" />
            {loading === 'reject' ? 'Menolak...' : 'Tolak'}
          </button>
          <button
            onClick={() => grade('accepted')}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:bg-emerald-900 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-all border border-emerald-500/30 shadow-emerald-900/30 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading === 'accept' ? 'Menerima...' : `Terima +${problem.points} pts`}
          </button>
        </div>
      </div>
    </Modal>

    {/* Tampilan fullscreen jawaban tim */}
    {answerFull && submission.answer && (
      <div className="fixed inset-0 z-[60] flex flex-col bg-gray-950">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-300 truncate">
              Jawaban Tim {submission.team_name}
            </span>
          </div>
          <button
            onClick={() => setAnswerFull(false)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 active:scale-[0.98] px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
          >
            <Minimize2 className="w-4 h-4" />
            Tutup
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {submission.answer}
          </pre>
        </div>
      </div>
    )}
    </>
  )
}
