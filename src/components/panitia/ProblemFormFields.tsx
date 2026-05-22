'use client'

import { AlignLeft, ArrowDownToLine, ArrowUpFromLine, Terminal, Shield } from 'lucide-react'
import type { Level } from '@/lib/types'
import { LEVEL_POINTS } from '@/lib/types'
import LevelBadge from '@/components/ui/LevelBadge'
import type { ProblemFields } from '@/lib/problem-form'

const LEVEL_SELECTED: Record<Level, string> = {
  easy:   'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10 shadow-md',
  medium: 'bg-orange-500/15 border-orange-500/50 text-orange-300 shadow-orange-500/10 shadow-md',
  hard:   'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-purple-500/10 shadow-md',
  super:  'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-blue-500/10 shadow-md',
}

const LEVELS: Level[] = ['easy', 'medium', 'hard', 'super']

const FIELD_INPUT = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm resize-none disabled:opacity-60'
const FIELD_MONO  = 'w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm resize-none font-mono disabled:opacity-60'

interface Props {
  fields: ProblemFields
  onChange: (next: ProblemFields) => void
  disabled?: boolean
}

// Body form Tambah/Edit Soal — dipakai bersama oleh AddProblemModal & EditProblemModal
// supaya kedua form identik. Tombol submit di-render oleh masing-masing pemanggil.
export default function ProblemFormFields({ fields, onChange, disabled = false }: Props) {
  const set = (key: keyof ProblemFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...fields, [key]: e.target.value })

  return (
    <>
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
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Level &amp; Poin</label>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map(l => (
              <button
                key={l}
                type="button"
                onClick={() => onChange({ ...fields, level: l })}
                disabled={disabled}
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
          disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
          />
        </div>
      </div>
    </>
  )
}
