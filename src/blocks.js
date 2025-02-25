import { EVENTS } from './socket.js'
import { io } from './index.js'

let blocks = []

function sendBlocks() {
    io.emit(EVENTS.UPDATE, blocks)
}

export default {
    addBlock: (id, username) => {
        blocks.push({
            id,
            username,
            position: {
                x: 0,
                y: -100, // Hide the block below the ground
                z: 0,
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0,
            },
        })

        sendBlocks()
    },
    removeBlock: (id) => {
        blocks = blocks.filter((block) => block.id !== id)

        sendBlocks()
    },
    updateBlock: (id, data) => {
        let index = blocks.findIndex((block) => block.id === id)
        if (index !== -1) {
            blocks[index] = {
                ...blocks[index],
                ...data,
            }
        }

        sendBlocks()
    },
    getBlocks: () => {
        return blocks
    },
}
