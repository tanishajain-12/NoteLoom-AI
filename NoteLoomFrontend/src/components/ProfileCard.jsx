import { useState } from 'react'
import Button from './Button'
import { Mail, Calendar, FileText } from '../icons'

/**
 * ProfileCard
 *
 * Props:
 *   user         — { name, email, joinedDate, totalNotes, avatar }
 *   onNameSave   — async (newName: string) => void
 *                  Called when the user confirms a name edit.
 *                  Parent is responsible for persisting + refreshing.
 *
 * Editing behaviour:
 *   - Clicking the name text switches it to an inline input.
 *   - Pressing Enter or clicking "Save" triggers onNameSave.
 *   - Pressing Escape cancels without saving.
 *   - While saving, the input is disabled and a spinner is shown.
 *   - The existing UI layout is not changed; only the name text becomes editable.
 */
function ProfileCard({ user, onNameSave }) {
  const { name, email, joinedDate, totalNotes, avatar } = user

  const [editing,   setEditing]   = useState(false)
  const [editName,  setEditName]  = useState(name)
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState('')

  // Start editing — pre-fill with current name
  const startEdit = () => {
    setEditName(name)
    setSaveError('')
    setEditing(true)
  }

  // Cancel without saving
  const cancelEdit = () => {
    setEditing(false)
    setSaveError('')
  }

  // Confirm save
  const confirmSave = async () => {
    const trimmed = editName.trim()
    if (!trimmed) { setSaveError('Name cannot be empty'); return }
    if (trimmed.length < 2) { setSaveError('Name must be at least 2 characters'); return }
    if (trimmed === name)   { setEditing(false); return }   // no change

    setSaving(true)
    setSaveError('')
    try {
      await onNameSave(trimmed)
      setEditing(false)
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); confirmSave() }
    if (e.key === 'Escape') { cancelEdit() }
  }

  return (
    <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-[#ffdad9] to-[#d9e4ec]"></div>
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#8a4d4e] text-white text-3xl font-bold border-4 border-white shadow-md">
            {avatar}
          </div>
          <Button variant="soft" size="sm" to="/settings">Edit Profile</Button>
        </div>

        {/* Name — click to edit inline */}
        {editing ? (
          <div className="mb-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={saving}
              autoFocus
              className="font-display text-2xl font-bold text-[#1b1c1c] w-full rounded-lg border border-[#8a4d4e] px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#8a4d4e]/30 disabled:opacity-60"
            />
            {saveError && <p className="mt-1 text-xs text-[#93000a]">{saveError}</p>}
            <div className="flex gap-2 mt-2">
              <button
                onClick={confirmSave}
                disabled={saving}
                className="rounded-lg bg-[#8a4d4e] px-3 py-1 text-xs font-semibold text-white hover:bg-[#6e3637] disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-lg border border-[#d7c2c1] px-3 py-1 text-xs font-semibold text-[#524343] hover:bg-[#f0eded] disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h2
            className="font-display text-2xl font-bold text-[#1b1c1c] cursor-pointer hover:text-[#8a4d4e] transition-colors group"
            onClick={startEdit}
            title="Click to edit your name"
          >
            {name}
            <span className="ml-2 text-sm font-normal text-[#857372] opacity-0 group-hover:opacity-100 transition-opacity">
              edit
            </span>
          </h2>
        )}

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-[#524343]">
            <Mail className="w-4 h-4 text-[#857372]" />
            {email}
          </div>
          {joinedDate && (
            <div className="flex items-center gap-2.5 text-sm text-[#524343]">
              <Calendar className="w-4 h-4 text-[#857372]" />
              Joined {joinedDate}
            </div>
          )}
          <div className="flex items-center gap-2.5 text-sm text-[#524343]">
            <FileText className="w-4 h-4 text-[#857372]" />
            {totalNotes} {totalNotes === 1 ? 'note' : 'notes'} summarized
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
