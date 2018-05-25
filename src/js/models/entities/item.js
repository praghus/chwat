import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/entities'
import { INPUTS } from '../../lib/constants'

export default class Item extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.width = 16
        this.height = 16
        this.initialPosition = {
            x: this.x,
            y: this.y
        }
        this.types = {
            axe: {x: 64, y: 0},
            ball: {x: 64, y: 32},
            chopper: {x: 112, y: 32},
            cure: {x: 128, y: 0},
            coconuts: {x: 80, y: 48},
            coin: {x: 0, y: 48},
            crank: {x: 80, y: 32},
            crowbar: {x: 32, y: 0},
            flag: {x: 48, y: 16},
            flour: {x: 48, y: 48},
            glove: {x: 64, y: 48},
            hammer: {x: 16, y: 48},
            handle: {x: 144, y: 0},
            hay: {x: 96, y: 48},
            heavy_key: {x: 128, y: 16},
            key: {x: 16, y: 16},
            key_1: {x: 0, y: 0},
            knocker: {x: 32, y: 16},
            line: {x: 80, y: 0},
            medicine: {x: 128, y: 0},
            nails: {x: 96, y: 32},
            oiler: {x: 96, y: 16},
            pipe: {x: 112, y: 16},
            plank: {x: 48, y: 32},
            saw: {x: 96, y: 0},
            scissors: {x: 128, y: 32},
            scythe: {x: 16, y: 32},
            sheep: {x: 144, y: 32},
            spade: {x: 48, y: 0},
            stick: {x: 0, y: 16},
            stone: {x: 80, y: 16},
            sulfur: {x: 0, y: 32},
            tar: {x: 144, y: 16},
            tnt: {x: 16, y: 0},
            tools: {x: 32, y: 48},
            weight: {x: 112, y: 0},
            undefined: {x: 0, y: 0}
        }
        this.animation = Object.assign(
            this.types[this.properties.id] || this.types.undefined, {
                w: 16, h: 16, frames: 1, fps: 0, loop: false
            }
        )
    }

    collide (element) {
        const { input, player } = this._scene
        if (input[INPUTS.INPUT_ACTION] && element.type === ENTITIES_TYPE.PLAYER && this.visible) {
            player.getItem(this)
        }
    }

    update () {
        const { gravity } = this._scene.world
        if (this.onScreen()) {
            if (this.onFloor) this.force.y *= -0.5
            this.force.y += gravity
            this.move()
        }
    }

    placeAt (x, y) {
        this.x = x
        this.y = y
        this.visible = true
    }

    restore () {
        const { x, y } = this.initialPosition
        this.placeAt(x, y)
    }
}
