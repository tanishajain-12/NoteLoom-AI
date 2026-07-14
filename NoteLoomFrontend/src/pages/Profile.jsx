import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import ProfileCard from '../components/ProfileCard'
import Modal from '../components/Modal'
import Button from '../components/Button'
import { useLogout } from '../hooks/useLogout'
import { mockUser, mockStats } from '../data/mockData'
import { mockHistory } from '../data/mockData'
import { Logout, DocumentText, Clock, ChartBar, BookOpen } from '../icons'

const iconMap = {
  document: DocumentText,
  clock: Clock,
  chart: ChartBar,
  book: BookOpen,
}

function Profile() {
  const [logoutModal, setLogoutModal] = useState(false)
  const logout = useLogout()

  return (
    <AppLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileCard user={mockUser} />

        {/* Stats grid */}
        <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-[#1b1c1c] mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {mockStats.map((stat) => {
              const Icon = iconMap[stat.icon]
              return (
                <div key={stat.label} className="rounded-xl bg-[#f6f3f2] border border-[#e4e2e1] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffdad9] mb-3">
                    <Icon className="w-4 h-4 text-[#8a4d4e]" />
                  </div>
                  <p className="font-display text-xl font-extrabold text-[#1b1c1c]">{stat.value}</p>
                  <p className="text-xs text-[#524343] mt-0.5">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-[#1b1c1c] mb-4">Recent Activity</h3>
          <ul className="space-y-2">
            {mockHistory.slice(0, 4).map((note) => (
              <li key={note.id} className="flex items-center justify-between gap-2 py-2 border-b border-[#f0eded] last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1b1c1c] truncate">{note.title}</p>
                  <p className="text-xs text-[#857372]">{note.date}</p>
                </div>
                <span className="inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffdad9] text-[#592628]">
                  {note.type}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="danger"
          size="md"
          className="w-full"
          onClick={() => setLogoutModal(true)}
        >
          <Logout className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <Modal
        open={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Confirm Logout"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setLogoutModal(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={logout}>Logout</Button>
          </>
        }
      >
        <p className="text-sm text-[#524343]">Are you sure you want to log out of your account?</p>
      </Modal>
    </AppLayout>
  )
}

export default Profile
