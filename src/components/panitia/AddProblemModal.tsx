'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Problem } from '@/lib/types'
import { LEVEL_POINTS } from '@/lib/types'
import { buildDescription, EMPTY_PROBLEM_FIELDS, type ProblemFields } from '@/lib/problem-form'
import ProblemFormFields from './ProblemFormFields'
import toast from 'react-hot-toast'

interface Props {
  profile: Profile
  onCreated: (problem: Problem) => void
}

export default function AddProblemModal({ profile, onCreated }: Props) {
  const [fields, setFields] = useState<ProblemFields>(EMPTY_PROBLEM_FIELDS)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fields.title.trim()) {
      toast.error('Judul soal wajib diisi!')
      return
    }
    if (!fields.deskripsi.trim()) {
      toast.error('Deskripsi masalah wajib diisi!')
      return
    }

    const description = buildDescription(fields)
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('problems')
      .insert({
        title: fields.title.trim(),
        description,
        level: fields.level,
        points: LEVEL_POINTS[fields.level],
        created_by: profile.id,
        created_by_name: profile.display_name,
      })
      .select()
      .single()

    if (error || !data) {
      toast.error(error?.message ?? 'Gagal menambahkan soal.')
      setLoading(false)
      return
    }

    setFields(EMPTY_PROBLEM_FIELDS)
    onCreated(data as Problem)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Tambah Soal Baru</h2>
        <p className="text-sm text-gray-400 mt-1">Isi form di bawah — soal langsung tersedia di papan setelah disimpan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ProblemFormFields fields={fields} onChange={setFields} disabled={loading} />

        {/* Submit */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Ditambahkan sebagai: <span className="text-white font-medium">{profile.display_name}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ml-auto flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-900 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {loading ? 'Menambahkan...' : 'Tambah Soal'}
          </button>
        </div>
      </form>
    </div>
  )
}
