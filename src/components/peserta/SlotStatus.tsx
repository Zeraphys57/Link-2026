import { Layers } from 'lucide-react'

// Batas slot soal aktif per tim. Harus sama dengan limit yang ditegakkan di
// ClaimModal (count submissions verdict IS NULL >= 2 → tolak klaim baru).
export const MAX_SLOTS = 2

interface Props {
  // Soal yang sudah diklaim tapi belum disubmit (sedang dikerjakan).
  working: number
  // Soal yang sudah disubmit tapi belum dinilai panitia (menunggu koreksi).
  awaiting: number
}

export default function SlotStatus({ working, awaiting }: Props) {
  const used = Math.min(working + awaiting, MAX_SLOTS)
  const full = used >= MAX_SLOTS

  const breakdown =
    used === 0
      ? 'Belum ada soal aktif — kamu bisa ambil soal baru'
      : [
          working > 0 ? `${working} dikerjakan` : null,
          awaiting > 0 ? `${awaiting} menunggu koreksi` : null,
        ]
          .filter(Boolean)
          .join(' · ')

  return (
    <div
      title={`Slot aktif ${used}/${MAX_SLOTS} — ${breakdown}`}
      aria-label={`Slot aktif ${used} dari ${MAX_SLOTS}. ${breakdown}`}
      className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
        full
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : 'bg-gray-800/60 border-gray-700 text-gray-300'
      }`}
    >
      <Layers className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="hidden sm:inline tracking-wide">Slot</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: MAX_SLOTS }).map((_, i) => {
          const state =
            i < working ? 'working' : i < working + awaiting ? 'awaiting' : 'free'
          return (
            <span
              key={i}
              className={`w-2 h-2 rounded-sm ${
                state === 'working'
                  ? 'bg-indigo-400'
                  : state === 'awaiting'
                    ? 'bg-amber-400'
                    : 'bg-gray-600'
              }`}
            />
          )
        })}
      </span>
      <span className="tabular-nums">
        {used}/{MAX_SLOTS}
      </span>
    </div>
  )
}
