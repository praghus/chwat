import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE, TIMEOUTS } from '../../lib/constants'

export default class Catapult extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            this.trigger.activated = false
            this.trigger.dead = false
            element.onFloor = false
            element.force.y = -25

            if (!this.game.checkTimeout(TIMEOUTS.CATAPULT)) {
                this.game.startTimeout(TIMEOUTS.CATAPULT, () => {
                    this.activated = false
                    this.activator.placeAt(this.x - 48, this.y)
                })
            }
        }
    }

    update () {
        if (this.onScreen()) {
            this.animate(this.activated
                ? this.animations.DOWN
                : this.animations.UP
            )
        }
    }
}
