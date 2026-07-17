import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { User, Mail, Lock, Eye, EyeOff, Google, ArrowRight, Check } from '../icons'
import { registerUser } from '../services/api'

const EMAIL_REGEX = /^\S+@\S+\.\S+$/

function SignUp() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [name,          setName]          = useState('')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // UI state
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')

  // -------------------------------------------------------------------------
  // Frontend validation
  // -------------------------------------------------------------------------
  const validate = () => {
    const next = {}

    if (!name.trim()) {
      next.name = 'Name is required'
    } else if (name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters'
    }

    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = 'Please enter a valid email'
    }

    if (!password) {
      next.password = 'Password is required'
    } else if (password.length < 8) {
      next.password = 'Password must be at least 8 characters'
    }

    if (!acceptedTerms) {
      next.terms = 'You must agree to the Terms & Privacy Policy to continue.'
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

    if (!validate()) return

    setLoading(true)
    try {
      // acceptedTerms is sent to the backend so it can enforce the rule
      // independently of the frontend check.
      const data = await registerUser(name.trim(), email.trim(), password, acceptedTerms)

      localStorage.setItem('user',      JSON.stringify({ _id: data._id, name: data.name, email: data.email }))
      localStorage.setItem('authToken', data.token)

      navigate('/dashboard')
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
  // Input class helper
  // -------------------------------------------------------------------------
  const inputClass = (field) =>
    `w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-[#1b1c1c] placeholder:text-[#857372]/60 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-[#93000a] focus:ring-[#93000a]/20 focus:border-[#93000a]'
        : 'border-[#d7c2c1] focus:ring-[#8a4d4e]/30 focus:border-[#8a4d4e]'
    }`

  return (
    <div className="min-h-screen flex">
      {/* ------------------------------------------------------------------ */}
      {/* Left panel - form                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 bg-[#fbf9f8] order-2 lg:order-1">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8a4d4e] text-white font-bold">
                N
              </div>
              <span className="font-display text-xl font-bold text-[#1b1c1c]">NoteLoom AI</span>
            </Link>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-[#1b1c1c]">Create your account</h2>
          <p className="mt-2 text-sm text-[#524343]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#8a4d4e] hover:underline">
              Log in
            </Link>
          </p>

          {/* Google — disabled until OAuth is implemented */}
          <button
            type="button"
            disabled
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#d7c2c1] bg-white px-5 py-2.5 text-sm font-medium text-[#1b1c1c] opacity-50 cursor-not-allowed"
          >
            <Google className="w-5 h-5" />
            Sign up with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e4e2e1]"></div>
            <span className="text-xs text-[#857372]">OR</span>
            <div className="h-px flex-1 bg-[#e4e2e1]"></div>
          </div>

          {/* API-level error */}
          {apiError && (
            <div className="mb-4 rounded-xl border border-[#ffdad6] bg-[#fff5f5] px-4 py-3 text-sm text-[#93000a]">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#524343] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#857372] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
                  className={inputClass('name')}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-[#93000a]">{errors.name}</p>}
            </div>

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
                  className={inputClass('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-[#93000a]">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#524343] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#857372] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-sm text-[#1b1c1c] placeholder:text-[#857372]/60 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-[#93000a] focus:ring-[#93000a]/20 focus:border-[#93000a]'
                      : 'border-[#d7c2c1] focus:ring-[#8a4d4e]/30 focus:border-[#8a4d4e]'
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#857372] hover:text-[#524343]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1.5 text-xs text-[#93000a]">{errors.password}</p>
              ) : (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className={`h-1 flex-1 rounded-full ${password.length >= 3 ? 'bg-[#8a4d4e]' : 'bg-[#e4e2e1]'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? 'bg-[#d48c8c]' : 'bg-[#e4e2e1]'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-[#8a4d4e]' : 'bg-[#e4e2e1]'}`}></div>
                </div>
              )}
            </div>

            {/* Terms & Privacy — mandatory checkbox */}
            <div>
              <label className="flex items-start gap-2 text-sm text-[#524343] cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked)
                    setErrors((p) => ({ ...p, terms: '' }))
                  }}
                  className={`mt-0.5 rounded focus:ring-[#8a4d4e]/30 ${
                    errors.terms
                      ? 'border-[#93000a] text-[#93000a]'
                      : 'border-[#d7c2c1] text-[#8a4d4e]'
                  }`}
                />
                <span>
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8a4d4e] underline"
                  >
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8a4d4e] underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 text-xs text-[#93000a]">{errors.terms}</p>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              type="submit"
              disabled={loading}
            >
              <ArrowRight className="w-4 h-4" />
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#857372]">
            Free forever plan · No credit card required
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right panel — unchanged                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6e3637] to-[#8a4d4e] relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-[#ffdad9] blur-3xl"></div>
          <div className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-[#d9e4ec] blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#8a4d4e] font-bold">
              N
            </div>
            <span className="font-display text-2xl font-bold text-white">NoteLoom AI</span>
          </Link>
          <h1 className="font-display text-4xl font-extrabold text-white leading-tight">
            Start summarizing smarter, not harder
          </h1>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            Join thousands of students and professionals who save hours every week with AI-powered note summarization.
          </p>
          <div className="mt-10 space-y-4">
            {[
              '10 free summaries every month',
              'No credit card required to start',
              'Access from any device, anywhere',
              'Upgrade or cancel anytime',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
