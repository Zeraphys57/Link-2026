'use client'

import { useState } from 'react'
import { PlusCircle, AlignLeft, ArrowDownToLine, ArrowUpFromLine, Terminal, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Problem, Level } from '@/lib/types'
import { LEVEL_POINTS } from '@/lib/types'
import LevelBadge from '@/components/ui/LevelBadge'
import toast from 'react-hot-toast'

const LEVEL_SELECTED: Record<Level, string> = {
  easy:   'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10 shadow-md',
  medium: 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-amber-500/10 shadow-md',
  hard:   'bg-orange-500/15 border-orange-500/50 text-orange-300 shadow-orange-500/10 shadow-md',
  super:  'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-purple-500/10 shadow-md',
}

interface Props {
  profile: Profile
  onCreated: (problem: Problem) => void
}

interface Fields {
  title: string
  level: Level
  deskripsi: string
  formatInput: string
  formatOutput: string
  contohInput: string
  contohOutput: string
  penjelasan: string
  batasan: string
}

const LEVELS: Level[] = ['easy', 'medium', 'hard', 'super']

function buildDescription(f: Fields): string {
  const parts: string[] = []

  if (f.deskripsi.trim()) {
    parts.push(`## Deskripsi\n${f.deskripsi.trim()}`)
  }

  if (f.formatInput.trim()) {
    parts.push(`## Input\n${f.formatInput.trim()}`)
  }

  if (f.formatOutput.trim()) {
    parts.push(`## Output\n${f.formatOutput.trim()}`)
  }

  const hasExample = f.contohInput.trim() || f.contohOutput.trim()
  if (hasExample) {
    let ex = '## Contoh\n'
    if (f.contohInput.trim()) {
      ex += `**Input:**\n\`\`\`\n${f.contohInput.trim()}\n\`\`\``
    }
    if (f.contohOutput.trim()) {
      if (f.contohInput.trim()) ex += '\n\n'
      ex += `**Output:**\n\`\`\`\n${f.contohOutput.trim()}\n\`\`\``
    }
    parts.push(ex)
  }

  if (f.penjelasan.trim()) {
    parts.push(`## Penjelasan\n${f.penjelasan.trim()}`)
  }

  if (f.batasan.trim()) {
    parts.push(`## Batasan\n${f.batasan.trim()}`)
  }

  return parts.join('\n\n')
}

const FIELD_INPUT = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm resize-none'
const FIELD_MONO  = 'w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm resize-none font-mono'

export default function AddProblemModal({ profile, onCreated }: Props) {
  const [fields, setFields] = useState<Fields>({
    title: '', level: 'easy',
    deskripsi: '', formatInput: '', formatOutput: '',
    contohInput: '', contohOutput: '', penjelasan: '', batasan: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }))

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

    setFields({
      title: '', level: 'easy',
      deskripsi: '', formatInput: '', formatOutput: '',
      contohInput: '', contohOutput: '', penjelasan: '', batasan: '',
    })
    onCreated(data as Problem)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Tambah Soal Baru</h2>
        <p className="text-sm text-gray-400 mt-1">Isi form di bawah — soal langsung tersedia di papan setelah disimpan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title + Level row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Judul Soal</label>
            <input
              type="text"
              value={fields.title}
              onChange={set('title')}
              placeholder="Contoh: Jumlah Dua Bilangan"
              className={FIELD_INPUT.replace('resize-none', '')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Level & Poin</label>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setFields(prev => ({ ...prev, level: l }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                    fields.level === l
                      ? LEVEL_SELECTED[l]
                      : 'bg-gray-800/60 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                  }`}
                >
                  <LevelBadge level={l} />
                  <span className={fields.level === l ? 'opacity-70 text-xs' : 'text-gray-600 text-xs'}>{LEVEL_POINTS[l]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <AlignLeft className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-300">Deskripsi Masalah</label>
            <span className="text-xs text-gray-600">wajib</span>
          </div>
          <textarea
            value={fields.deskripsi}
            onChange={set('deskripsi')}
            placeholder="Ceritakan konteks dan masalah yang harus diselesaikan..."
            className={FIELD_INPUT}
            rows={4}
            required
          />
        </div>

        {/* Format Input + Output */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ArrowDownToLine className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-300">Format Input</label>
            </div>
            <textarea
              value={fields.formatInput}
              onChange={set('formatInput')}
              placeholder="Jelaskan format input yang diterima..."
              className={FIELD_INPUT}
              rows={3}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ArrowUpFromLine className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-300">Format Output</label>
            </div>
            <textarea
              value={fields.formatOutput}
              onChange={set('formatOutput')}
              placeholder="Jelaskan format output yang diharapkan..."
              className={FIELD_INPUT}
              rows={3}
            />
          </div>
        </div>

        {/* Contoh Input + Output */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Terminal className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-300">Contoh Input</label>
            </div>
            <textarea
              value={fields.contohInput}
              onChange={set('contohInput')}
              placeholder={"5\n3 1 4 1 5"}
              className={FIELD_MONO}
              rows={4}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Terminal className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-300">Contoh Output</label>
            </div>
            <textarea
              value={fields.contohOutput}
              onChange={set('contohOutput')}
              placeholder={"14"}
              className={FIELD_MONO}
              rows={4}
            />
          </div>
        </div>

        {/* Penjelasan + Batasan */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <AlignLeft className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-300">Penjelasan Contoh</label>
              <span className="text-xs text-gray-600">opsional</span>
            </div>
            <textarea
              value={fields.penjelasan}
              onChange={set('penjelasan')}
              placeholder="Jelaskan langkah penyelesaian dari contoh di atas..."
              className={FIELD_INPUT}
              rows={4}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-300">Batasan</label>
              <span className="text-xs text-gray-600">opsional</span>
            </div>
            <textarea
              value={fields.batasan}
              onChange={set('batasan')}
              placeholder={"1 ≤ N ≤ 100\nWaktu: 1 detik\nMemori: 256 MB"}
              className={FIELD_INPUT}
              rows={4}
            />
          </div>
        </div>

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
