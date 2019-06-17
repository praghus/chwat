import ActiveElement from '../models/active-element'
import { createRectangleObject } from '../../lib/utils/helpers'
import { DIRECTIONS, LAYERS, ENTITIES_TYPE } from '../../lib/constants'

export default class Crusher extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 1000
        this.fall = false
        this.rise = false
        this.solid = true
        this.fallDelay = parseInt(this.properties.delay) || 1000
        this.lightmask = createRectangleObject(this.x, this.y, this.width, this.height)
        this.fallTimeout = setTimeout(() => {
            this.fall = true
        }, this.fallDelay)
    }

    update () {
        if (this.onScreen()) {
            const { camera, world } = this.game

            if (this.rise) {
                this.force.y -= 0.005
            }
            else if (this.fall) {
                this.force.y += world.gravity
            }
            else {
                this.force.y = 0
            }

            this.move()

            if (this.onFloor) {
                this.force.y = 0
                this.fall = false
                this.rise = true
                world.addObject({
                    type: ENTITIES_TYPE.DUST,
                    x: this.x - 16,
                    y: this.y + this.height - 16,
                    direction: DIRECTIONS.RIGHT
                }, LAYERS.OBJECTS)
                world.addObject({
                    type: ENTITIES_TYPE.DUST,
                    x: this.x + this.width,
                    y: this.y + this.height - 16,
                    direction: DIRECTIONS.LEFT
                }, LAYERS.OBJECTS)
                camera.shake()
            }
            if (this.onCeiling) {
                this.rise = false
                this.fall = false
                this.fallTimeout = setTimeout(() => {
                    this.fall = true
                }, this.fallDelay)
            }
        }
        else {
            this.fallTimeout = null
        }
    }
}
