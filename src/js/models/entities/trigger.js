import Entity from '../entity'
import {ENTITIES_TYPE, INPUTS, LAYERS} from '../../lib/constants'

export default class Trigger extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
        this.activated = false
    }

    collide (element) {
        const { elements, input, player, world } = this._game
        const { activator, hint, offsetX, offsetY, related } = this.properties
        const triggered = !this.activated && (input[INPUTS.INPUT_ACTION] || activator === ENTITIES_TYPE.PLAYER)
        if (element.type === ENTITIES_TYPE.PLAYER && !this.dead) {
            if (triggered) {
                if (player.canUse(activator)) {
                    const a = player.useItem(activator)
                    this.activated = true
                    this.hideMessage()
                    player.hideHint()
                    if (related) {
                        const rel = elements.getById(related)
                        rel.activated = true
                        rel.trigger = this
                        rel.activator = a
                    }
                }
                else {
                    const item = elements.getByProperties('id', activator)
                    player.showHint(item)
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
            const { elements } = this._game
            const { clear, produce, produce_name } = this.properties
            if (produce) {
                elements.add({
                    type: ENTITIES_TYPE.ITEM,
                    name: produce_name || '',
                    properties: { id: produce },
                    x: this.x + 16,
                    y: this.y
                })
            }
            if (clear) {
                elements.clearInRange(this)
                this.clearTiles()
            }
            this.dead = true
        }
    }

    clearTiles () {
        const { camera, world } = this._game
        const { spriteSize } = world
        for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
            for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
                world.clearTile(
                    Math.round((this.x + (x * spriteSize)) / spriteSize),
                    Math.round((this.y + (y * spriteSize)) / spriteSize),
                    LAYERS.MAIN
                )
            }
        }
        camera.shake()
    }
}
