import Entity from '../entity'
import { ENTITIES_TYPE, FONTS, INPUTS } from '../../lib/constants'

export default class Item extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.width = 16
        this.height = 16
        this.types = {
            key: {x: 16, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            key_1: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            knocker: {x: 32, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            tnt: {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            crowbar: {x: 32, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            spade: {x: 48, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            axe: {x: 64, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            line: {x: 80, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            cake: {x: 96, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            weight: {x: 112, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            cure: {x: 128, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            handle: {x: 144, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            stick: {x: 0, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            undefined: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.types[this.properties.id] || this.types.undefined
    }

    draw (ctx) {
        if (this.onScreen()) {
            const { camera, fontPrint } = this._scene
            const font = FONTS.FONT_SMALL
            super.draw(ctx)
            fontPrint(this.name,
                this.x + camera.x + 8 - ((this.name.length / 2) * font.size),
                this.y + camera.y - 8,
                font
            )
        }
    }

    collide (element) {
        const { input, player } = this._scene
        if (input[INPUTS.INPUT_ACTION] && element.type === ENTITIES_TYPE.PLAYER && !this.dead) {
            player.getItem(this)
        }
    }

    update () {
        const { gravity } = this._scene.world
        if (this.onScreen()) {
            this.force.y += gravity
            this.move()
        }
    }
}
