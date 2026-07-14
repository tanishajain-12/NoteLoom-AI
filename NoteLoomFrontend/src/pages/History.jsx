import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import HistoryCard from '../components/HistoryCard'
import { getHistory, getHistoryById } from '../services/api'
import { Search, ChevronDown } from '../icons'

function History() {
  const navigate = useNavigate()

  const [notes, setNotes] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [listError, setListError] = useState('')

  // id of the card currently being fetched (for per-card loading indicator)
  const [fetchingId, setFetchingId] = useState(null)
  const [fetchError, setFetchError] = useState('')

  const [query, setQuery] = useState('')

  // Fetch all history on mount
  useEffect(() => {
    setLoadingList(true)
    getHistory()
      .then((data) => {
        setNotes(data)
        setListError('')
      })
      .catch((err) => {
        setListError(
          err.response?.data?.message ||
          'Could not load history. Please check your connection.'
        )
      })
      .finally(() => setLoadingList(false))
  }, [])

  // Client-side search against the summary text (transcript not in list)
  const filtered = notes.filter((n) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      (n.summary || '').toLowerCase().includes(q) ||
      (n.keyPoints || []).some((kp) => kp.toLowerCase().includes(q))
    )
  })

  // When a card is clicked: fetch the full document then navigate to Results
  const handleCardClick = async (id) => {
    setFetchingId(id)
    setFetchError('')
    try {
      const data = await getHistoryById(id)
      navigate('/results', { state: { summary: data } })
    } catch (err) {
      setFetchError(
        err.response?.data?.message ||
        'Could not load this summary. Please try again.'
      )
    } finally {
      setFetchingId(null)
    }
  }

  return (
    <AppLayout title="History">
      <div className="mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c]">Your History</h2>
        <p className="mt-1 text-sm text-[#524343]">
          {loadingList ? 'Loading…' : `${notes.length} ${notes.length === 1 ? 'summary' : 'summaries'} generated`}
        </p>
      </div>

      {/* Search bar — filter dropdown removed (no type field from backend) */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#857372] pointer-events-none" />
          <input
            type="text"
            placeholder="Search summaries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[#d7c2c1] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1b1c1c] placeholder:text-[#857372]/60 focus:outline-none focus:ring-2 focus:ring-[#8a4d4e]/30 focus:border-[#8a4d4e] transition-all"
          />
        </div>
      </div>

      {/* Error states */}
      {listError && (
        <div className="mb-4 rounded-xl border border-[#ffdad6] bg-[#fff5f5] px-4 py-3 text-sm text-[#93000a]">
          {listError}
        </div>
      )}

      {fetchError && (
        <div className="mb-4 rounded-xl border border-[#ffdad6] bg-[#fff5f5] px-4 py-3 text-sm text-[#93000a]">
          {fetchError}
        </div>
      )}

      {/* Loading skeleton */}
      {loadingList ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 animate-pulse">
              <div className="h-3 bg-[#f0eded] rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-[#f0eded] rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-[#f0eded] rounded w-full mb-1"></div>
              <div className="h-3 bg-[#f0eded] rounded w-4/5"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffdad9] mb-4">
            <Search className="w-7 h-7 text-[#8a4d4e]" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#1b1c1c]">
            {notes.length === 0 ? 'No summaries yet' : 'No results found'}
          </h3>
          <p className="mt-1 text-sm text-[#524343]">
            {notes.length === 0
              ? 'Generate your first summary from the Dashboard.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <HistoryCard
              key={note._id}
              note={note}
              onClick={() => handleCardClick(note._id)}
              loading={fetchingId === note._id}
            />
          ))}
        </div>
      )}
    </AppLayout>
  )
}

export default History
