import { Entity } from 'tiled-platformer-lib'
import { getItemById, randomInt } from '../utils/helpers'
import { DIRECTIONS, ENTITIES_TYPE, LAYERS } from '../constants'

export default class GameEntity extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.visible = true
        this.showMessage = this.showMessage.bind(this)
        this.hideHint = this.hideHint.bind(this)
        this.hideMessage = this.hideMessage.bind(this)
    }

    draw () {
        if (this.onScreen()) {
            super.draw()
            const { debug, overlay } = this.game
            this.hint && overlay.addHint(this)
            this.message && overlay.addMessage(this)
            debug && overlay.displayDebug(this)
        }
    }

    showHint (items) {
        if (!this.game.checkTimeout('hint')) {
            this.hint = items
            this.game.startTimeout('hint', 1000, this.hideHint)
        }
    }

    changeHint (items) {
        this.hint = items
        this.game.stopTimeout('hint')
        this.game.startTimeout('hint', 1000, this.hideHint)
    }

    hideHint () {
        this.hint = null
    }

    showMessage (message) {
        if (!this.game.checkTimeout('message')) {
            this.message = message
            this.game.startTimeout('message', 2000, this.hideMessage)
        }
    }

    changeMessage (message) {
        this.message = message
        this.game.stopTimeout('message')
        this.game.startTimeout('message', 2000, this.hideMessage)
    }

    hideMessage () {
        this.message = null
    }

    addItem (id, x, y) {
        const { scene } = this.game
        const item = getItemById(id)
        if (item) {
            scene.addObject({ x, y, ...item }, LAYERS.OBJECTS, 0)
        }
    }

    emitParticles (particle, x, y, count = 10, radius = 8) {
        for (let i = 0; i < count; i++) {
            const props = {
                x: x - (radius / 2) + randomInt(0, radius),
                y: y - (radius / 2) + randomInt(0, radius),
                force: particle.forceVector(),
                ...particle
            }
            this.game.scene.addObject({
                type: ENTITIES_TYPE.PARTICLE,
                life: randomInt(60, 120),
                dead: false,
                ...props
            }, LAYERS.OBJECTS)
        }
    }

    bounce () {
        this.direction = this.direction === DIRECTIONS.RIGHT
            ? DIRECTIONS.LEFT
            : DIRECTIONS.RIGHT
        this.force.x *= -1
    }

    addDust (direction) {
        if (!this.onFloor) return
        this.game.scene.addObject({
            type: ENTITIES_TYPE.DUST,
            visible: true,
            dead: false,
            width: 16,
            height: 16,
            x: direction === DIRECTIONS.RIGHT
                ? this.x - 4
                : this.x + this.width - 8,
            y: this.y + this.height - 16,
            direction
        }, LAYERS.OBJECTS)
    }
}
