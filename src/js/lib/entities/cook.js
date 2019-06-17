import Character from '../models/character'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Cook extends Character {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.animation = {x: 0, y: 0, w: 16, h: 48, frames: 10, fps: 8, loop: true}
    }

    collide (element) {
        if (element.type === ENTITIES_TYPE.PLAYER) {
            element.bounce()
        }
    }

    update () {
        if (this.onScreen()) {
            this.animate()
        }
    }
}
