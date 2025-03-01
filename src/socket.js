import { Server } from 'socket.io'
import Players from './player.js'

// Events
export const EVENTS = {
    //Connections
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    //Data
    MOVE: 'move',
    ROTATION: 'rotation',
    UPDATE: 'update',
    //World
    TIME: 'time'
}

export default (httpServer) => {
    const io = new Server(httpServer, {
        allowEIO3: true,
        cors: {
            origin: true,
            credentials: true,
        },
    })

    // Set the world time
    let worldTime = 6000;
    setInterval(() => {
        worldTime++
        if(worldTime > 24000) {
            worldTime = 1
        }
    }, 50)

    io.on(EVENTS.CONNECTION, (socket) => {
        //Add player
        Players.addPlayer(socket.id, socket.handshake.query.username)

        //Send initial players
        console.log(`${socket.id} Joined the game`)

        //Ensure time is synced
        io.emit(EVENTS.TIME, worldTime)

        //Update players on move
        socket.on(EVENTS.MOVE, (data) => {
            Players.updatePlayer(socket.id, { position: data })
        })

        //Update players on move
        socket.on(EVENTS.ROTATION, (data) => {
            Players.updatePlayer(socket.id, { rotation: data })
        })

        //When a user disconnects
        socket.on(EVENTS.DISCONNECT, () => {
            Players.removePlayer(socket.id)
            console.log(`${socket.id} Left the game`)
        })
    })

    return io
}
