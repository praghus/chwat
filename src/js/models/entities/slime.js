import Entity from '../entity'
import { DIRECTIONS, TIMEOUTS } from '../../lib/constants'

export default class Slime extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.distance = 0
        this.maxSpeed = 0
        this.damage = 25
        this.acceleration = 0.2
        this.running = false
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
        this.direction = this.properties && this.properties.direction || DIRECTIONS.LEFT
        this.range = this.properties && parseInt(this.properties.range) || 0
        this.wait()
    }

    update () {
        this.width = 48
        this.height = 48
        if (this.onScreen()) {
            const { world } = this._scene
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

            this.force.y += this.jump ? -0.2 : gravity
            this.force.x += this.direction === DIRECTIONS.RIGHT
                ? this.acceleration
                : -this.acceleration

            this.move()

            const newPosX = Math.round(this.x + this.width / 2)
            const startPosX = Math.round(this.lastPosition.x + this.width / 2)

            this.distance = newPosX > startPosX
                ? newPosX - startPosX
                : startPosX - newPosX

            if (
                this.expectedX < this.x || this.expectedX > this.x ||
                this.onRightEdge || this.onLeftEdge ||
                this.distance >= this.range
            ) {
                this.turn()
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

    turn () {
        this.direction = this.direction === DIRECTIONS.RIGHT
            ? DIRECTIONS.LEFT
            : DIRECTIONS.RIGHT
        this.force.x *= -0.6
    }

    wait () {
        this.running = false
        this.maxSpeed = 0
        this.startTimeout(TIMEOUTS.SLIME_WAIT, () => {
            this.running = true
        })
    }
}
