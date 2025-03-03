import noisePkg from 'noisejs'
const { Noise } = noisePkg

const lerp = (a, b, t) => {
	return a + (b - a) * t;
}

export default {
    init() {
        this.maxHeight = 0;
        this.seaHeight = 15

        this.worldSize = 1024;
        this.worldSegements = 16;

        this.worldNoise = new Noise(65536)
        this.biomeNoise = new Noise(65536)

        this.worldGen = this.generateWorld()
        this.worldTrees = this.generateTrees()

        return {
            maxHeight: this.maxHeight,
            seaHeight: this.seaHeight,
            terrain: this.worldGen,
            trees: this.worldTrees
        }

    },
    generateWorld() {
        const cordSize = this.worldSize / 2
        let terrainResult = [];

        for(let y = cordSize; y >= -cordSize; y -= this.worldSegements) {
            for(let x = -cordSize; x <= cordSize; x+= this.worldSegements) {
                const frequency = 10

                const nx = x / this.worldSize
                const ny = y / this.worldSize

                // Get Perlin noise value
                const noiseResult = this.worldNoise.perlin2(
                    frequency * (nx - 0.5),
                    frequency * (ny - 0.5)
                )

                // Normalize from [-1, 1] to [0, 1]
                let height = (noiseResult + 1) / 2
                height = height * 50

                // Set a max world height
                if(this.maxHeight < height) {
                    this.maxHeight = height
                }

                //Calculate height based on world height to ensure and island
                const distance =
                    1 - (1 - Math.pow(nx * 2, 2)) * (1 - Math.pow(ny * 2, 2))
                height *= lerp(height, 1 - distance, 1)

                // Set final position
                terrainResult.push(
                    x,
                    y,
                    height
                )
            }
        }

        return terrainResult;
    },
    generateTrees() {
        let trees = []
        const worldSize = this.worldSize

        for (let x = 0; x < worldSize; x++) {
            for (let z = 0; z < worldSize; z++) {
                const worldX = x - worldSize / 2 // Shifting 0 to 1023 into -512 to +512
                const worldZ = z - worldSize / 2 // Same for Z axis

                const frequency = 5000
                let nx = worldX / this.worldSize - 0.5
                let nz = worldZ / this.worldSize - 0.5

                // Get result
                let noiseResult = this.biomeNoise.perlin2(
                    frequency * nx,
                    frequency * nz
                )

                // Normalize from [-1, 1] to [0, 1]
                noiseResult = (noiseResult + 1) / 2

                if (noiseResult > 0.85) {
                    let y = this.getHeight(worldX, worldZ)
                    if (y > this.seaHeight) {
                        trees.push(worldX, y, worldZ)
                    }
                }
            }
        }

        return trees;
    },
    getHeight(x, z) {
        const worldSize = this.worldSize
        const segments = worldSize / 16
        const pos = this.worldGen

        // Convert world (x, z) to local grid space
        const halfSize = worldSize / 2
        const gridX = ((x + halfSize) / worldSize) * segments
        const gridZ = ((z + halfSize) / worldSize) * segments

        const x1 = Math.floor(gridX) // Bottom-left vertex in the grid
        const x2 = Math.min(x1 + 1, segments) // Right neighbor
        const z1 = Math.floor(gridZ) // Bottom-left vertex in the grid
        const z2 = Math.min(z1 + 1, segments) // Top neighbor

        const idx = (gx, gz) => (gz * (segments + 1) + gx) * 3
        const y11 = pos[idx(x1, z1) + 2] // Bottom-left vertex height
        const y12 = pos[idx(x1, z2) + 2] // Top-left vertex height
        const y21 = pos[idx(x2, z1) + 2] // Bottom-right vertex height
        const y22 = pos[idx(x2, z2) + 2] // Top-right vertex height

        //Interpolate in the x-direction (left-to-right):
        const r1 = y11 * (1 - (gridX - x1)) + y21 * (gridX - x1)
        const r2 = y12 * (1 - (gridX - x1)) + y22 * (gridX - x1)

        //Interpolate in the z-direction (bottom-to-top):
        return r1 * (1 - (gridZ - z1)) + r2 * (gridZ - z1)
    }
}
