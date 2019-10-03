import { GameEntity } from '../models'
import { ENTITIES_TYPE, ITEMS_TYPE } from '../../lib/constants'

export default class Catapult extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            element.y -= 8
            this.scene.startTimeout('catapult_wait', 100, () => {
                element.force.y = -20
                element.onGround = false
                element.jump = true
            })

            if (!this.scene.checkTimeout('catapult')) {
                this.scene.startTimeout('catapult', 1000, () => {
                    this.activated = false
                    this.trigger.activated = false
                    this.trigger.switched = false
                    this.addItem(ITEMS_TYPE.WEIGHT, this.x - 16, this.y + 16)
                })
            }
        }
    }

    update () {
        if (this.onScreen()) {
            this.sprite.animate(this.activated
                ? this.animations.DOWN
                : this.animations.UP
            )
        }
    }
}
