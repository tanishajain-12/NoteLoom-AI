import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import Textarea from '../components/Textarea'
import HistoryCard from '../components/HistoryCard'
import { mockStats } from '../data/mockData'
import { summarizeTranscript, getHistory } from '../services/api'
import { Sparkles, DocumentText, Clock, ChartBar, BookOpen, ArrowRight } from '../icons'

const iconMap = {
  document: DocumentText,
  clock: Clock,
  chart: ChartBar,
  book: BookOpen,
}

function Dashboard() {
  const navigate = useNavigate()
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentNotes, setRecentNotes] = useState([])
  const maxLength = 10000

  // Load the 3 most recent summaries for the "Recent Notes" section
  useEffect(() => {
    getHistory()
      .then((data) => {
        // Guard: ensure we always store an array even if the service layer
        // returns something unexpected (e.g. null, an object, or undefined).
        setRecentNotes(Array.isArray(data) ? data.slice(0, 3) : [])
      })
      .catch(() => {
        // Silently ignore — recent notes are non-critical
      })
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!transcript.trim()) return

    setLoading(true)
    setError('')

    try {
      const result = await summarizeTranscript(transcript.trim())
      // Pass the full API response to the Results page via navigation state
      navigate('/results', { state: { summary: result } })
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please check your connection and try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c]">
          Welcome back!
        </h2>
        <p className="mt-1.5 text-sm text-[#524343]">
          Paste a transcript below to generate a summary, key points, action items, and quiz questions.
        </p>
      </div>

      {/* Quick Stats — kept as static UI; no stats endpoint exists */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat) => {
          const Icon = iconMap[stat.icon]
          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffdad9]">
                  <Icon className="w-5 h-5 text-[#8a4d4e]" />
                </div>
              </div>
              <p className="font-display text-2xl font-extrabold text-[#1b1c1c]">{stat.value}</p>
              <p className="text-xs text-[#524343] mt-0.5">{stat.label}</p>
              <p className="text-xs text-[#8a4d4e] mt-1.5 font-medium">{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Transcript Input */}
      <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 sm:p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8a4d4e]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#1b1c1c]">Generate Summary</h3>
            <p className="text-xs text-[#857372]">Paste your lecture or meeting transcript</p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-[#ffdad6] bg-[#fff5f5] px-4 py-3 text-sm text-[#93000a]">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <Textarea
            placeholder="Paste your transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            maxLength={maxLength}
            className="min-h-[160px]"
            disabled={loading}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[#857372]">
              {transcript.length.toLocaleString()} / {maxLength.toLocaleString()} characters
            </span>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={transcript.trim().length === 0 || loading}
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Generating…' : 'Generate Summary'}
            </Button>
          </div>
        </form>
      </div>

      {/* Recent Notes — live from GET /api/history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-[#1b1c1c]">Recent Notes</h3>
          <Button variant="ghost" size="sm" to="/history">
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {recentNotes.length === 0 ? (
          <p className="text-sm text-[#857372]">
            No summaries yet. Paste a transcript above to get started.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <HistoryCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default Dashboard
