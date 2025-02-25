import { Server } from 'socket.io'
import Blocks from './blocks.js'

// Events
export const EVENTS = {
    //Connections
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    //Data
    MOVE: 'move',
    ROTATION: 'rotation',
    UPDATE: 'update',
}

export default (httpServer) => {
    const io = new Server(httpServer, {
        allowEIO3: true,
        cors: {
            origin: true,
            credentials: true,
        },
    })

    io.on(EVENTS.CONNECTION, (socket) => {
        //Add block
        Blocks.addBlock(socket.id, socket.handshake.query.username)

        //Send initial blocks
        console.log(`${socket.id} Joined the game`)

        //Update blocks on move
        socket.on(EVENTS.MOVE, (data) => {
            Blocks.updateBlock(socket.id, { position: data })
        })

        //Update blocks on move
        socket.on(EVENTS.ROTATION, (data) => {
            Blocks.updateBlock(socket.id, { rotation: data })
        })

        //When a user disconnects
        socket.on(EVENTS.DISCONNECT, () => {
            Blocks.removeBlock(socket.id)
            console.log(`${socket.id} Left the game`)
        })
    })

    return io
}
