import Entity from '../entity'
import { DIRECTIONS } from '../../lib/constants'

export default class Dust extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.width = 16
        this.height = 16
        this.animations = {
            RIGHT: {x: 0, y: 0, w: 16, h: 16, frames: 9, fps: 24, loop: false},
            LEFT: {x: 0, y: 16, w: 16, h: 16, frames: 9, fps: 24, loop: false}
        }
        this.animation = this.direction === DIRECTIONS.RIGHT ? this.animations.RIGHT : this.animations.LEFT
    }

    update () {
        if (!this.dead) {
            this.animate()
            if (this.animFrame === 8) {
                this.kill()
            }
        }
    }
}
