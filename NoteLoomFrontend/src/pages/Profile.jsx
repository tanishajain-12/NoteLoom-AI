import { useState, useEffect, useCallback } from 'react'
import AppLayout from '../components/AppLayout'
import ProfileCard from '../components/ProfileCard'
import Modal from '../components/Modal'
import Button from '../components/Button'
import HistoryCard from '../components/HistoryCard'
import { useLogout } from '../hooks/useLogout'
import { getUserProfile, updateUserProfile, getStats, getHistory, getHistoryById } from '../services/api'
import { updateStoredUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import { Logout, DocumentText, Clock, ChartBar, BookOpen } from '../icons'

const iconMap = {
  document: DocumentText,
  clock:    Clock,
  chart:    ChartBar,
  book:     BookOpen,
}

// Build avatar initials from a name string (max 2 letters)
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

// Format ISO date string as "January 2026"
function formatJoinDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

function Profile() {
  const navigate       = useNavigate()
  const logout         = useLogout()
  const [logoutModal,  setLogoutModal]  = useState(false)

  // Real user data
  const [user,         setUser]         = useState(null)
  const [stats,        setStats]        = useState(null)
  const [recentNotes,  setRecentNotes]  = useState([])
  const [fetchingId,   setFetchingId]   = useState(null)

  // Loading / error states
  const [loadingUser,  setLoadingUser]  = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [profileError, setProfileError] = useState('')

  // -------------------------------------------------------------------------
  // Fetch user profile, stats, and recent notes in parallel on mount
  // -------------------------------------------------------------------------
  const fetchAll = useCallback(async () => {
    setLoadingUser(true)
    setLoadingStats(true)
    setProfileError('')

    try {
      const [profileData, statsData, historyData] = await Promise.all([
        getUserProfile(),
        getStats(),
        getHistory(),
      ])
      setUser(profileData)
      setStats(statsData)
      setRecentNotes(Array.isArray(historyData) ? historyData.slice(0, 4) : [])
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Could not load profile. Please refresh.'
      )
    } finally {
      setLoadingUser(false)
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // -------------------------------------------------------------------------
  // Name update — called by ProfileCard when the user confirms an edit
  // -------------------------------------------------------------------------
  const handleNameSave = async (newName) => {
    const updated = await updateUserProfile({ name: newName })
    // Update local state so the card re-renders immediately
    setUser(updated)
    // Keep localStorage in sync so AppLayout initials update too
    updateStoredUser({ name: updated.name })
  }

  // -------------------------------------------------------------------------
  // Click a recent-activity card to view the full summary
  // -------------------------------------------------------------------------
  const handleNoteClick = async (id) => {
    setFetchingId(id)
    try {
      const data = await getHistoryById(id)
      navigate('/results', { state: { summary: data } })
    } catch {
      // non-critical — silently ignore
    } finally {
      setFetchingId(null)
    }
  }

  // -------------------------------------------------------------------------
  // Derived values for ProfileCard
  // -------------------------------------------------------------------------
  const profileCardUser = user
    ? {
        name:       user.name,
        email:      user.email,
        joinedDate: formatJoinDate(user.createdAt),
        totalNotes: stats?.totalNotes ?? 0,
        avatar:     getInitials(user.name),
      }
    : null

  // Stat cards built from real data (same shape as Dashboard)
  const statCards = stats
    ? [
        { label: 'Total Notes',   value: String(stats.totalNotes),   icon: 'document' },
        { label: 'Hours Saved',   value: stats.hoursSaved,           icon: 'clock'    },
        { label: 'Quizzes Taken', value: String(stats.quizzesTaken), icon: 'book'     },
        { label: 'Avg. Accuracy', value: stats.avgAccuracy,          icon: 'chart'    },
      ]
    : null

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <AppLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Error banner */}
        {profileError && (
          <div className="rounded-xl border border-[#ffdad6] bg-[#fff5f5] px-4 py-3 text-sm text-[#93000a]">
            {profileError}
          </div>
        )}

        {/* Profile card skeleton while loading */}
        {loadingUser && !profileError ? (
          <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm overflow-hidden animate-pulse">
            <div className="h-24 bg-[#f0eded]"></div>
            <div className="px-6 pb-6 pt-14">
              <div className="h-6 bg-[#f0eded] rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-[#f0eded] rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-[#f0eded] rounded w-2/5"></div>
            </div>
          </div>
        ) : profileCardUser ? (
          <ProfileCard user={profileCardUser} onNameSave={handleNameSave} />
        ) : null}

        {/* Stats grid */}
        <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-[#1b1c1c] mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {statCards
              ? statCards.map((stat) => {
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
                })
              : [0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-[#f6f3f2] border border-[#e4e2e1] p-4 animate-pulse">
                    <div className="h-9 w-9 rounded-lg bg-[#e4e2e1] mb-3"></div>
                    <div className="h-6 w-10 bg-[#e4e2e1] rounded mb-1"></div>
                    <div className="h-3 w-20 bg-[#e4e2e1] rounded"></div>
                  </div>
                ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-[#1b1c1c] mb-4">Recent Activity</h3>

          {loadingUser ? (
            <ul className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-center justify-between gap-2 py-2 border-b border-[#f0eded] last:border-0 animate-pulse">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 bg-[#f0eded] rounded w-2/3 mb-1"></div>
                    <div className="h-3 bg-[#f0eded] rounded w-1/4"></div>
                  </div>
                  <div className="h-5 w-16 bg-[#f0eded] rounded-full shrink-0"></div>
                </li>
              ))}
            </ul>
          ) : recentNotes.length === 0 ? (
            <p className="text-sm text-[#857372]">
              No summaries yet. Generate your first from the Dashboard.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentNotes.map((note) => (
                <li
                  key={note._id}
                  onClick={() => handleNoteClick(note._id)}
                  className={`flex items-center justify-between gap-2 py-2 border-b border-[#f0eded] last:border-0 cursor-pointer hover:bg-[#fafaf9] rounded-lg px-2 -mx-2 transition-colors ${fetchingId === note._id ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1b1c1c] truncate">
                      {note.summary
                        ? note.summary.slice(0, 60) + (note.summary.length > 60 ? '…' : '')
                        : note.keyPoints?.[0] ?? 'Summary'}
                    </p>
                    <p className="text-xs text-[#857372]">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })
                        : ''}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffdad9] text-[#592628]">
                    Summary
                  </span>
                </li>
              ))}
            </ul>
          )}
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
            <Button variant="danger"  size="sm" onClick={logout}>Logout</Button>
          </>
        }
      >
        <p className="text-sm text-[#524343]">Are you sure you want to log out of your account?</p>
      </Modal>
    </AppLayout>
  )
}

export default Profile
