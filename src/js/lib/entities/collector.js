import { GameEntity } from '../models'
import { getProperties, getItemById, isValidArray } from '../utils/helpers'
import { ENTITIES_TYPE, ITEMS, LAYERS } from '../constants'

export default class Collector extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = false
        this.activated = false
        this.activators = []
        this.activator = getProperties(obj, 'activator')
        this.collect = getProperties(obj, 'collect')
            ? obj.properties.collect.trim().split(',')
            : []
        this.initialized = !this.activator
    }

    collide (element, scene) {
        const { player } = scene
        const { activator, anchor_hint } = this.properties
        if (this.initialized) {
            if (
                !element.dead &&
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
                const collected = this.activators.map(
                    ({ properties: { id } }) => id
                )
                const missing = this.collect
                    .filter((type) => collected.indexOf(type) === -1)
                    .map((type) => ITEMS[type])

                anchor_hint
                    ? this.changeHint(missing)
                    : player.changeHint(missing)
            }
        }
        else {
            if (getProperties(element, 'id') === activator) {
                element.kill()
                this.initialized = true
            }
            else if (element.type === ENTITIES_TYPE.PLAYER) {
                const item = getItemById(activator)
                if (item) {
                    anchor_hint
                        ? this.changeHint([item])
                        : player.changeHint([item])
                }
            }
        }
    }

    update (scene) {
        if (this.activated || scene.getProperty('debug')) {
            const { camera, player } = scene
            const { fade, modify, produce, related, shake } = this.properties
            const overlay = scene.getLayer(LAYERS.OVERLAY)

            this.activators.map((item) => item.kill())

            if (modify) {
                const matrix = JSON.parse(modify)
                isValidArray(matrix) && matrix.map(
                    ([x, y, id, layer]) => scene.putTile(x, y, id, layer)
                )
            }

            if (related) {
                const rel = scene.getObjectById(related, LAYERS.OBJECTS)
                rel.activated = true
                rel.visible = true
                rel.trigger = this
            }

            shake && camera.shake()
            fade && overlay.fadeIn()
            produce && this.addItem(produce, this.x + 16, this.y + 16)

            this.hideHint()
            this.hideMessage()

            player.hideHint()
            player.hideMessage()

            this.dead = true
            super.update(scene)
        }
    }
}
