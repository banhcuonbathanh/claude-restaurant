'use client'

// ♨ Canh & Giò per-table matrix — shared by PrepPanel (Zone C) and
// ConfirmedPrepList (Zone D4). Tables as rows, one column per canh variant +
// a single combined Giò column. Tổng counts canh only — Giò is excluded from
// the row/grand totals (kitchen ladles canh per bowl; giò is grab-and-go).
export interface CanhGioEntry {
  tableLabel: string
  name:       string   // dish name — classified into a canh variant column or Giò here
  qty:        number
}

const isCanh = (name: string) => name.toLowerCase().includes('canh')
const isGio  = (name: string) => { const n = name.toLowerCase(); return n.includes('giò') || n.includes('gio') }

// True when the dish belongs in this matrix (callers use it to exclude canh/giò from their own rows).
export function isCanhGioName(name: string): boolean {
  return isCanh(name) || isGio(name)
}

const GIO = '__gio__'

export function CanhGioMatrix({ entries }: { entries: CanhGioEntry[] }) {
  const canhNames = Array.from(new Set(entries.filter(e => isCanh(e.name)).map(e => e.name)))
    .sort((a, b) => a.localeCompare(b, 'vi'))
  const hasGio = entries.some(e => isGio(e.name))
  const columns: { key: string; label: string }[] = [
    ...canhNames.map(name => ({ key: name, label: name })),
    ...(hasGio ? [{ key: GIO, label: 'Giò' }] : []),
  ]
  if (columns.length === 0) return null

  // table label → column key → qty
  const matrix = new Map<string, Map<string, number>>()
  for (const e of entries) {
    const colKey = isCanh(e.name) ? e.name : isGio(e.name) ? GIO : null
    if (!colKey || e.qty <= 0) continue
    const t = matrix.get(e.tableLabel) ?? new Map<string, number>()
    t.set(colKey, (t.get(colKey) ?? 0) + e.qty)
    matrix.set(e.tableLabel, t)
  }

  const tables = Array.from(matrix.keys()).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }))
  const rowTotal = (t: string) => canhNames.reduce((s, name) => s + (matrix.get(t)?.get(name) ?? 0), 0)
  const colTotal = (key: string) => tables.reduce((s, t) => s + (matrix.get(t)?.get(key) ?? 0), 0)
  const grandTotal = tables.reduce((s, t) => s + rowTotal(t), 0)

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <span className="text-xs">♨</span> Canh &amp; Giò
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
              {columns.map(c => {
                const q = matrix.get(t)?.get(c.key) ?? 0
                return <td key={c.key} className="text-center py-1.5 px-2">{q > 0 ? q : '–'}</td>
              })}
              <td className="text-center py-1.5 px-2 font-bold text-primary">{rowTotal(t)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-100">
            <td className="py-1.5 px-2 uppercase tracking-wide">Tổng</td>
            {columns.map(c => (
              <td key={c.key} className="text-center py-1.5 px-2">{colTotal(c.key)}</td>
            ))}
            <td className="text-center py-1.5 px-2 text-primary">{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
