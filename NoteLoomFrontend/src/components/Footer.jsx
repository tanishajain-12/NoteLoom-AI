import { Link } from 'react-router-dom'

function Footer() {
  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', to: '/' },
        { label: 'Pricing', to: '/' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'History', to: '/history' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/' },
        { label: 'Blog', to: '/' },
        { label: 'Careers', to: '/' },
        { label: 'Contact', to: '/' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', to: '/' },
        { label: 'Terms', to: '/' },
        { label: 'Security', to: '/' },
        { label: 'Cookies', to: '/' },
      ],
    },
  ]

  return (
    <footer className="bg-[#f6f3f2] border-t border-[#e4e2e1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8a4d4e] text-white font-bold">
                N
              </div>
              <span className="font-display text-xl font-bold text-[#1b1c1c]">NoteLoom AI</span>
            </Link>
            <p className="text-sm text-[#524343] max-w-xs">
              AI-powered lecture and meeting notes summarizer. Turn hours of content into minutes of insight.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-[#1b1c1c] mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-[#524343] hover:text-[#8a4d4e] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[#e4e2e1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#857372]">© 2026 NoteLoom AI. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-[#857372]">
            <Link to="/settings" className="hover:text-[#8a4d4e]">Settings</Link>
            <Link to="/profile" className="hover:text-[#8a4d4e]">Profile</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
