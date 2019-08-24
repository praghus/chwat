import { GameEntity } from '../models'

export default class Ship extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.visible = false
        this.activated = false
        this.y -= obj.height
        this.collisionMask = this.sprite.getCollisionMask(this.x, this.y)[0]
        this.counter = 0
        this.direction = 1
        this.increase = this.increase.bind(this)
    }

    update () {
        // this.onScreen()
        //     ? this.game.startTimeout('ship', 200, this.increase)
        //     : this.game.stopTimeout('ship')
    }

    increase () {
        const increase = Math.PI * 2 / 10
        this.y += this.direction > 0
            ? -(Math.sin(this.counter) / 2 + 0.5)
            : Math.sin(this.counter) / 2 + 0.5

        if (this.counter > Math.PI) {
            this.counter = 0
            this.direction *= -1
        }
        this.counter += increase
    }
}
