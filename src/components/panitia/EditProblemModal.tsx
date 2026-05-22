'use client'

import { useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Problem } from '@/lib/types'
import { LEVEL_POINTS } from '@/lib/types'
import { buildDescription, parseDescription, type ProblemFields } from '@/lib/problem-form'
import Modal from '@/components/ui/Modal'
import ProblemFormFields from './ProblemFormFields'
import toast from 'react-hot-toast'

interface Props {
  problem: Problem
  hasSubmissions: boolean
  onClose: () => void
  onUpdated: (problem: Problem) => void
}

export default function EditProblemModal({ problem, hasSubmissions, onClose, onUpdated }: Props) {
  // Pecah deskripsi Markdown yang tersimpan kembali ke field form terstruktur.
  const [fields, setFields] = useState<ProblemFields>(() => ({
    title: problem.title,
    level: problem.level,
    ...parseDescription(problem.description),
  }))
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fields.title.trim()) {
      toast.error('Judul soal wajib diisi!')
      return
    }
    if (!fields.deskripsi.trim()) {
      toast.error('Deskripsi masalah wajib diisi!')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('problems')
      .update({
        title: fields.title.trim(),
        level: fields.level,
        points: LEVEL_POINTS[fields.level],
        description: buildDescription(fields),
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
      <form onSubmit={handleSave} className="p-6 space-y-5">
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

        <ProblemFormFields fields={fields} onChange={setFields} disabled={loading} />

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
