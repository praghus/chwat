import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Catapult extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.animations = {
            UP: {x: 0, y: 0, w: 64, h: 16, frames: 1, fps: 0, loop: false},
            DOWN: {x: 0, y: 16, w: 64, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.timeout = null
        this.animation = this.animations.UP
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {

            this.trigger.activated = false
            this.trigger.dead = false

            element.fall = false
            element.force.y = -28

            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    this.activated = false
                    this.timeout = null
                    this.activator.placeAt(this.x - 48, this.y)
                }, 1000)
            }
        }
    }

    update () {
        if (this.onScreen()) {
            if (this.activated && !this.dead) {
                this.animation = this.animations.DOWN
            }
            else {
                this.animation = this.animations.UP
            }
        }
    }
}
