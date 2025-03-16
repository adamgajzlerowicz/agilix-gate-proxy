const http = require('http')
const express = require('express')
const WebSocket = require('ws')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({server})

const deviceUrl = 'ws://192.168.1.99/timerws'
const deviceSocket = new WebSocket(deviceUrl)
const browserClients = new Set()

deviceSocket.on('message', msg => {
    for (const client of browserClients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg)
        }
    }
})

deviceSocket.on("connection", () => {
    console.log('Gate connected')
})

deviceSocket.on("close", () => {
    console.log('Gate disconnected')
})

wss.on('connection', browserSocket => {
    console.log('Browser connected')
    browserClients.add(browserSocket)

    browserSocket.on('message', msg => {
        if (deviceSocket.readyState === WebSocket.OPEN) {
            deviceSocket.send(msg)
        }
    })

    browserSocket.on('close', () => {
        console.log('Browser disconnected')
        browserClients.delete(browserSocket)
        if (!browserClients.size && deviceSocket.readyState === WebSocket.OPEN) {
            deviceSocket.close()
        }
    })
})

server.listen(4326, () => console.log('Proxy server on port 4326'))
