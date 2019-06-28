import { Entity } from 'tiled-platformer-lib'
import { randomInt } from '../../lib/utils/helpers'
import { ENTITIES_TYPE, LAYERS, TIMEOUTS } from '../../lib/constants'

export default class ActiveElement extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.activated = false
        this.visible = true
    }

    draw () {
        if (this.onScreen()) {
            const { debug, overlay } = this.game

            super.draw()
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

    hideHint () {
        this.hint = null
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

    hideMessage () {
        this.message = null
    }

    addItem (properties, x, y) {
        const { produce, produce_name, produce_gid } = properties
        this.game.world.addObject({
            x, y,
            width: 16,
            height: 16,
            visible: true,
            type: ENTITIES_TYPE.ITEM,
            gid: produce_gid || null,
            name: produce_name || '',
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
