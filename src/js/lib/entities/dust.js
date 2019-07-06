import ActiveElement from '../models/active-element'
import { DIRECTIONS } from '../../lib/constants'

export default class Dust extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.width = 16
        this.height = 16
    }

    update () {
        if (!this.dead) {
            this.animation = this.direction === DIRECTIONS.RIGHT
                ? this.animations.RIGHT
                : this.animations.LEFT

            this.animate()

            if (this.animFrame === 8) {
                this.kill()
            }
        }
    }
}
