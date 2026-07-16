import { Routes, Route } from 'react-router-dom'

// Pages
import Landing          from './pages/Landing'
import Login            from './pages/Login'
import SignUp           from './pages/SignUp'
import Dashboard        from './pages/Dashboard'
import Results          from './pages/Results'
import History          from './pages/History'
import Profile          from './pages/Profile'
import Settings         from './pages/Settings'
import TermsPlaceholder from './pages/TermsPlaceholder'

// Route guards
import PrivateRoute from './components/PrivateRoute'
import PublicRoute  from './components/PublicRoute'

function App() {
  return (
    <Routes>
      {/* ------------------------------------------------------------------ */}
      {/* Public — no auth required                                           */}
      {/* ------------------------------------------------------------------ */}
      <Route path="/" element={<Landing />} />

      {/* Terms / Privacy placeholder pages linked from the Signup form */}
      <Route path="/terms"   element={<TermsPlaceholder title="Terms of Service" />} />
      <Route path="/privacy" element={<TermsPlaceholder title="Privacy Policy" />} />

      {/* ------------------------------------------------------------------ */}
      {/* Public-only — authenticated users are bounced to /dashboard         */}
      {/* ------------------------------------------------------------------ */}
      <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

      {/* ------------------------------------------------------------------ */}
      {/* Private — unauthenticated users are redirected to /login            */}
      {/* ------------------------------------------------------------------ */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/results"   element={<PrivateRoute><Results   /></PrivateRoute>} />
      <Route path="/history"   element={<PrivateRoute><History   /></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute><Profile   /></PrivateRoute>} />

      {/* Settings is also inside the app shell — protect it too */}
      <Route path="/settings"  element={<PrivateRoute><Settings  /></PrivateRoute>} />
    </Routes>
  )
}

export default App
