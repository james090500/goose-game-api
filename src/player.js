import { EVENTS } from './socket.js'
import { io } from './index.js'

let players = []

function sendPlayers() {
    io.emit(EVENTS.UPDATE, players)
}

export default {
    addPlayer: (id, username) => {
        players.push({
            id,
            username,
            position: {
                x: 0,
                y: -100, // Hide the player below the ground
                z: 0,
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0,
            },
        })

        sendPlayers()
    },
    removePlayer: (id) => {
        players = players.filter((player) => player.id !== id)

        sendPlayers()
    },
    updatePlayer: (id, data) => {
        let index = players.findIndex((player) => player.id === id)
        if (index !== -1) {
            players[index] = {
                ...players[index],
                ...data,
            }
        }

        sendPlayers()
    },
    getPlayers: () => {
        return players
    },
}
