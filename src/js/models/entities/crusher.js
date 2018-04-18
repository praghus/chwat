import '../../lib/illuminated'
import Entity from '../entity'
import { DIRECTIONS, ENTITIES_TYPE } from '../../lib/constants'

const { Vec2, RectangleObject } = window.illuminated

export default class Crusher extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.damage = 1000
        this.fall = false
        this.rise = false
        this.solid = true
        this.fallDelay = parseInt(this.properties.delay) || 1000
        this.fallTimeout = setTimeout(() => {
            this.fall = true
        }, this.fallDelay)
        this.lightmask = new RectangleObject({
            topleft: new Vec2(this.x, this.y),
            bottomright: new Vec2(this.x + this.width, this.y + this.height)
        })
    }

    update () {
        if (this.onScreen()) {
            const { camera, elements, world } = this._scene

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
                elements.add({
                    type: ENTITIES_TYPE.DUST,
                    x: this.x - 16,
                    y: this.y + this.height - 16,
                    direction: DIRECTIONS.RIGHT
                })
                elements.add({
                    type: ENTITIES_TYPE.DUST,
                    x: this.x + this.width,
                    y: this.y + this.height - 16,
                    direction: DIRECTIONS.LEFT
                })
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
