'use client'
import { useState } from 'react'

// ♨ Canh & Giò per-table matrix — shared by PrepPanel (Zone C) and
// ConfirmedPrepList (Zone D4). Tables as rows, one column per canh variant +
// a single combined Giò column. Tổng counts canh only — Giò is excluded from
// the row/grand totals (kitchen ladles canh per bowl; giò is grab-and-go).
// Entries flagged `preview` (pending orders under 🔍 Kiểm tra) are never mixed
// into the base count: default mode renders them as amber "+N" beside the base;
// collapsible mode splits them into their own ⊕ Kiểm tra table (see below).
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

// combined = base + amber "+preview" in one cell · base / preview = that part only
type CellMode = 'combined' | 'base' | 'preview'

// '–' when the shown part is zero
function CellValue({ cell, mode, bold }: { cell: Cell; mode: CellMode; bold?: boolean }) {
  const { base, preview } = cell
  if (mode === 'base') {
    if (base === 0) return <>–</>
    return <span className={bold ? 'font-bold' : undefined}>{base}</span>
  }
  if (mode === 'preview') {
    if (preview === 0) return <>–</>
    return <span className={`italic text-amber-600 dark:text-amber-400 ${bold ? 'font-bold' : 'font-semibold'}`}>+{preview}</span>
  }
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

// collapsible=true (Zone D4): base counts and ⊕ Kiểm tra previews render as two
// separate tables; the Ẩn/Hiện toggle hides only the base table — the header line
// and the ⊕ Kiểm tra table always stay visible.
export function CanhGioMatrix({ entries, collapsible }: { entries: CanhGioEntry[]; collapsible?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
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

  // Split mode: base table keeps only tables with base counts; ⊕ Kiểm tra table only tables with previews.
  const baseTables    = collapsible ? tables.filter(t => columns.some(c => cellAt(t, c.key).base > 0)) : tables
  const previewTables = collapsible ? tables.filter(t => columns.some(c => cellAt(t, c.key).preview > 0)) : []
  const showBase    = !(collapsible && collapsed) && baseTables.length > 0
  const showPreview = collapsible && previewTables.length > 0

  function renderMatrixTable(mode: CellMode, rowTables: string[]) {
    return (
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
          {rowTables.map(t => (
            <tr key={t} className="text-gray-700 dark:text-gray-300">
              <td className="py-1.5 px-2 font-semibold">{t}</td>
              {columns.map(c => (
                <td key={c.key} className="text-center py-1.5 px-2 tabular-nums">
                  <CellValue cell={cellAt(t, c.key)} mode={mode} />
                </td>
              ))}
              <td className="text-center py-1.5 px-2 text-primary tabular-nums">
                <CellValue cell={rowTotal(t)} mode={mode} bold />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-100">
            <td className="py-1.5 px-2 uppercase tracking-wide">Tổng</td>
            {columns.map(c => (
              <td key={c.key} className="text-center py-1.5 px-2 tabular-nums">
                <CellValue cell={colTotal(c.key)} mode={mode} />
              </td>
            ))}
            <td className="text-center py-1.5 px-2 text-primary tabular-nums">
              <CellValue cell={grandTotal} mode={mode} bold />
            </td>
          </tr>
        </tfoot>
      </table>
    )
  }

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <p className={`text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5 ${showBase || showPreview ? 'mb-2' : ''}`}>
        <span className="text-xs">♨</span> Canh &amp; Giò
        {grandTotal.preview > 0 && (
          <span className="normal-case tracking-normal font-semibold text-amber-600 dark:text-amber-400">
            · ⊕ +{grandTotal.preview} kiểm tra
          </span>
        )}
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            className="ml-auto normal-case tracking-normal text-xs font-semibold px-2 py-0.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {collapsed ? 'Hiện' : 'Ẩn'}
          </button>
        )}
      </p>
      {showBase && renderMatrixTable(collapsible ? 'base' : 'combined', baseTables)}
      {/* ⊕ Kiểm tra table — split mode only; never hidden by the Ẩn toggle */}
      {showPreview && (
        <div className={`rounded-lg border border-dashed border-amber-400 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20 px-2 py-1.5 ${showBase ? 'mt-3' : ''}`}>
          <p className={`text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide px-2 pt-0.5 flex items-center ${previewCollapsed ? '' : 'mb-1'}`}>
            ⊕ Kiểm tra
            <button
              type="button"
              onClick={() => setPreviewCollapsed(v => !v)}
              className="ml-auto normal-case tracking-normal text-xs font-semibold px-2 py-0.5 rounded-md border border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              {previewCollapsed ? 'Hiện' : 'Ẩn'}
            </button>
          </p>
          {!previewCollapsed && renderMatrixTable('preview', previewTables)}
        </div>
      )}
    </div>
  )
}
