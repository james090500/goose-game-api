import { Server } from 'socket.io'

// Events
export const EVENTS = {
    //Connections
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    //Data
    MOVE: 'move',
    UPDATE: 'update'

}

const blocks = {}

export default (httpServer) => {
    const io = new Server(httpServer, {
        allowEIO3: true,
        cors: {
            origin: true,
            credentials: true,
        },
    })

    io.on(EVENTS.CONNECTION, (socket) => {
        blocks[socket.id] = {}

        //Send initial blocks
        console.log(`${socket.id} Joined the game`)
        io.emit(EVENTS.UPDATE, blocks)

        //Update blocks on move
        socket.on(EVENTS.MOVE, (data) => {
            blocks[socket.id].x = data.x
            blocks[socket.id].y = data.y

            io.emit(EVENTS.UPDATE, blocks)
        })

        //When a user disconnects
        socket.on(EVENTS.DISCONNECT, () => {
            delete blocks[socket.id]
            console.log(`${socket.id} Left the game`)
        })
    })

    return io
}