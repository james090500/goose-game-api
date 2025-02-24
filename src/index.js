// Libs
import express from 'express'
import http from 'http'
const app = express()
const port = 3000

// Start the server
const httpServer = http.createServer(app)
httpServer.listen(port, () => {
	console.log(`Listening on port ${port}`)
})

app.use('*', (_req, res) => res.send('woo'))

// SocketIO
import socket from './socket.js'
export const io = socket(httpServer)
