import '../lib/illuminated'
import { COLORS, ENTITIES_TYPE, LIGHTS, getEntityByType } from '../lib/constants'
import { overlap } from '../lib/helpers'

const { Lamp, Vec2 } = window.illuminated

export default class Elements {
    constructor (entities, scene) {
        this._scene = scene
        this.objects = []
        this.lights = {
            [LIGHTS.PLAYER_LIGHT]: new Lamp({
                position: new Vec2(0, 0),
                color: COLORS.PLAYER_LIGHT,
                distance: 96,
                samples: 1,
                radius: 8
            })
        }
        for (let i = 0; i < entities.length; i++) {
            this.add(entities[i])
        }
    }

    update () {
        const { player } = this._scene
        this.objects.forEach((obj, i) => {
            if (obj) {
                if (obj.dead) {
                    this.objects[i] = this.objects[this.objects.length - 1]
                    this.objects.length--
                }
                else {
                    obj.update()
                    obj.overlapTest(player)
                    for (let k = i + 1; k < this.objects.length; k++) {
                        this.objects[i].overlapTest(this.objects[k])
                    }
                }
            }
        })
    }

    create (obj) {
        const { type, family } = obj
        const entity = getEntityByType(type)
        if (entity) {
            const Model = entity.model
            return new Model(Object.assign({family}, obj, entity), this._scene)
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
            this.add(Object.assign({}, {type: ENTITIES_TYPE.PARTICLE}, props))
        }
    }
}
