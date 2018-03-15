import { ENTITIES_TYPE, LAYERS, NON_COLLIDE_INDEX } from '../lib/constants'

export default class World {
    constructor (data) {
        const { layers, height, properties, width, tilesets, tilewidth } = data
        const { gravity, surfaceLevel } = properties

        this.width = parseInt(width)
        this.height = parseInt(height)
        this.gravity = parseFloat(gravity)
        this.surface = parseInt(surfaceLevel)
        this.spriteSize = parseInt(tilewidth)
        this.spriteCols = parseInt(tilesets[0].columns)
        this.renderOrder = []
        this.objects = []
        this.data = []

        layers.map(({name, data, objects}) => {
            this.renderOrder.push(name)
            if (data) {
                this.data[name] = [...Array(width).keys()].map(() => Array(height))
                let j = 0
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        this.data[name][x][y] = data[j]
                        j++
                    }
                }
            }
            else if (objects) {
                this.objects = this.objects.concat(objects)
            }
        })

        // create mask layer for shadows calculations
        // this.data.darks = [...Array(width).keys()].map(() => Array(height))
    }

    getPlayer () {
        return this.objects.find(({type}) => type === ENTITIES_TYPE.PLAYER)
    }

    getObjects () {
        return this.objects
    }

    inRange (x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height
    }

    get (l, x, y) {
        if (!this.inRange(x, y)) {
            return false
        }
        return this.data[l][x][y]
    }

    tileData (x, y) {
        return {
            x: this.spriteSize * x,
            y: this.spriteSize * y,
            width: this.spriteSize,
            height: this.spriteSize,
            type: this.get(LAYERS.MAIN, x, y),
            solid: this.isSolid(x, y)
        }
    }

    clearTile (x, y, layer) {
        if (this.inRange(x, y)) {
            this.data[layer][x][y] = null
        }
    }

    isSolid (x, y) {
        if (!this.inRange(x, y)) {
            return true
        }
        return this.data[LAYERS.MAIN][x][y] > NON_COLLIDE_INDEX
    }
}
