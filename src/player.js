class Player {
    constructor(socket) {
        this.id = socket.id
        this.username = socket.handshake.query.username
        this.position = {
            x: 0,
            y: -100, // Hide the player below the ground
            z: 0,
        },
        this.rotation = {
            x: 0,
            y: 0,
            z: 0,
        }
    }

    setPosition(data) {
        this.position = data
    }

    setRotation(data) {
        this.rotation = data
    }
}

export default Player;
