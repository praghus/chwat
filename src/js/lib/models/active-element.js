import Entity from './entity'
import { randomInt } from '../../lib/utils/helpers'
import { ENTITIES_TYPE, LAYERS, TIMEOUTS } from '../../lib/constants'

export default class ActiveElement extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.activated = false
        this.visible = true

        this.hideMessage = () => {
            this.message = null
        }

        this.hideHint = () => {
            this.hint = null
        }
    }

    draw () {
        if (this.onScreen()) {
            const { camera, debug, overlay } = this.game

            super.draw()

            if (this.message) {
                const { text, x, y } = this.message
                overlay.displayText(text,
                    Math.floor(x + camera.x),
                    Math.floor(y + camera.y)
                )
            }
            this.hint && overlay.addHint(this)
            debug && overlay.displayDebug(this)
        }
    }

    showHint (item) {
        if (!this.game.checkTimeout(TIMEOUTS.HINT)) {
            this.hint = item.gid
            this.game.startTimeout(TIMEOUTS.HINT, this.hideHint)
        }
    }

    showMessage (text) {
        const offsetX = this.properties && this.properties.offsetX || 0
        const offsetY = this.properties && this.properties.offsetY || 0
        const { world } = this.game
        const [x, y] = [
            offsetX ? this.x + offsetX * world.spriteSize : this.x,
            offsetY ? this.y + offsetY * world.spriteSize : this.y
        ]
        if (!this.game.checkTimeout(TIMEOUTS.MESSAGE)) {
            this.message = { text, x, y }
            this.game.startTimeout(TIMEOUTS.MESSAGE, this.hideMessage)
        }
    }

    changeMessage (text, x = this.x, y = this.y) {
        this.game.stopTimeout(TIMEOUTS.MESSAGE)
        this.message = { text, x, y }
        this.game.startTimeout(TIMEOUTS.MESSAGE, this.hideMessage)
    }

    addItem (properties, x, y) {
        const { produce, produce_name, produce_gid } = properties
        this.game.world.addObject({
            type: ENTITIES_TYPE.ITEM,
            visible: true,
            gid: produce_gid || null,
            name: produce_name || '',
            x: x || this.x,
            y: y || this.y,
            properties: { id: produce }
        }, LAYERS.OBJECTS)
    }

    emitParticles (count, properties) {
        const particle_count = count || 10
        for (let i = 0; i < particle_count; i++) {
            const props = {...properties}
            props.x = properties.x + randomInt(0, 8)
            this.game.world.addObject({
                type: ENTITIES_TYPE.PARTICLE,
                ...props
            }, LAYERS.OBJECTS)
        }
    }
}
