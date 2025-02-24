import { EVENTS } from "./socket.js"
import { io } from "./index.js"

let blocks = []

export default {
    addBlock: (id) => {
        blocks.push({
            id,
            x: 0,
            y: 0,
            username: '',
        })
        io.emit(EVENTS.UPDATE, blocks)
    },
    removeBlock: (id) => {
        blocks = blocks.filter(block => block.id !== id)
        io.emit(EVENTS.UPDATE, blocks)
    },
    updateBlock: (id, data) => {
        let index = blocks.findIndex(block => block.id === id);
        if (index !== -1) {
            blocks[index] = {
                ...blocks[index],
                ...data,
            }
        }
        io.emit(EVENTS.UPDATE, blocks)
    },
    getBlocks: () => {
        return blocks
    }
}