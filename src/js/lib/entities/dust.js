import { GameEntity } from '../models'
import { DIRECTIONS } from '../../lib/constants'

export default class Dust extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.width = 16
        this.height = 16
    }

    update () {
        if (!this.dead) {
            this.sprite.animate(
                this.direction === DIRECTIONS.RIGHT
                    ? this.animations.RIGHT
                    : this.animations.LEFT
            )

            if (this.sprite.animFrame === 8) {
                this.kill()
            }
        }
    }
}
