import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE, LAYERS } from '../../lib/constants'

export default class WoodenBridge extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
        this.activated = false
        this.activators = []
    }

    collide (element) {
        const { world } = this.game
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
            const { overlay, world } = this.game
            this.activators.map((item) => item.kill())
            world.putTile(443, 14, 209, LAYERS.BACKGROUND2)
            world.putTile(444, 14, 209, LAYERS.BACKGROUND2)
            world.putTile(445, 14, 209, LAYERS.BACKGROUND2)
            world.putTile(443, 15, 868, LAYERS.MAIN)
            world.putTile(444, 15, 868, LAYERS.MAIN)
            world.putTile(445, 15, 868, LAYERS.MAIN)
            overlay.fadeIn()
            this.dead = true
        }
        else {
            this.activators = []
        }
    }
}
