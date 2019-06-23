import Character from '../models/character'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Dragon extends Character {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.animation = this.animations.HOVERING
        this.setBoundingBox(60, 108, this.width - 158, this.height - 140)
    }

    collide (element) {
        if (element.type === ENTITIES_TYPE.PLAYER) {
            element.force.x = -element.force.x * 2
        }
    }

    update () {
        if (this.onScreen()) {
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
