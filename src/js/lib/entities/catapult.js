import { GameEntity } from '../models'
import { ENTITIES_TYPE, ITEMS_TYPE } from '../../lib/constants'

export default class Catapult extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = true
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            element.y -= 8
            this.startTimeout('catapult_wait', 100, () => {
                element.force.y = -19
                element.onGround = false
                element.jump = true
            })

            if (!this.checkTimeout('catapult')) {
                this.startTimeout('catapult', 1000, () => {
                    this.activated = false
                    this.trigger.activated = false
                    this.trigger.switched = false
                    this.addItem(ITEMS_TYPE.WEIGHT, this.x - 16, this.y + 16)
                })
            }
        }
    }

    update (scene) {
        if (scene.onScreen(this)) {
            this.sprite.animate(this.activated
                ? this.animations.DOWN
                : this.animations.UP
            )
            super.update(scene)
        }
    }
}
