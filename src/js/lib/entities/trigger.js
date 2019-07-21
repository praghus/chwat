import ActiveElement from '../models/active-element'
import { isValidArray } from '../utils/helpers'
import { ENTITIES_TYPE, LAYERS } from '../constants'

export default class Trigger extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
        this.activated = false
    }

    collide (element) {
        const { activator } = this.properties
        if (element.type === ENTITIES_TYPE.PLAYER && activator === element.type) {
            this.interact()
        }
    }

    update () {
        if (this.activated) {
            const { camera, overlay, player, world, startTimeout } = this.game
            const {
                activator, clear, fade, follow, kill, modify, produce, related, reusable, shake
            } = this.properties

            if (related) {
                const rel = world.getObjectById(related, LAYERS.OBJECTS)
                const item = player.useItem(activator)

                if (follow) {
                    camera.setFollow(rel)
                    startTimeout('trigger_wait', 300, () => {
                        rel.activated = true
                        rel.trigger = this
                        rel.activator = item

                        startTimeout('trigger_wait_for_player', 2500, () => {
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
            !reusable && this.kill()
        }
    }

    interact () {
        const { player, world } = this.game
        const { activator, anchor_hint } = this.properties
        if (player.canUse(activator)) {
            player.hideHint()
            player.useItem(activator)
            this.activated = true
        }
        else if (!this.activated) {
            const item = world.getObjectByProperty('id', activator, LAYERS.OBJECTS)
            player.moveItems()
            if (item) {
                anchor_hint
                    ? this.showHint(item)
                    : player.showHint(item)
            }
        }
    }

    clearTiles (layerId) {
        const { world } = this.game
        const { spriteSize } = world
        for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
            for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
                world.clearTile(
                    Math.round((this.x + (x * spriteSize)) / spriteSize),
                    Math.round((this.y + (y * spriteSize)) / spriteSize),
                    layerId
                )
            }
        }
    }
}
