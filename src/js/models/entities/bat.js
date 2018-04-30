import Entity from '../entity'
import { ENTITIES_FAMILY } from '../../lib/entities'
import { DIRECTIONS } from '../../lib/constants'

export default class Bat extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.direction = DIRECTIONS.LEFT
        this.maxSpeed = 1
        this.speed = 0.2
        this.energy = 20
        this.maxEnergy = 20
        this.damage = 10
        this.solid = true
        this.animFrame = Math.random() * 6
        this.animations = {
            RIGHT: {x: 0, y: 0, w: 28, h: 20, frames: 6, fps: 16, loop: true},
            LEFT: {x: 0, y: 20, w: 28, h: 20, frames: 6, fps: 16, loop: true}
        }
        this.bounds = {
            x: 5,
            y: 0,
            width: this.width - 10,
            height: this.height - 8
        }
    }

    collide (element) {
        if (element.damage > 0 && element.family !== ENTITIES_FAMILY.ENEMIES) {
            this.hit(element.damage)
        }
    }

    update () {
        if (this.onScreen()) {
            this.awake = true
        }

        if (this.awake && !this.dead) {
            const flyingRight = this.direction === DIRECTIONS.RIGHT
            this.force.y = 0
            this.force.x += flyingRight
                ? this.speed
                : -this.speed

            this.move()

            if (this.expectedX !== this.x) {
                this.direction = flyingRight
                    ? DIRECTIONS.LEFT
                    : DIRECTIONS.RIGHT
                this.force.x *= -0.6
            }

            this.animate(flyingRight
                ? this.animations.RIGHT
                : this.animations.LEFT
            )
        }
    }
}
