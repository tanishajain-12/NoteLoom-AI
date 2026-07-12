const mongoose = require('mongoose')

/**
 * Connect to MongoDB Atlas.
 * Reads MONGO_URI from environment variables.
 * Exits the process on failure so the server does not silently start without a DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
