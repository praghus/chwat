import Entity from '../entity'
import {DIRECTIONS, ENTITIES_TYPE} from '../../lib/constants'

export default class Crusher extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 1000
        this.fall = false
        this.rise = false
        this.solid = true
        this.shadowCaster = true
        this.fallDelay = parseInt(this.properties.delay) || 1000
        this.fallTimeout = setTimeout(() => {
            this.fall = true
        }, this.fallDelay)
    }

    update () {
        if (this.onScreen()) {
            const { camera, elements, world } = this._game

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
