'use client'

import { useState } from 'react'
import { Save, AlignLeft, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Problem, Level } from '@/lib/types'
import { LEVEL_POINTS } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import LevelBadge from '@/components/ui/LevelBadge'
import toast from 'react-hot-toast'

const LEVEL_SELECTED: Record<Level, string> = {
  easy:   'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10 shadow-md',
  medium: 'bg-orange-500/15 border-orange-500/50 text-orange-300 shadow-orange-500/10 shadow-md',
  hard:   'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-purple-500/10 shadow-md',
  super:  'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-blue-500/10 shadow-md',
}

const LEVELS: Level[] = ['easy', 'medium', 'hard', 'super']

interface Props {
  problem: Problem
  hasSubmissions: boolean
  onClose: () => void
  onUpdated: (problem: Problem) => void
}

export default function EditProblemModal({ problem, hasSubmissions, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(problem.title)
  const [level, setLevel] = useState<Level>(problem.level)
  const [description, setDescription] = useState(problem.description)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Judul soal wajib diisi!')
      return
    }
    if (!description.trim()) {
      toast.error('Deskripsi soal wajib diisi!')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('problems')
      .update({
        title: title.trim(),
        level,
        points: LEVEL_POINTS[level],
        description: description.trim(),
      })
      .eq('id', problem.id)
      .select()
      .single()

    if (error || !data) {
      toast.error(error?.message ?? 'Gagal menyimpan perubahan.')
      setLoading(false)
      return
    }

    toast.success(`Soal "${data.title}" berhasil diperbarui!`)
    onUpdated(data as Problem)
  }

  return (
    <Modal open onClose={onClose} size="xl" title="Edit Soal">
      <div className="p-6 space-y-5">
        {hasSubmissions && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              Soal ini sudah diambil/dikerjakan tim. Perubahan langsung terlihat oleh peserta.
              Mengubah level juga mengubah poin untuk penilaian berikutnya — poin yang sudah
              diterima tim sebelumnya tidak berubah.
            </p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Judul Soal</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
            disabled={loading}
          />
        </div>

        {/* Level & Poin */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Level &amp; Poin</label>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                  level === l
                    ? LEVEL_SELECTED[l]
                    : 'bg-gray-800/60 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                }`}
              >
                <LevelBadge level={l} />
                <span className={level === l ? 'opacity-70 text-xs' : 'text-gray-600 text-xs'}>{LEVEL_POINTS[l]}</span>
              </button>
            ))}
          </div>
          {level !== problem.level && (
            <p className="text-xs text-amber-400/80 mt-2">
              Level diubah — poin soal kini <strong>{LEVEL_POINTS[level]}</strong> (sebelumnya {problem.points}).
            </p>
          )}
        </div>

        {/* Description (raw markdown) */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <AlignLeft className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-300">Deskripsi Soal</label>
            <span className="text-xs text-gray-600">format Markdown</span>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm font-mono resize-y"
            rows={16}
            disabled={loading}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
