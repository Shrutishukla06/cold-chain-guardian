require('dotenv').config({ quiet: true })

const app = require('./app')
const { connectDatabase, disconnectDatabase } = require('./config/db')

const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI = process.env.MONGODB_URI

// Start the HTTP server first so /api/health stays reachable even when
// MongoDB is unavailable. The connection state is reported by the route.
const server = app.listen(PORT, () => {
  console.log(`[server] Cold-Chain Guardian API listening on http://localhost:${PORT}`)
})

connectDatabase(MONGODB_URI)

// Close the HTTP server and database cleanly when the process is stopped.
async function shutdown(signal) {
  console.log(`[server] Received ${signal}. Shutting down...`)
  server.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
