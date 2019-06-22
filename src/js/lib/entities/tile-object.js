import ActiveElement from '../models/active-element'

export default class TileObject extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.visible = true
        this.y -= this.height
        this.initialPosition = {
            x: this.x,
            y: this.y
        }
    }

    update () {
        if (this.onScreen()) {
            const { gravity } = this.game.world
            if (this.onFloor) this.force.y *= -0.5
            this.force.y += gravity
            this.move()
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
