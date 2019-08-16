import { GameEntity } from '../models'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Bridge extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        // collisionLayer
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            const expectedY = (this.y - element.height) + (this.height - 16)

            if (element.y >= expectedY && !element.jump) {
                element.y = expectedY
                element.force.y = 0
                element.fall = false
                element.onFloor = true
            }
            else if (element.force.y === 0) {
                element.force.y += 1
            }
        }
    }

    update () {
        if (this.onScreen()) {
            this.sprite.animate(this.activated && !this.dead
                ? this.animations.DOWN
                : this.animations.UP
            )
        }
    }
}
