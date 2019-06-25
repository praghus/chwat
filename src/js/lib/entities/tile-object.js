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
            if (this.onFloor) this.force.y *= -0.5
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
