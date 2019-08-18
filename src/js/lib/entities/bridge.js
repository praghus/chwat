import { GameEntity } from '../models'

export default class Bridge extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
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
