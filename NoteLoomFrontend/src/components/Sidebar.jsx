import { Link, useLocation } from 'react-router-dom'
import { Dashboard as DashboardIcon, History as HistoryIcon, Profile as ProfileIcon, Settings as SettingsIcon, Logout, NoteSumm, X } from '../icons'
import { useLogout } from '../hooks/useLogout'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
  { label: 'History', to: '/history', icon: HistoryIcon },
  { label: 'Profile', to: '/profile', icon: ProfileIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon },
]

function Sidebar({ open, onClose }) {
  const location = useLocation()
  const logout = useLogout()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 bg-[#f6f3f2] border-r border-[#e4e2e1] transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#e4e2e1]">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8a4d4e] text-white font-bold text-sm">
              N
            </div>
            <span className="font-display text-lg font-bold text-[#1b1c1c]">NoteLoom AI</span>
          </Link>
          <button className="md:hidden p-1.5 rounded-lg hover:bg-[#f0eded]" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-4">
          <p className="px-3 mb-2 text-xs font-semibold text-[#857372] uppercase tracking-wider">Menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.to
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#8a4d4e] text-white'
                        : 'text-[#524343] hover:bg-[#f0eded]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e4e2e1]">
          <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#524343] hover:bg-[#f0eded] transition-colors">
            <Logout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
