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
            axe: {x: 64, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            ball: {x: 64, y: 32, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            chopper: {x: 112, y: 32, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            cure: {x: 128, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            coin: {x: 0, y: 48, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            crank: {x: 80, y: 32, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            crowbar: {x: 32, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            flour: {x: 48, y: 48, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            hammer: {x: 16, y: 48, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            handle: {x: 144, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            heavy_key: {x: 128, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            key: {x: 16, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            key_1: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            knocker: {x: 32, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            line: {x: 80, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            medicine: {x: 128, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            nails: {x: 96, y: 32, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            oiler: {x: 96, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            pipe: {x: 112, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            plank: {x: 48, y: 32, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            scythe: {x: 16, y: 32, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            spade: {x: 48, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            stick: {x: 0, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            stone: {x: 80, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            sulfur: {x: 0, y: 32, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            tar: {x: 144, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            tnt: {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            tools: {x: 32, y: 48, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            weight: {x: 112, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            undefined: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.types[this.properties.id] || this.types.undefined
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
