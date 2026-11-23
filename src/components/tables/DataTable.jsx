// ── DataTable: built-in search, sort and pagination ─────────────────────────
import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import Pagination from './Pagination'
import EmptyState from '../ui/EmptyState'
import { cn } from '../../utils/format'

export default function DataTable({
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  initialQuery = '',
  pageSize = 8,
  toolbar,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyIcon,
  rowKey = 'id',
}) {
  const [query, setQuery] = useState(initialQuery)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  useEffect(() => { setQuery(initialQuery) }, [initialQuery])
  useEffect(() => { setPage(1) }, [query, sortKey, sortDir])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || searchKeys.length === 0) return data
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)),
    )
  }, [data, query, searchKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortKey(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-line bg-secondary/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="input h-9 pl-10 text-[13px]"
            aria-label="Search table"
          />
        </div>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-tint">
              {columns.map((col) => (
                <th key={col.key || col.label} className={cn('th', col.className)}>
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1.5 uppercase transition-colors hover:text-body"
                    >
                      {col.label}
                      {sortKey === col.key
                        ? (sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)
                        : <ArrowUpDown size={11} className="opacity-50" />}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pageRows.map((row) => (
              <tr key={row[rowKey]} className="transition-colors hover:bg-tint">
                {columns.map((col) => (
                  <td key={col.key || col.label} className={cn('td', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
          {sorted.length === 0 && (
            <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line bg-secondary/30 px-4 py-2.5 sm:flex-row">
          <p className="text-[11px] font-medium text-muted">
            Showing <span className="text-body">{sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</span>–
            <span className="text-body">{Math.min(safePage * pageSize, sorted.length)}</span> of{' '}
            <span className="text-body">{sorted.length}</span> records
          </p>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
    </div>
  )
}
