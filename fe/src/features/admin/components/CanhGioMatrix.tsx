'use client'

// ♨ Canh & Giò per-table matrix — shared by PrepPanel (Zone C) and
// ConfirmedPrepList (Zone D4). Tables as rows, one column per canh variant +
// a single combined Giò column. Tổng counts canh only — Giò is excluded from
// the row/grand totals (kitchen ladles canh per bowl; giò is grab-and-go).
// Entries flagged `preview` (pending orders under 🔍 Kiểm tra) render as
// amber "+N" beside the base count — never mixed into it.
export interface CanhGioEntry {
  tableLabel: string
  name:       string   // dish name — classified into a canh variant column or Giò here
  qty:        number
  preview?:   boolean  // true = ⊕ SL thêm (kiểm tra), counted separately from base
}

const isCanh = (name: string) => name.toLowerCase().includes('canh')
const isGio  = (name: string) => { const n = name.toLowerCase(); return n.includes('giò') || n.includes('gio') }

// True when the dish belongs in this matrix (callers use it to exclude canh/giò from their own rows).
export function isCanhGioName(name: string): boolean {
  return isCanh(name) || isGio(name)
}

const GIO = '__gio__'

interface Cell { base: number; preview: number }

// base + amber "+preview" — '–' when both are zero
function CellValue({ cell, bold }: { cell: Cell; bold?: boolean }) {
  const { base, preview } = cell
  if (base === 0 && preview === 0) return <>–</>
  return (
    <>
      {(base > 0 || preview === 0) && <span className={bold ? 'font-bold' : undefined}>{base}</span>}
      {preview > 0 && (
        <span className="font-semibold italic text-amber-600 dark:text-amber-400">
          {base > 0 ? ' ' : ''}+{preview}
        </span>
      )}
    </>
  )
}

export function CanhGioMatrix({ entries }: { entries: CanhGioEntry[] }) {
  const canhNames = Array.from(new Set(entries.filter(e => isCanh(e.name)).map(e => e.name)))
    .sort((a, b) => a.localeCompare(b, 'vi'))
  const hasGio = entries.some(e => isGio(e.name))
  const columns: { key: string; label: string }[] = [
    ...canhNames.map(name => ({ key: name, label: name })),
    ...(hasGio ? [{ key: GIO, label: 'Giò' }] : []),
  ]
  if (columns.length === 0) return null

  // table label → column key → { base, preview }
  const matrix = new Map<string, Map<string, Cell>>()
  for (const e of entries) {
    const colKey = isCanh(e.name) ? e.name : isGio(e.name) ? GIO : null
    if (!colKey || e.qty <= 0) continue
    const t = matrix.get(e.tableLabel) ?? new Map<string, Cell>()
    const cell = t.get(colKey) ?? { base: 0, preview: 0 }
    if (e.preview) cell.preview += e.qty
    else cell.base += e.qty
    t.set(colKey, cell)
    matrix.set(e.tableLabel, t)
  }

  const tables = Array.from(matrix.keys()).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }))
  const cellAt = (t: string, key: string): Cell => matrix.get(t)?.get(key) ?? { base: 0, preview: 0 }
  const addCells = (a: Cell, b: Cell): Cell => ({ base: a.base + b.base, preview: a.preview + b.preview })
  const rowTotal = (t: string) => canhNames.reduce((s, name) => addCells(s, cellAt(t, name)), { base: 0, preview: 0 })
  const colTotal = (key: string) => tables.reduce((s, t) => addCells(s, cellAt(t, key)), { base: 0, preview: 0 })
  const grandTotal = tables.reduce((s, t) => addCells(s, rowTotal(t)), { base: 0, preview: 0 })

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <span className="text-xs">♨</span> Canh &amp; Giò
        {grandTotal.preview > 0 && (
          <span className="normal-case tracking-normal font-semibold text-amber-600 dark:text-amber-400">
            · ⊕ +{grandTotal.preview} kiểm tra
          </span>
        )}
      </p>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th className="text-left font-medium py-1.5 px-2">Bàn</th>
            {columns.map(c => (
              <th key={c.key} className="text-center font-medium py-1.5 px-2">{c.label}</th>
            ))}
            <th className="text-center font-semibold py-1.5 px-2">Tổng</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {tables.map(t => (
            <tr key={t} className="text-gray-700 dark:text-gray-300">
              <td className="py-1.5 px-2 font-semibold">{t}</td>
              {columns.map(c => (
                <td key={c.key} className="text-center py-1.5 px-2 tabular-nums">
                  <CellValue cell={cellAt(t, c.key)} />
                </td>
              ))}
              <td className="text-center py-1.5 px-2 text-primary tabular-nums">
                <CellValue cell={rowTotal(t)} bold />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-100">
            <td className="py-1.5 px-2 uppercase tracking-wide">Tổng</td>
            {columns.map(c => (
              <td key={c.key} className="text-center py-1.5 px-2 tabular-nums">
                <CellValue cell={colTotal(c.key)} />
              </td>
            ))}
            <td className="text-center py-1.5 px-2 text-primary tabular-nums">
              <CellValue cell={grandTotal} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
