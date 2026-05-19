'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CheckCircle2, AlertTriangle, Terminal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Problem, Submission } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import LevelBadge from '@/components/ui/LevelBadge'
import Stopwatch from '@/components/ui/Stopwatch'
import toast from 'react-hot-toast'

interface Props {
  problem: Problem
  submission: Submission
  onClose: () => void
  onSubmitted: (updatedSubmission: Submission) => void
}

export default function WorkingModal({ problem, submission, onClose, onSubmitted }: Props) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error('Tulis jawabanmu dulu sebelum mengumpulkan.')
      return
    }

    if (!confirming) {
      setConfirming(true)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const submittedAt = new Date()
    const startedAt = new Date(submission.started_at)
    const durationSeconds = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000)

    const { error: subError } = await supabase
      .from('submissions')
      .update({
        submitted_at: submittedAt.toISOString(),
        duration_seconds: durationSeconds,
        answer: answer.trim(),
      })
      .eq('id', submission.id)

    if (subError) {
      toast.error('Gagal mengumpulkan. Coba lagi.')
      setLoading(false)
      setConfirming(false)
      return
    }

    const updatedSubmission: Submission = {
      ...submission,
      submitted_at: submittedAt.toISOString(),
      duration_seconds: durationSeconds,
      answer: answer.trim(),
    }

    toast.success('Jawaban berhasil dikumpulkan! Menunggu penilaian panitia.')
    setSubmitted(true)
    setTimeout(() => {
      onSubmitted(updatedSubmission)
    }, 2000)
  }

  if (submitted) {
    return (
      <Modal open onClose={onClose} size="md">
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Jawaban Dikumpulkan!</h3>
          <p className="text-gray-400">Menunggu penilaian dari panitia. Pantau status di papan soal.</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose} size="xl" title={problem.title}>
      <div className="p-6 space-y-5">
        {/* Meta + timer */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <LevelBadge level={problem.level} size="md" />
            <span className="text-sm font-bold text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
              {problem.points} poin
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
            <span className="text-xs text-blue-400 font-medium">Waktu Berjalan</span>
            <Stopwatch
              startTime={submission.started_at}
              className="text-blue-300 text-lg font-bold tabular-nums"
              showIcon={false}
            />
          </div>
        </div>

        {/* Problem description */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 max-h-[32vh] overflow-y-auto">
          <div className="prose prose-invert prose-sm max-w-none prose-code:bg-gray-800 prose-code:text-amber-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {problem.description}
            </ReactMarkdown>
          </div>
        </div>

        {/* Answer input */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">
              Jawaban / Output
            </label>
            <span className="text-xs text-gray-600">wajib diisi sebelum mengumpulkan</span>
          </div>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Tulis output atau solusi kamu di sini..."
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm resize-y transition-colors"
            rows={6}
            disabled={loading}
          />
        </div>

        {/* Confirm notice */}
        {confirming && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">Konfirmasi Pengumpulan</p>
              <p className="text-sm text-amber-400/80 mt-1">
                Pastikan jawabanmu sudah benar. Setelah dikumpulkan, jawaban tidak bisa diubah.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
          <button
            onClick={() => { setConfirming(false); onClose() }}
            className="btn-ghost"
            disabled={loading}
          >
            Tutup
          </button>
          {confirming && (
            <button
              onClick={() => setConfirming(false)}
              className="btn-ghost"
              disabled={loading}
            >
              Batal
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-success flex items-center gap-2 px-6 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Mengumpulkan...' : confirming ? 'Ya, Kumpulkan!' : 'Selesai'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
