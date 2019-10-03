import { GameEntity } from '../models'

export default class Bridge extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
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
