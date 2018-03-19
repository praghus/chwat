import Entity from '../entity'
import { DIRECTIONS, ENTITIES_FAMILY } from '../../lib/constants'

export default class Blob extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.direction = DIRECTIONS.LEFT
        this.maxSpeed = 0.5
        this.speed = 0.01
        this.damage = 25
        this.solid = true
        this.bounds = {
            x: 4,
            y: 10,
            width: this.width - 8,
            height: this.height - 10
        }
        this.animations = {
            DOWN_RIGHT: {x: 0, y: 0, w: 20, h: 20, frames: 6, fps: 12, loop: true},
            DOWN_LEFT: {x: 0, y: 20, w: 20, h: 20, frames: 6, fps: 12, loop: true},
            UP_RIGHT: {x: 0, y: 60, w: 20, h: 20, frames: 6, fps: 12, loop: true},
            UP_LEFT: {x: 0, y: 40, w: 20, h: 20, frames: 6, fps: 12, loop: true},
            JUMP: {x: 0, y: 80, w: 20, h: 20, frames: 2, fps: 6, loop: false}
        }
    }

    update () {
        if (this.onScreen()) {
            this.awake = true
        }
        if (this.awake && !this.dead) {
            const { gravity } = this._scene.world
            this.force.y += this.jump ? -0.2 : gravity
            this.force.x += this.direction === DIRECTIONS.RIGHT ? this.speed : -this.speed

            this.move()

            if (this.expectedX < this.x || this.onLeftEdge) {
                this.direction = DIRECTIONS.RIGHT
                this.force.x *= -0.6
            }
            if (this.expectedX > this.x || this.onRightEdge) {
                this.direction = DIRECTIONS.LEFT
                this.force.x *= -0.6
            }

            if (this.onFloor) {
                this.animate(this.direction === DIRECTIONS.RIGHT
                    ? this.animations.DOWN_RIGHT
                    : this.animations.DOWN_LEFT
                )
            }
            else if (this.onCeiling) {
                this.animate(this.direction === DIRECTIONS.RIGHT
                    ? this.animations.UP_RIGHT
                    : this.animations.UP_LEFT
                )
            }
            else {
                this.animate(this.animations.JUMP)
            }
        }
    }
}
