'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CheckCircle2, AlertTriangle, Terminal, Save } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { createClient } from '@/lib/supabase/client'
import type { Problem, Submission } from '@/lib/types'
import { CHALLENGE_DURATION_SECONDS } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import LevelBadge from '@/components/ui/LevelBadge'
import Stopwatch from '@/components/ui/Stopwatch'
import toast from 'react-hot-toast'

interface Props {
  problem: Problem
  submission: Submission
  contestEnded?: boolean
  onClose: () => void
  onSubmitted: (updatedSubmission: Submission) => void
}

const DRAFT_KEY = (submissionId: string) => `link2026_draft_${submissionId}`

export default function WorkingModal({ problem, submission, contestEnded = false, onClose, onSubmitted }: Props) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const isChallenge = problem.level === 'super'

  // Load draft saat modal pertama kali mount untuk submission ini.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY(submission.id))
      if (saved && saved.length > 0) {
        setAnswer(saved)
        setDraftRestored(true)
      }
    } catch {
      // localStorage bisa di-disable (private mode dll) — abaikan
    }
  }, [submission.id])

  // Persist setiap perubahan answer ke localStorage (sync, sub-ms, no debounce needed).
  useEffect(() => {
    if (typeof window === 'undefined' || submitted) return
    try {
      if (answer.length === 0) {
        window.localStorage.removeItem(DRAFT_KEY(submission.id))
        setSavedAt(null)
      } else {
        window.localStorage.setItem(DRAFT_KEY(submission.id), answer)
        setSavedAt(new Date())
      }
    } catch {
      // ignore quota / disabled storage
    }
  }, [answer, submission.id, submitted])

  // `auto` = dipanggil otomatis saat waktu Challenge habis: lewati validasi
  // jawaban kosong & konfirmasi, jawaban dikumpulkan apa adanya.
  const handleSubmit = async (auto = false) => {
    if (!auto && isChallenge && timeUp) {
      toast.error('Waktu sudah habis. Soal Challenge tidak bisa dikumpulkan lagi.')
      return
    }

    if (!auto && !answer.trim()) {
      toast.error('Tulis jawabanmu dulu sebelum mengumpulkan.')
      return
    }

    if (!auto && !confirming) {
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
      if (auto) setTimeUp(true)
      return
    }

    const updatedSubmission: Submission = {
      ...submission,
      submitted_at: submittedAt.toISOString(),
      duration_seconds: durationSeconds,
      answer: answer.trim(),
    }

    toast.success(
      auto
        ? 'Waktu habis — jawaban otomatis dikumpulkan. Menunggu penilaian panitia.'
        : 'Jawaban berhasil dikumpulkan! Menunggu penilaian panitia.'
    )
    try {
      window.localStorage.removeItem(DRAFT_KEY(submission.id))
    } catch {}
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
          {isChallenge ? (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              timeUp ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/20'
            }`}>
              <span className={`text-xs font-medium ${timeUp ? 'text-red-400' : 'text-blue-400'}`}>
                {timeUp ? 'Waktu Habis' : 'Sisa Waktu'}
              </span>
              <Stopwatch
                startTime={submission.started_at}
                countdownFrom={CHALLENGE_DURATION_SECONDS}
                onExpire={() => {
                  setTimeUp(true)
                  if (!submitted && !loading) handleSubmit(true)
                }}
                className="text-lg font-bold tabular-nums"
                showIcon={false}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
              <span className="text-xs text-blue-400 font-medium">Waktu Berjalan</span>
              <Stopwatch
                startTime={submission.started_at}
                className="text-blue-300 text-lg font-bold tabular-nums"
                showIcon={false}
              />
            </div>
          )}
        </div>

        {/* Problem description */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 max-h-[32vh] overflow-y-auto">
          <div className="prose prose-invert prose-sm max-w-none prose-code:bg-gray-800 prose-code:text-amber-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {problem.description}
            </ReactMarkdown>
          </div>
        </div>

        {/* Answer input — CodeMirror editor (C) */}
        <div>
          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">
                Jawaban / Kode
              </label>
              <span className="text-xs text-gray-600">wajib diisi sebelum mengumpulkan</span>
            </div>
            <div className="flex items-center gap-2">
              {savedAt && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400/80" title={`Tersimpan otomatis di browser pukul ${savedAt.toLocaleTimeString()}`}>
                  <Save className="w-3 h-3" />
                  Tersimpan
                </span>
              )}
              <span className="text-[10px] font-bold tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded">
                C
              </span>
            </div>
          </div>
          {draftRestored && (
            <div className="mb-2 flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
              <Save className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Draft sebelumnya dipulihkan dari browser. Lanjutkan dari posisi terakhir.</span>
            </div>
          )}
          <div className={`rounded-xl overflow-hidden border border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors ${
            loading || (isChallenge && timeUp) ? 'opacity-60 pointer-events-none' : ''
          }`}>
            <CodeMirror
              value={answer}
              onChange={(value) => setAnswer(value)}
              height="220px"
              theme={oneDark}
              extensions={[cpp(), EditorView.lineWrapping]}
              placeholder="// Tulis kode C atau output kamu di sini..."
              editable={!loading && !(isChallenge && timeUp)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                indentOnInput: true,
                tabSize: 4,
              }}
            />
          </div>
        </div>

        {/* Contest ended notice */}
        {contestEnded && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Kompetisi Sudah Berakhir</p>
              <p className="text-sm text-red-400/80 mt-1">
                Waktu kompetisi telah habis. Jawaban tidak bisa dikumpulkan lagi.
              </p>
            </div>
          </div>
        )}

        {/* Time-up notice (Challenge only) */}
        {isChallenge && timeUp && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Waktu Habis</p>
              <p className="text-sm text-red-400/80 mt-1">
                Batas waktu 30 menit untuk soal Challenge ini sudah berakhir. Jawaban tidak bisa dikumpulkan lagi.
              </p>
            </div>
          </div>
        )}

        {/* Confirm notice */}
        {confirming && !(isChallenge && timeUp) && (
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
            onClick={() => handleSubmit()}
            disabled={loading || (isChallenge && timeUp) || contestEnded}
            className="btn-success flex items-center gap-2 px-6 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            {contestEnded
              ? 'Kompetisi Selesai'
              : isChallenge && timeUp
              ? 'Waktu Habis'
              : loading
              ? 'Mengumpulkan...'
              : confirming
              ? 'Ya, Kumpulkan!'
              : 'Selesai'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
