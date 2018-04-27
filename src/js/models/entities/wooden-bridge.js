import Entity from '../entity'
import {ENTITIES_TYPE, LAYERS} from '../../lib/constants'

export default class WoodenBridge extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        this.activated = false
        this.activators = []
    }

    collide (element) {
        const { world } = this._scene
        const { hint, offsetX, offsetY } = this.properties

        if (!this.dead) {
            if (element.type === ENTITIES_TYPE.ITEM) {
                const { id } = element.properties
                if (['plank', 'nails', 'hammer'].indexOf(id) !== -1) {
                    this.activators.push(element)
                    if (this.activated) element.kill()
                }
                if (this.activators.length === 3) {
                    this.activated = true
                }
            }
            else if (hint && element.type === ENTITIES_TYPE.PLAYER) {
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
            const { overlays, world } = this._scene
            this.activators.map((item) => item.kill())
            world.put(LAYERS.BACKGROUND2, 443, 14, 209)
            world.put(LAYERS.BACKGROUND2, 444, 14, 209)
            world.put(LAYERS.BACKGROUND2, 445, 14, 209)
            world.put(LAYERS.MAIN, 443, 15, 868)
            world.put(LAYERS.MAIN, 444, 15, 868)
            world.put(LAYERS.MAIN, 445, 15, 868)
            overlays.fadeIn()
            this.dead = true
        }
        else {
            this.activators = []
        }
    }
}
