import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/Button'
import { Mail, Lock, Eye, EyeOff, Google, ArrowRight } from '../icons'
import { loginUser } from '../services/api'

// ---------------------------------------------------------------------------
// Email format regex — same pattern used by the backend validateMiddleware
// ---------------------------------------------------------------------------
const EMAIL_REGEX = /^\S+@\S+\.\S+$/

function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  // If the user was redirected here from a protected page, go back there after login
  const from = location.state?.from?.pathname || '/dashboard'
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // UI state
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})   // field-level validation messages
  const [apiError, setApiError] = useState('')    // server-returned error message

  // -------------------------------------------------------------------------
  // Frontend validation — runs before the network request
  // -------------------------------------------------------------------------
  const validate = () => {
    const next = {}

    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = 'Please enter a valid email'
    }

    if (!password) {
      next.password = 'Password is required'
    } else if (password.length < 6) {
      // Intentionally lenient here — backend enforces 8 chars on signup;
      // on login we only need to prevent empty/trivially-short submissions.
      next.password = 'Password must be at least 6 characters'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  // -------------------------------------------------------------------------
  // Submit handler
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) return   // block submit if frontend validation fails

    setLoading(true)
    try {
      const data = await loginUser(email.trim(), password)

      // Backend returns { _id, name, email, createdAt, token }
      // Store user info and token for the session
      localStorage.setItem('user',      JSON.stringify({ _id: data._id, name: data.name, email: data.email }))
      localStorage.setItem('authToken', data.token)

      // Go back to where they were trying to go, or /dashboard by default
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------------------
  // Shared input class builder
  // -------------------------------------------------------------------------
  const inputClass = (field, extra = '') =>
    `w-full rounded-xl border bg-white pl-10 ${extra} py-2.5 text-sm text-[#1b1c1c] placeholder:text-[#857372]/60 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-[#93000a] focus:ring-[#93000a]/20 focus:border-[#93000a]'
        : 'border-[#d7c2c1] focus:ring-[#8a4d4e]/30 focus:border-[#8a4d4e]'
    }`

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8a4d4e] to-[#6e3637] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-[#ffdad9] blur-3xl"></div>
          <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-[#d9e4ec] blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#8a4d4e] font-bold">
              N
            </div>
            <span className="font-display text-2xl font-bold text-white">NoteLoom AI</span>
          </Link>
          <h1 className="font-display text-4xl font-extrabold text-white leading-tight">
            Welcome back to your smarter study companion
          </h1>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            Log in to access your summaries, key points, action items, and quiz questions — all in one place.
          </p>
          <div className="mt-10 space-y-4">
            {['AI-powered summaries in seconds', 'Key points & action items extraction', 'Quiz generation from your notes'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 bg-[#fbf9f8]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8a4d4e] text-white font-bold">
                N
              </div>
              <span className="font-display text-xl font-bold text-[#1b1c1c]">NoteLoom AI</span>
            </Link>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-[#1b1c1c]">Log in</h2>
          <p className="mt-2 text-sm text-[#524343]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-[#8a4d4e] hover:underline">
              Sign up free
            </Link>
          </p>

          {/* Google button — UI only, disabled until OAuth is wired */}
          <button
            type="button"
            disabled
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#d7c2c1] bg-white px-5 py-2.5 text-sm font-medium text-[#1b1c1c] opacity-50 cursor-not-allowed"
          >
            <Google className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e4e2e1]"></div>
            <span className="text-xs text-[#857372]">OR</span>
            <div className="h-px flex-1 bg-[#e4e2e1]"></div>
          </div>

          {/* API-level error banner */}
          {apiError && (
            <div className="mb-4 rounded-xl border border-[#ffdad6] bg-[#fff5f5] px-4 py-3 text-sm text-[#93000a]">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#524343] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#857372] pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                  className={inputClass('email', 'pr-4')}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#93000a]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#524343]">Password</label>
                <button type="button" className="text-xs text-[#8a4d4e] hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#857372] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  className={inputClass('password', 'pr-10')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#857372] hover:text-[#524343]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#93000a]">{errors.password}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-[#524343]">
              <input type="checkbox" className="rounded border-[#d7c2c1] text-[#8a4d4e] focus:ring-[#8a4d4e]/30" />
              Remember me for 30 days
            </label>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'Log in'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#857372]">
            By logging in, you agree to our{' '}
            <Link to="/" className="underline">Terms</Link> and{' '}
            <Link to="/" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
