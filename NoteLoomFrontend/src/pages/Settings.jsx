import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Modal from '../components/Modal'
import Button from '../components/Button'
import { Moon, Sun, Bell, Trash } from '../icons'
import { deleteAccount } from '../services/api'
import { clearAuthStorage } from '../utils/auth'

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#8a4d4e]' : 'bg-[#d7c2c1]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function Settings() {
  const navigate = useNavigate()

  const [darkMode,    setDarkMode]    = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs,  setPushNotifs]  = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  // Delete-account flow state
  const [deleting,   setDeleting]   = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // -------------------------------------------------------------------------
  // Handle confirmed account deletion
  // -------------------------------------------------------------------------
  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount()

      // Clear all client-side auth state
      clearAuthStorage()

      // Close the modal before navigating so it doesn't linger
      setDeleteModal(false)

      // Redirect to landing page with a success message passed via state
      navigate('/', {
        replace: true,
        state: { accountDeleted: true, message: 'Your account has been deleted successfully.' },
      })
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
        'Could not delete your account. Please try again.'
      )
    } finally {
      setDeleting(false)
    }
  }

  // Reset error when the dialog is closed without confirming
  const handleCloseModal = () => {
    if (deleting) return          // don't allow closing while the request is in flight
    setDeleteError('')
    setDeleteModal(false)
  }

  const sections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: 'Dark Mode',
          description: 'Switch between light and dark theme',
          control: <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Email Notifications',
          description: 'Receive summary completion emails',
          control: <Toggle enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />,
        },
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Browser push notifications',
          control: <Toggle enabled={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} />,
        },
      ],
    },
  ]

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c]">Settings</h2>
          <p className="mt-1 text-sm text-[#524343]">Manage your account preferences</p>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#f0eded] bg-[#f6f3f2]">
              <h3 className="text-xs font-semibold text-[#857372] uppercase tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-[#f0eded]">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ffdad9]">
                        <Icon className="w-4 h-4 text-[#8a4d4e]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1b1c1c]">{item.label}</p>
                        <p className="text-xs text-[#857372]">{item.description}</p>
                      </div>
                    </div>
                    {item.control}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Account — Danger Zone */}
        <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0eded] bg-[#f6f3f2]">
            <h3 className="text-xs font-semibold text-[#857372] uppercase tracking-wider">Account</h3>
          </div>
          <div className="p-5">
            <div className="rounded-xl border border-[#ffdad6] bg-[#fff5f5] p-4">
              <h4 className="font-display text-base font-bold text-[#93000a] mb-1">Danger Zone</h4>
              <p className="text-sm text-[#524343] mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteModal(true)}
              >
                <Trash className="w-4 h-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account confirmation dialog */}
      <Modal
        open={deleteModal}
        onClose={handleCloseModal}
        title="Delete Account"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseModal}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete Permanently'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#524343]">
          Are you absolutely sure? This will permanently delete your account, all notes, and summary history. This action cannot be undone.
        </p>

        {/* Backend error — shown inside the dialog so the user sees it in context */}
        {deleteError && (
          <p className="mt-3 rounded-lg border border-[#ffdad6] bg-[#fff5f5] px-3 py-2 text-xs text-[#93000a]">
            {deleteError}
          </p>
        )}
      </Modal>
    </AppLayout>
  )
}

export default Settings
