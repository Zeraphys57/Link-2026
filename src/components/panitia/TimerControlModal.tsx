'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import { Play, RotateCcw, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  startAt: string | null
  durationSeconds: number
  onClose: () => void
}

export default function TimerControlModal({ open, startAt, durationSeconds, onClose }: Props) {
  const supabase = createClient()
  const [hours, setHours] = useState(durationSeconds / 3600)
  const [loading, setLoading] = useState<string | null>(null)

  const isRunning = startAt !== null
  const endAt = startAt ? new Date(new Date(startAt).getTime() + durationSeconds * 1000) : null

  async function saveDuration() {
    if (hours <= 0 || hours > 24) {
      toast.error('Durasi harus 0–24 jam')
      return
    }
    setLoading('save')
    const newDuration = Math.round(hours * 3600)
    const { error } = await supabase
      .from('app_settings')
      .update({ int_value: newDuration, updated_at: new Date().toISOString() })
      .eq('key', 'contest_timer')
    setLoading(null)
    if (error) toast.error('Gagal simpan: ' + error.message)
    else toast.success(`Durasi diset: ${hours} jam`)
  }

  async function startContest() {
    if (hours <= 0 || hours > 24) {
      toast.error('Durasi harus 0–24 jam')
      return
    }
    if (isRunning) {
      const c = window.confirm('Timer sudah jalan. Restart dari sekarang? (Countdown akan reset)')
      if (!c) return
    }
    setLoading('start')
    const newDuration = Math.round(hours * 3600)
    const { error } = await supabase
      .from('app_settings')
      .update({
        ts_value: new Date().toISOString(),
        int_value: newDuration,
        updated_at: new Date().toISOString(),
      })
      .eq('key', 'contest_timer')
    setLoading(null)
    if (error) toast.error('Gagal start: ' + error.message)
    else { toast.success(`Kompetisi dimulai! Durasi ${hours} jam`); onClose() }
  }

  async function resetContest() {
    const c = window.confirm('Reset timer? Countdown jadi "Belum dimulai".')
    if (!c) return
    setLoading('reset')
    const { error } = await supabase
      .from('app_settings')
      .update({ ts_value: null, updated_at: new Date().toISOString() })
      .eq('key', 'contest_timer')
    setLoading(null)
    if (error) toast.error('Gagal reset: ' + error.message)
    else { toast.success('Timer di-reset'); onClose() }
  }

  return (
    <Modal open={open} onClose={onClose} title="Pengaturan Timer Kompetisi" size="md">
      <div className="p-6 space-y-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1.5">Status</p>
          {isRunning ? (
            <div className="space-y-1">
              <p className="text-sm text-emerald-400 font-semibold">▶ Sedang berjalan</p>
              <p className="text-xs text-gray-500">
                Mulai&nbsp;&nbsp;&nbsp;: {new Date(startAt!).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500">
                Berakhir : {endAt?.toLocaleString('id-ID')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">⏸ Belum dimulai</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest font-medium mb-2">
            Durasi (jam)
          </label>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(parseFloat(e.target.value) || 0)}
            min={0.1}
            max={24}
            step={0.1}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
          />
          <p className="text-xs text-gray-600 mt-1">
            Default 4 jam. Bisa pecahan (mis. <code className="text-gray-500">2.5</code> = 2 jam 30 menit).
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={saveDuration}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 border border-gray-700"
          >
            <Save className="w-4 h-4" />
            {loading === 'save' ? 'Menyimpan…' : 'Simpan Durasi (tanpa mulai)'}
          </button>

          <button
            onClick={startContest}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {loading === 'start' ? 'Memulai…' : (isRunning ? 'Restart Timer Sekarang' : 'Mulai Kompetisi Sekarang')}
          </button>

          {isRunning && (
            <button
              onClick={resetContest}
              disabled={loading !== null}
              className="flex items-center justify-center gap-2 bg-red-600/15 hover:bg-red-600/25 text-red-300 font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 border border-red-600/40"
            >
              <RotateCcw className="w-4 h-4" />
              {loading === 'reset' ? 'Mereset…' : 'Reset Timer (jadi "Belum dimulai")'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
