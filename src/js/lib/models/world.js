import { NODE_TYPE, TILE_TYPE } from '../constants'
import { isValidArray, getFilename } from '../utils/helpers'
import Tile from './tile'

export default class World {
    constructor (data, entities, game) {
        const {
            layers,
            height,
            properties,
            width,
            tilesets,
            tilewidth
        } = data

        this.entities = entities
        this.game = game
        this.layers = []
        this.activeObjects = []
        this.objectsPool = {}
        this.tiles = {}
        this.properties = properties

        // properties
        this.width = width
        this.height = height
        this.spriteSize = tilewidth
        this.tilesets = tilesets
        this.gravity = this.properties.gravity || 1

        layers.map(({ id, name, data, objects, type, visible, properties }) => {
            const layer = { id, name, type, visible, properties }
            if (data) {
                layer.data = [...Array(width).keys()].map(() => Array(height))
                let j = 0
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const tileId = data[j]
                        this.createTile(tileId)
                        layer.data[x][y] = tileId
                        j++
                    }
                }
            }
            else if (objects) {
                layer.objects = []
                objects.map((obj) => {
                    const entity = this.createObject(obj, layer.id)
                    entity && layer.objects.push(entity)
                })
            }
            this.layers.push(layer)
        })
    }

    update () {
        this.activeObjects = []
        this.getObjectLayers().map((layer) => {
            layer.objects.map((obj) => {
                if (!obj.dead) {
                    if (obj.onScreen() || obj.activated) {
                        if (this.isCollisionLayer(layer)) {
                            this.activeObjects.map((activeObj) => obj.overlapTest(activeObj))
                        }
                        obj.update && obj.update()
                        this.activeObjects.push(obj)
                    }
                }
                else this.removeObject(obj)
            })
        })
    }

    draw () {
        this.layers.map((layer) => {
            if (layer.visible) {
                switch (layer.type) {
                case NODE_TYPE.LAYER:
                    this.renderTileLayer(layer.id)
                    break
                case NODE_TYPE.OBJECT_GROUP:
                    layer.objects.map((obj) => obj.draw())
                    break
                }
                // @todo: handle image layer
            }
            else if (typeof layer === 'function') {
                layer()
            }
        })
    }

    renderTileLayer (layerId) {
        const { spriteSize } = this
        const {
            ctx,
            camera,
            debug,
            props: {
                viewport: {
                    resolutionX,
                    resolutionY
                }
            }
        } = this.game

        let y = Math.floor(camera.y % spriteSize)
        let _y = Math.floor(-camera.y / spriteSize)

        while (y < resolutionY) {
            let x = Math.floor(camera.x % spriteSize)
            let _x = Math.floor(-camera.x / spriteSize)
            while (x < resolutionX) {
                const tile = this.getTile(_x, _y, layerId)
                if (tile > 0) this.tiles[tile].draw(ctx, x, y, {debug})
                x += spriteSize
                _x++
            }
            y += spriteSize
            _y++
        }
    }

    addLayer (layer, index) {
        this.layers.splice(index, 0, layer)
    }

    removeLayer (index) {
        this.layers.splice(index, 1)
    }

    showLayer (layerId) {
        this.getLayer(layerId).visible = true
    }

    hideLayer (layerId) {
        this.getLayer(layerId).visible = false
    }

    createObject (obj, layerId) {
        try {
            const entity = this.entities.filter(({type}) => type === obj.type)[0] || null
            if (entity) {
                // first check if there are some objects of the same type in objectsPool
                if (isValidArray(this.objectsPool[obj.type])) {
                    const storedObj = this.objectsPool[obj.type].pop()
                    storedObj.restore()
                    Object.keys(obj).map((prop) => {
                        storedObj[prop] = obj[prop]
                    })
                    return storedObj
                }
                else {
                    const Entity = entity.model
                    return new Entity({ layerId, ...obj, ...entity }, this.game)
                }
            }
            return null
        }
        catch (e) {
            throw (e)
        }
    }

    createTile (tileId) {
        const { props: { assets } } = this.game
        const tileset = this.getTileset(tileId)
        if (!this.tiles[tileId] && tileset) {
            const filename = getFilename(tileset.image.source)
            this.tiles[tileId] = new Tile(tileId, assets[filename], tileset)
        }
        return this.tiles[tileId] || null
    }

    addObject (obj, layerId) {
        const entity = this.createObject(obj, layerId)
        entity && this.getObjects(layerId).push(entity)
    }

    removeObject (obj) {
        const { layerId, type } = obj
        const objectLayer = this.getObjects(layerId)
        // move deleted object to objectsPool
        // to reduce garbage collection and stuttering
        if (!this.objectsPool[type]) {
            this.objectsPool[type] = []
        }
        this.objectsPool[type].push(obj)
        objectLayer.splice(objectLayer.indexOf(obj), 1)
    }

    getProperty (name) {
        return this.properties && this.properties[name]
    }

    getObjects (layerId) {
        return this.getLayer(layerId).objects
    }

    getObjectById (id, layerId) {
        return this.getObjects(layerId).find((object) => object.id === id)
    }

    getObjectByType (type, layerId) {
        return this.getObjects(layerId).find((object) => object.type === type)
    }

    getObjectByProperty (key, value, layerId) {
        return this.getObjects(layerId).find(({properties}) => properties && properties[key] === value)
    }

    getObjectLayers () {
        return this.layers.filter((layer) => isValidArray(layer.objects))
    }

    inRange (x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height
    }

    getLayer (id) {
        return this.layers.find((layer) => layer.id === id)
    }

    getTile (x, y, layerId) {
        return this.inRange(x, y) && this.getLayer(layerId).data[x][y]
    }

    getTileset (tile) {
        return this.tilesets.find(
            ({firstgid, tilecount}) => tile + 1 >= firstgid && tile + 1 <= firstgid + tilecount
        )
    }

    putTile (x, y, value, layerId) {
        if (!this.inRange(x, y)) return false
        this.getLayer(layerId).data[x][y] = value
    }

    isSolidTile (tile) {
        return tile > 0 && this.tiles[tile] && this.tiles[tile].type !== TILE_TYPE.NON_COLLIDING
    }

    isSolidArea (x, y) {
        return !this.inRange(x, y) || !!this.getTilledCollisionLayers().map(
            (layer) => this.isSolidTile(layer.data[x][y])
        ).find((isTrue) => !!isTrue)
    }

    getSolidTile (x, y) {
        return !this.inRange(x, y) || this.getTilledCollisionLayers().map(
            (layer) => this.isSolidTile(layer.data[x][y]) && this.tiles[layer.data[x][y]]
        )[0] || null
    }

    isCollisionLayer (layer) {
        const { properties } = layer
        return properties ? !!properties.collide : false
    }

    getTilledCollisionLayers () {
        return this.layers.filter(
            (layer) => layer.type === 'layer' && this.isCollisionLayer(layer)
        ) || []
    }

    clearTile (x, y, layerId) {
        if (this.inRange(x, y)) {
            this.getLayer(layerId).data[x][y] = null
        }
    }
}
