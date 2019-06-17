import Character from '../models/character'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Cook extends Character {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.animation = {x: 0, y: 0, w: 256, h: 256, frames: 10, fps: 8, loop: true}
        this.bounds = {
            x: 60,
            y: 108,
            width: this.width - 158,
            height: this.height - 140
        }
    }

    collide (element) {
        if (element.type === ENTITIES_TYPE.PLAYER) {
            element.force.x = -element.force.x * 2
        }
    }

    update () {
        if (this.onScreen()) {
            this.animate()
            if (this.activated) {
                if (this.y > -128) {
                    this.y -= 1
                    this.x -= 1
                }
                else this.kill()
            }
        }
    }
}
