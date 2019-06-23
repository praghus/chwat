import Character from '../models/character'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Cook extends Character {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.animation = this.animations.STANDING
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
