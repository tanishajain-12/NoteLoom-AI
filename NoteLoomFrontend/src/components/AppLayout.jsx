import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, Bell, Profile as ProfileIcon } from '../icons'

function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fbf9f8] flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[#e4e2e1] bg-[#fbf9f8]/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
               className="md:hidden p-2 rounded-lg hover:bg-[#f0eded]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-[#1b1c1c]">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-[#f0eded]">
              <Bell className="w-5 h-5 text-[#524343]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#8a4d4e]"></span>
            </button>
            <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a4d4e] text-white text-sm font-bold">
              JD
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
