import { GameEntity } from '../models'

export default class Bridge extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = true
    }

    update (scene) {
        if (scene.onScreen(this)) {
            this.sprite.animate(this.activated && !this.dead
                ? this.animations.DOWN
                : this.animations.UP
            )
        }
    }
}
