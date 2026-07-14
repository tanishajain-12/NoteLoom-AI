const mongoose = require('mongoose')
const dns = require('dns')

// ─── DNS FIX ────────────────────────────────────────────────────────────────
// Node.js v18+ on Windows sometimes resolves to 127.0.0.1 as its DNS server,
// which has nothing listening on port 53. This causes ECONNREFUSED on every
// DNS lookup (including the SRV record required by mongodb+srv:// URIs) even
// though nslookup and browsers work fine (they use the Windows DNS stack).
//
// Fix: explicitly tell Node to use reliable public DNS servers before any
// network call is made. Google (8.8.8.8) and Cloudflare (1.1.1.1) both
// support SRV record lookups needed by the mongodb+srv scheme.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
// ────────────────────────────────────────────────────────────────────────────

/**
 * Connect to MongoDB Atlas.
 * Reads MONGO_URI from environment variables.
 * Exits the process on failure so the server does not silently start without a DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // force IPv4 — avoids IPv6 fallback delays on Windows
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
