import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE, INPUTS } from '../../lib/constants'

export default class Item extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.width = 16
        this.height = 16
        this.solid = true
        this.y -= this.height
        this.initialPosition = {
            x: this.x,
            y: this.y
        }
    }

    collide (element) {
        const { props: { input }, player } = this.game
        if (
            input.keyPressed[INPUTS.INPUT_ACTION] &&
            element.type === ENTITIES_TYPE.PLAYER &&
            this.visible
        ) {
            player.getItem(this)
        }
    }

    update () {
        const { gravity } = this.game.world
        if (this.onScreen()) {
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
