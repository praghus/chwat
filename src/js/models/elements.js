import { ENTITIES_TYPE } from '../lib/entities'
import { COLORS, LIGHTS } from '../lib/constants'
import { createLamp, getEntityByType, overlap } from '../lib/helpers'

export default class Elements {
    constructor (entities, scene) {
        this._scene = scene
        this.objects = []
        this.objectsPool = {}
        this.lights = {
            [LIGHTS.PLAYER_LIGHT]: createLamp(0, 0, 96, COLORS.PLAYER_LIGHT)
        }
        entities.map((entity) => this.add(entity))
    }

    update () {
        const { player } = this._scene
        this.objects.map((obj, index) => {
            if (obj) {
                if (obj.dead) {
                    // create objectsPool to reduce garbage collection and stuttering
                    if (!this.objectsPool[obj.type]) {
                        this.objectsPool[obj.type] = []
                    }
                    this.objectsPool[obj.type].push(obj)
                    this.objects.splice(index, 1)
                }
                else {
                    obj.update && obj.update()
                    obj.overlapTest(player)
                    for (let k = index + 1; k < this.objects.length; k++) {
                        this.objects[index].overlapTest(this.objects[k])
                    }
                }
            }
        })
    }

    create (obj) {
        const { type, family } = obj
        const entity = getEntityByType(type)
        if (entity) {
            // first check if there are some objects of the same type in objectsPool
            if (this.objectsPool[obj.type] && this.objectsPool[obj.type].length) {
                const storedObj = this.objectsPool[obj.type].pop()
                storedObj.restore()
                Object.keys(obj).map((prop) => {
                    storedObj[prop] = obj[prop]
                })
                return storedObj
            }
            else {
                const Model = entity.model
                return new Model(Object.assign({family}, obj, entity), this._scene)
            }
        }
        return null
    }

    getLight (id) {
        return this.lights[id] || null
    }

    add (obj) {
        const entity = this.create(obj)
        if (entity) {
            this.objects.push(entity)
        }
    }

    getById (id) {
        return this.objects.find((obj) => obj.id === id)
    }

    getByProperties (key, value) {
        return this.objects.find(({properties}) => properties && properties[key] === value)
    }

    clearInRange (rect) {
        const { objects } = this
        objects.map((obj) => {
            if (
                overlap(obj, rect) && !obj.dead &&
                obj.type !== ENTITIES_TYPE.BALLOON &&
                obj.type !== ENTITIES_TYPE.TRIGGER &&
                obj.type !== ENTITIES_TYPE.WATER &&
                obj.type !== ENTITIES_TYPE.ITEM
            ) {
                obj.kill()
            }
        })
    }

    emitParticles (count, properties) {
        const particle_count = count || 1
        for (let i = 0; i < particle_count; i++) {
            const props = Object.assign({}, properties)
            props.x = properties.x + Math.random() * 8
            this.add(Object.assign({}, {
                type: ENTITIES_TYPE.PARTICLE
            }, props))
        }
    }
}
