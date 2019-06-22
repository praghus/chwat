import ActiveElement from '../models/active-element'
import { isValidArray } from '../../lib/utils/helpers'
import { ENTITIES_TYPE, LAYERS, TIMEOUTS } from '../../lib/constants'

export default class Trigger extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
        this.activated = false
    }

    collide (element) {
        const { activator, hint, offsetX, offsetY } = this.properties
        if (element.type === ENTITIES_TYPE.PLAYER) {
            if (activator === ENTITIES_TYPE.PLAYER) {
                this.interact()
            }
            else if (hint && !this.game.checkTimeout(TIMEOUTS.HINT)) {
                const { world } = this.game
                const [x, y] = [
                    offsetX ? this.x + parseFloat(offsetX) * world.spriteSize : this.x,
                    offsetY ? this.y + parseFloat(offsetY) * world.spriteSize : this.y
                ]
                this.showMessage(hint, x, y)
            }
        }
    }

    update () {
        if (this.activated) {
            const { camera, overlay, player, world } = this.game
            const { activator, clear, fade, follow, kill, modify, produce, related, shake } = this.properties

            if (related) {
                const rel = world.getObjectById(related, LAYERS.OBJECTS)
                const item = player.useItem(activator)

                if (follow) {
                    camera.setFollow(rel)
                    this.game.startTimeout(TIMEOUTS.TRIGGER_WAIT, () => {
                        rel.activated = true
                        rel.trigger = this
                        rel.activator = item

                        this.game.startTimeout(TIMEOUTS.TRIGGER_WAIT_FOR_PLAYER, () => {
                            overlay.fadeIn()
                            camera.setFollow(player)
                        })
                    })
                }
                else {
                    rel.activated = true
                    rel.trigger = this
                    rel.activator = item
                }
            }
            if (modify) {
                const matrix = JSON.parse(modify)
                isValidArray(matrix) && matrix.map(
                    ([x, y, id]) => world.putTile(x, y, id, LAYERS.MAIN)
                )
            }
            produce && this.addItem(this.properties, this.x + 16, this.y + 16)
            clear && this.clearTiles(clear)
            kill && world.getObjectById(kill, LAYERS.OBJECTS).kill()
            shake && camera.shake()
            fade && overlay.fadeIn()

            this.kill()
        }
    }

    interact () {
        const { player, world } = this.game
        const { activator, anchor_hint } = this.properties

        if (player.canUse(activator)) {
            player.hideHint()
            this.hideMessage()
            this.activated = true
        }
        else {
            const item = world.getObjectByProperty('id', activator, LAYERS.OBJECTS)
            if (item) {
                anchor_hint
                    ? this.showHint(item)
                    : player.showHint(item)
            }
            this.hideMessage()
        }
    }

    clearTiles (layer) {
        const { world } = this.game
        const { spriteSize } = world
        for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
            for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
                world.clearTile(
                    Math.round((this.x + (x * spriteSize)) / spriteSize),
                    Math.round((this.y + (y * spriteSize)) / spriteSize),
                    layer
                )
            }
        }
    }
}
