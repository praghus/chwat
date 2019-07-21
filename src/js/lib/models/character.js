import { Entity } from 'tiled-platformer-lib'
import { DIRECTIONS, ENTITIES_TYPE, LAYERS } from '../../lib/constants'

export default class Character extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.visible = true
    }

    draw () {
        if (this.onScreen()) {
            super.draw()
            const { debug, overlay } = this.game
            this.hint && overlay.addHint(this)
            debug && overlay.displayDebug(this)
        }
    }

    showHint (item) {
        if (!this.game.checkTimeout('hint')) {
            this.hint = item.gid
            this.game.startTimeout('hint', 2000, () => this.hideHint())
        }
    }

    hideHint () {
        this.hint = null
    }

    bounce () {
        this.direction = this.direction === DIRECTIONS.RIGHT
            ? DIRECTIONS.LEFT
            : DIRECTIONS.RIGHT
        this.force.x *= -1
    }

    addDust (direction) {
        if (!this.onFloor) return
        const { world } = this.game
        world.addObject({
            type: ENTITIES_TYPE.DUST,
            visible: true,
            x: direction === DIRECTIONS.RIGHT
                ? this.x - 4
                : this.x + this.width - 8,
            y: this.y + this.height - 16,
            direction
        }, LAYERS.OBJECTS)
    }
}
