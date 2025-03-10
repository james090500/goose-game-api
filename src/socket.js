import { Server } from 'socket.io'
import Player from './player.js'
import Egg from './egg.js'
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
    TIME: 'time',
    //Items
    EGG: 'egg'
}

export default (httpServer) => {
    // Generate Terrain
    console.log("Generating Terrain...")
    const terrainData = terrain.init();
    console.log("Done!")

    // Start Socket Server
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

    // All the players
    let players = new Map()

    // Items
    let eggs = []

    io.on(EVENTS.CONNECTION, (socket) => {
        //Send initial players
        console.log(`${socket.id} Joined the game`)

        //Send all the players
        socket.emit('all_players', [...players.values()])
        socket.emit(EVENTS.EGG, eggs)

        // New Player instance
        const player = new Player(socket)
        players.set(socket.id, player)
        socket.broadcast.emit('update', player);

        //Send player the terrain data
        socket.emit(EVENTS.WORLD, terrainData)

        //Ensure time is synced
        io.emit(EVENTS.TIME, worldTime)

        //Update players on move
        socket.on(EVENTS.MOVE, (data) => {
            player.setPosition(data)
            socket.broadcast.emit('update', player);
        })

        //Update players on move
        socket.on(EVENTS.ROTATION, (data) => {
            player.setRotation(data)
            socket.broadcast.emit('update', player);
        })

        socket.on(EVENTS.EGG, (data) => {
            const egg = new Egg(data)
            eggs.push(egg)

            socket.broadcast.emit(EVENTS.EGG, eggs)
        })

        //When a user disconnects
        socket.on(EVENTS.DISCONNECT, () => {
            players.delete(socket.id)
            socket.broadcast.emit('player_leave', socket.id);
            console.log(`${socket.id} Left the game`)
        })
    })

    return io
}
