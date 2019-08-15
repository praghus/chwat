import { GameEntity } from '../models'
import { ENTITIES_TYPE, ITEMS, ITEMS_TYPE, LAYERS } from '../../lib/constants'

export default class WoodenBridge extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
        this.activated = false
        this.activators = []
        this.collect = [
            ITEMS_TYPE.PLANK,
            ITEMS_TYPE.NAILS,
            ITEMS_TYPE.HAMMER
        ]
    }

    collide (element) {
        if (!this.dead) {
            if (
                element.type === ENTITIES_TYPE.ITEM &&
                this.collect.indexOf(element.properties.id) !== -1
            ) {
                this.activators.push(element)
                element.kill()
            }

            if (this.activators.length === this.collect.length) {
                this.activated = true
            }
            else if (element.type === ENTITIES_TYPE.PLAYER) {
                const { player } = this.game
                const { anchor_hint } = this.properties

                const collected = this.activators.map(({ properties: { id } }) => id)
                const missing = this.collect.filter(
                    (type) => collected.indexOf(type) === -1
                ).map(
                    (type) => ITEMS[type]
                )
                anchor_hint
                    ? this.changeHint(missing)
                    : player.changeHint(missing)
            }
        }
    }

    update () {
        if (this.activated) {
            const { overlay, player, scene } = this.game

            this.activators.map((item) => item.kill())

            scene.putTile(443, 14, 209, LAYERS.BACKGROUND2)
            scene.putTile(444, 14, 209, LAYERS.BACKGROUND2)
            scene.putTile(445, 14, 209, LAYERS.BACKGROUND2)
            scene.putTile(443, 15, 868, LAYERS.MAIN)
            scene.putTile(444, 15, 868, LAYERS.MAIN)
            scene.putTile(445, 15, 868, LAYERS.MAIN)

            overlay.fadeIn()

            this.hideHint()
            player.hideHint()

            this.dead = true
        }
    }
}
