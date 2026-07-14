import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from './Button'
import { Menu, X } from '../icons'

function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Features', to: '/#features' },
    { label: 'How it Works', to: '/#how' },
    { label: 'Pricing', to: '/#pricing' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fbf9f8]/80 backdrop-blur-md border-b border-[#e4e2e1]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8a4d4e] text-white font-bold">
              N
            </div>
            <span className="font-display text-xl font-bold text-[#1b1c1c]">NoteLoom AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-3 py-2 text-sm font-medium text-[#524343] hover:text-[#8a4d4e] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" to="/login">Log in</Button>
            <Button variant="primary" size="sm" to="/signup">Get Started</Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#f0eded]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-[#e4e2e1] py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-3 py-2 text-sm font-medium text-[#524343] hover:text-[#8a4d4e] hover:bg-[#f0eded] rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-2 px-1">
                <Button variant="outline" size="sm" to="/login" onClick={() => setOpen(false)}>Log in</Button>
                <Button variant="primary" size="sm" to="/signup" onClick={() => setOpen(false)}>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
