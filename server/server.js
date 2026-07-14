const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// Load environment variables immediately so other modules see them
dotenv.config()

const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const noteRoutes = require('./routes/noteRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')


// Connect to MongoDB Atlas
connectDB()

const app = express()

// ---------------------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------------------

// CORS — allow requests from the Vite dev server (and production origin)
const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // fallback
  process.env.CLIENT_URL,  // production origin via env
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl / Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS policy: origin ${origin} is not allowed`))
      }
    },
    credentials: true, // allow cookies to be sent cross-origin
  })
)

// Parse JSON and URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Parse cookies (needed for the HttpOnly JWT cookie)
app.use(cookieParser())

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ message: 'NoteSumm API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
// AI summarisation + history — mounted at /api so the router exposes
// POST /api/summarize, GET /api/history, GET /api/history/:id
app.use('/api', noteRoutes)

// ---------------------------------------------------------------------------
// Error Handling (must come after routes)
// ---------------------------------------------------------------------------
app.use(notFound)
app.use(errorHandler)

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})
