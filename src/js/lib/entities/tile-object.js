import ActiveElement from '../models/active-element'

export default class TileObject extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.visible = true
        this.y -= this.height
    }

    update () {
        if (this.onScreen()) {
            const { world: { gravity } } = this.game
            if (this.onFloor) {
                this.force.y *= -0.5
            }
            else {
                this.force.y += this.force.y > 0
                    ? gravity
                    : gravity / 2
            }
            this.move()
            // this.force.x *= -0.5
        }
    }

    placeAt (x, y) {
        this.x = x
        this.y = y
        this.visible = true
    }

    restore () {
        const { x, y } = this.initialPosition
        this.placeAt(x, y)
    }
}
