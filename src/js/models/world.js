import { ENTITIES_TYPE } from '../lib/entities'
import { LAYERS, NON_COLLIDE_INDEX } from '../lib/constants'
import { canJumpThrough, createRectangleObject, isMobileDevice } from '../lib/helpers'

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
        this.shouldCreateLightmask = !isMobileDevice()
        this.modifiers = []
        this.renderOrder = []
        this.objects = []
        this.lightmask = []
        this.layers = {}

        layers.map(({name, data, objects}) => {
            this.renderOrder.push(name)
            if (data) {
                this.layers[name] = [...Array(width).keys()].map(() => Array(height))
                if (this.shouldCreateLightmask && name === LAYERS.MAIN) {
                    this.lightmask = [...Array(width).keys()].map(() => Array(height))
                }
                let j = 0
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const tile = data[j]
                        this.layers[name][x][y] = tile
                        if (this.shouldCreateLightmask && name === LAYERS.MAIN) {
                            this.lightmask[x][y] = tile > 0
                                ? createRectangleObject(x, y, this.spriteSize, this.spriteSize)
                                : null
                        }
                        j++
                    }
                }
            }
            else if (objects) {
                this.objects = this.objects.concat(objects)
            }
        })
    }

    getPlayer () {
        return this.objects.find(({type}) => type === ENTITIES_TYPE.PLAYER)
    }

    setObjects (objects) {
        this.objects = objects
    }

    getObjects () {
        // todo: make it better
        const byType = (a, b) => {
            if (
                a.type === ENTITIES_TYPE.ROCK ||
                a.type === ENTITIES_TYPE.SWITCH ||
                a.type === ENTITIES_TYPE.TRIGGER
            ) return 1
            if (a.type === ENTITIES_TYPE.ITEM) return -1
            if (a.type < b.type) return -1
            if (a.type > b.type) return 1
            return 0
        }
        return this.objects.sort(byType).filter(({type}) => type !== ENTITIES_TYPE.PLAYER)
    }

    inRange (x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height
    }

    get (layer, x, y) {
        return this.inRange(x, y) && this.layers[layer][x][y]
    }

    put (layer, x, y, value) {
        if (!this.inRange(x, y)) return false
        this.modifiers.push({layer, x, y, value})
        this.layers[layer][x][y] = value
        if (layer === LAYERS.MAIN && value > 0) {
            this.lightmask[x][y] = createRectangleObject(x, y, this.spriteSize, this.spriteSize)
        }
    }

    tileData (x, y) {
        const type = this.get(LAYERS.MAIN, x, y)
        return {
            type,
            x: this.spriteSize * x,
            y: this.spriteSize * y,
            width: this.spriteSize,
            height: this.spriteSize,
            solid: this.isSolid(x, y),
            jumpThrough: canJumpThrough(type)
        }
    }

    clearTile (x, y, layer) {
        if (this.inRange(x, y)) {
            this.layers[layer][x][y] = null
            this.modifiers.push({layer, x, y, value: null})
        }
    }

    isSolid (x, y) {
        return !this.inRange(x, y) || (
            this.layers[LAYERS.MAIN][x][y] > NON_COLLIDE_INDEX ||
            canJumpThrough(this.layers[LAYERS.MAIN][x][y])
        )
    }

    getLightmask (x, y) {
        return this.inRange(x, y) && this.lightmask[x][y]
    }
}
