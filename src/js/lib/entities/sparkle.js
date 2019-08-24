import { GameEntity } from '../models'

export default class Sparkle extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.width = 8
        this.height = 8
        this.visible = true
        this.solid = false
    }

    update () {
        this.sprite.animate(this.animations.SHINE)
        if (this.sprite.animFrame === 4) this.kill()
    }
}
