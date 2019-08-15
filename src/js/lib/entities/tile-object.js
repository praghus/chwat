import { GameEntity } from '../models'

export default class TileObject extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.visible = true
        this.y -= obj.height
        // this.shadowCaster = true
    }

    update () {
        if (this.onScreen()) {
            const { scene: { gravity } } = this.game
            if (this.onFloor) {
                this.force.y = 0
            }
            this.force.y += this.force.y > 0
                ? gravity
                : gravity / 2
            this.move()
        }
    }

    placeAt (x, y) {
        this.x = x
        this.y = y
        this.force.y = 1
        this.onFloor = false
        this.visible = true
    }

    restore () {
        const { x, y } = this.initialPosition
        this.placeAt(x, y)
    }
}
