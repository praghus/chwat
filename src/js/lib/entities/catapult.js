import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE, TIMEOUTS } from '../../lib/constants'

export default class Catapult extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            element.y -= 8
            this.game.startTimeout({ name: 'catapult_wait', duration: 100}, () => {
                element.force.y = -25
                element.onFloor = false
                element.jump = true
            })

            if (!this.game.checkTimeout(TIMEOUTS.CATAPULT)) {
                this.game.startTimeout(TIMEOUTS.CATAPULT, () => {
                    this.activated = false
                    this.trigger.activated = false
                    this.trigger.switched = false
                    this.addItem(
                        {produce: 'weight', produce_gid: 1128, produce_name: 'Weight'},
                        this.x - 16, this.y + 16
                    )
                    // this.activator.placeAt(this.x - 48, this.y)
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
