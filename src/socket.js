import { Server } from 'socket.io'
import players from './player.js'
import terrain from './terrain.js'

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
    WORLD: 'world',
    TIME: 'time'
}

export default (httpServer) => {
    console.log("Generating Terrain...")
    const terrainData = terrain.init();
    console.log("Done!")

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
        //Send initial players
        console.log(`${socket.id} Joined the game`)

        //Send player the terrain data
        socket.emit(EVENTS.WORLD, terrainData)

        //Add player
        players.addPlayer(socket.id, socket.handshake.query.username)


        //Ensure time is synced
        io.emit(EVENTS.TIME, worldTime)

        //Update players on move
        socket.on(EVENTS.MOVE, (data) => {
            players.updatePlayer(socket.id, { position: data })
        })

        //Update players on move
        socket.on(EVENTS.ROTATION, (data) => {
            players.updatePlayer(socket.id, { rotation: data })
        })

        //When a user disconnects
        socket.on(EVENTS.DISCONNECT, () => {
            players.removePlayer(socket.id)
            console.log(`${socket.id} Left the game`)
        })
    })

    return io
}
