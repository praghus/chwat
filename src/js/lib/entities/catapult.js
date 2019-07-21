import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Catapult extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            element.y -= 8
            this.game.startTimeout('catapult_wait', 100, () => {
                element.force.y = -25
                element.onFloor = false
                element.jump = true
            })

            if (!this.game.checkTimeout('catapult')) {
                this.game.startTimeout('catapult', 1000, () => {
                    this.activated = false
                    this.trigger.activated = false
                    this.trigger.switched = false
                    this.addItem(
                        { produce: 'weight', produce_gid: 1128, produce_name: 'Weight' },
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
