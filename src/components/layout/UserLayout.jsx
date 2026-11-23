import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useCrm } from '../../context/CrmContext'
import { cn } from '../../utils/format'

export default function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { settings } = useCrm()
  const compact = settings?.appearance?.density === 'compact'

  return (
    <div className={cn('flex h-screen overflow-hidden bg-bg text-ink', compact && 'compact')}>
      <Sidebar variant="user" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar variant="user" onMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className="page-pad min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div key={location.pathname} className="animate-page-enter h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
