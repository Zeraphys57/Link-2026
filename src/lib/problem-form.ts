import type { Level } from './types'

// Field-field terstruktur untuk form Tambah/Edit Soal. Deskripsi soal disimpan
// di DB sebagai satu string Markdown — buildDescription merakitnya, parseDescription
// memecahnya kembali ke field saat soal dibuka untuk diedit.
export interface ProblemFields {
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

export const EMPTY_PROBLEM_FIELDS: ProblemFields = {
  title: '',
  level: 'easy',
  deskripsi: '',
  formatInput: '',
  formatOutput: '',
  contohInput: '',
  contohOutput: '',
  penjelasan: '',
  batasan: '',
}

// Rakit field-field menjadi deskripsi Markdown yang tersimpan di kolom problems.description.
export function buildDescription(f: ProblemFields): string {
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

type DescriptionFields = Omit<ProblemFields, 'title' | 'level'>

const EMPTY_DESCRIPTION_FIELDS: DescriptionFields = {
  deskripsi: '',
  formatInput: '',
  formatOutput: '',
  contohInput: '',
  contohOutput: '',
  penjelasan: '',
  batasan: '',
}

// Ambil isi blok ```...``` di bawah label **Input:** / **Output:** dalam seksi Contoh.
function parseContoh(body: string): { input: string; output: string } {
  const lines = body.split('\n')
  let input = ''
  let output = ''
  let mode: 'input' | 'output' | null = null
  let inFence = false
  let buffer: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^\*\*input:?\*\*/i.test(trimmed)) {
      mode = 'input'
      continue
    }
    if (/^\*\*output:?\*\*/i.test(trimmed)) {
      mode = 'output'
      continue
    }
    if (trimmed.startsWith('```')) {
      if (!inFence) {
        inFence = true
        buffer = []
      } else {
        inFence = false
        const content = buffer.join('\n')
        if (mode === 'input') input = content
        else if (mode === 'output') output = content
      }
      continue
    }
    if (inFence) buffer.push(line)
  }

  return { input, output }
}

// Kebalikan dari buildDescription: pecah Markdown kembali ke field form.
// Kalau deskripsi tidak punya heading "## ..." yang dikenal (soal lama/format bebas),
// seluruh teks dimasukkan ke field Deskripsi agar tidak ada isi yang hilang.
export function parseDescription(description: string): DescriptionFields {
  if (!description.trim()) return { ...EMPTY_DESCRIPTION_FIELDS }

  const lines = description.split('\n')
  const sections: { heading: string; body: string }[] = []
  let current: { heading: string; body: string[] } | null = null

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line)
    if (m) {
      if (current) sections.push({ heading: current.heading, body: current.body.join('\n') })
      current = { heading: m[1].toLowerCase(), body: [] }
    } else if (current) {
      current.body.push(line)
    }
  }
  if (current) sections.push({ heading: current.heading, body: current.body.join('\n') })

  if (sections.length === 0) {
    return { ...EMPTY_DESCRIPTION_FIELDS, deskripsi: description.trim() }
  }

  const result: DescriptionFields = { ...EMPTY_DESCRIPTION_FIELDS }
  for (const { heading, body } of sections) {
    const text = body.trim()
    if (heading === 'deskripsi') result.deskripsi = text
    else if (heading === 'input') result.formatInput = text
    else if (heading === 'output') result.formatOutput = text
    else if (heading === 'penjelasan') result.penjelasan = text
    else if (heading === 'batasan') result.batasan = text
    else if (heading === 'contoh') {
      const ex = parseContoh(body)
      result.contohInput = ex.input
      result.contohOutput = ex.output
    }
  }
  return result
}
