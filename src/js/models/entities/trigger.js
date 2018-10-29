import Entity from '../entity'
import { INPUTS, LAYERS } from '../../lib/constants'
import { ENTITIES_TYPE } from '../../lib/entities'

export default class Trigger extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        this.activated = false
    }

    collide (element) {
        const { camera, elements, input, player, overlays, world } = this._scene
        const { activator, follow, hint, offsetX, offsetY, related, anchor_hint } = this.properties
        const triggered = !this.activated && (input[INPUTS.INPUT_ACTION] || activator === ENTITIES_TYPE.PLAYER)
        if (element.type === ENTITIES_TYPE.PLAYER && !this.dead) {
            if (triggered) {
                if (player.canUse(activator)) {
                    const item = player.useItem(activator)
                    this.activated = true
                    this.hideMessage()
                    player.hideHint()
                    if (related) {
                        const rel = elements.getById(related)
                        if (follow) {
                            camera.setFollow(rel)
                            this.startTimeout({
                                name: 'wait_for_camera',
                                duration: 300
                            }, () => {
                                rel.activated = true
                                rel.trigger = this
                                rel.activator = item
                                this.startTimeout({
                                    name: 'wait_for_player',
                                    duration: 500
                                }, () => {
                                    overlays.fadeIn()
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
                }
                else {
                    const item = elements.getByProperties('id', activator)
                    anchor_hint
                        ? this.showHint(item)
                        : player.showHint(item)
                    this.hideMessage()
                }
            }
            else if (hint && !player.hintTimeout) {
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
            const { camera, elements, overlays, world } = this._scene
            const { clear, fade, modify, produce, produce_name, shake } = this.properties
            if (produce) {
                elements.add({
                    type: ENTITIES_TYPE.ITEM,
                    name: produce_name || '',
                    properties: { id: produce },
                    x: this.x + 16,
                    y: this.y
                })
            }
            if (modify) {
                const matrix = JSON.parse(modify)
                if (matrix.length) {
                    matrix.map(
                        ([x, y, id]) => world.put(LAYERS.MAIN, x, y, id)
                    )
                }
            }
            if (clear) {
                elements.clearInRange(this)
                this.clearTiles(clear)
            }
            shake && camera.shake()
            fade && overlays.fadeIn()
            this.dead = true
        }
    }

    clearTiles (layer) {
        const { world } = this._scene
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
