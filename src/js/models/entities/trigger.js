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
        const { elements, input, player } = this._game
        const { activator, related } = this.properties
        const triggered = !this.activated && (input[INPUTS.INPUT_ACTION] || activator === ENTITIES_TYPE.PLAYER)
        if (triggered && element.type === ENTITIES_TYPE.PLAYER && !this.dead) {
            if (player.canUse(activator)) {
                const a = player.useItem(activator)
                this.activated = true
                player.hideHint()
                if (related) {
                    const rel = elements.getById(related)
                    rel.activated = true
                    rel.trigger = this
                    rel.activator = a
                }
            }
            else {
                // const r = (player.x - (this.x + this.width / 2)) ^ 2 + (player.y - (this.y + this.height / 2)) ^ 2
                const item = elements.getByProperties('id', this.properties.activator)
                // console.log(r + ' in radius ', item);
                player.showHint(item)
            }
        }
    }

    update () {
        if (this.activated) {
            const { elements } = this._game
            if (this.properties.clear) {
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
