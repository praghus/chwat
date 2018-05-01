import Entity from '../entity'
import { DIRECTIONS, TIMEOUTS } from '../../lib/constants'

export default class Slime extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.direction = DIRECTIONS.LEFT
        this.maxSpeed = 0
        this.acceleration = 0.2
        this.damage = 25
        this.solid = true
        this.bounds = {
            x: 18,
            y: 40,
            width: this.width - 36,
            height: this.height - 40
        }
        this.animations = {
            BOUNCE: {x: 0, y: 0, w: 48, h: 48, frames: 9, fps: 12, loop: true},
            RUN_LEFT: {x: 0, y: 48, w: 48, h: 48, frames: 14, fps: 12, loop: true},
            RUN_RIGHT: {x: 0, y: 96, w: 48, h: 48, frames: 14, fps: 12, loop: true}
        }
        this.running = false
        this.wait()
    }

    update () {
        if (this.onScreen()) {
            this.awake = true
        }
        if (this.awake && !this.dead) {
            const { player, world } = this._scene
            const { gravity } = world

            if (this.running) {
                switch (this.animFrame) {
                case 2:
                    this.maxSpeed = 1.4
                    break
                case 12:
                    this.maxSpeed = 0
                    break
                case 13:
                    this.wait()
                    break
                }
            }
            else {
                this.direction = this.x < player.x
                    ? DIRECTIONS.RIGHT
                    : DIRECTIONS.LEFT
            }

            this.force.y += this.jump ? -0.2 : gravity
            this.force.x += this.direction === DIRECTIONS.RIGHT ? this.acceleration : -this.acceleration
            this.move()

            if (this.expectedX < this.x || this.onLeftEdge) {
                this.direction = DIRECTIONS.RIGHT
                this.force.x *= -0.6
            }
            if (this.expectedX > this.x || this.onRightEdge) {
                this.direction = DIRECTIONS.LEFT
                this.force.x *= -0.6
            }
            if (this.direction === DIRECTIONS.RIGHT) {
                this.animate(this.running
                    ? this.animations.RUN_RIGHT
                    : this.animations.BOUNCE
                )
            }
            else {
                this.animate(this.running
                    ? this.animations.RUN_LEFT
                    : this.animations.BOUNCE
                )
            }
        }
    }

    wait () {
        this.running = false
        this.startTimeout(TIMEOUTS.SLIME_WAIT, () => {
            this.running = true
        })
    }
}
