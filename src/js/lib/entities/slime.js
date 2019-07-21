import Character from '../models/character'
import { DIRECTIONS } from '../../lib/constants'

export default class Slime extends Character {
    constructor (obj, game) {
        super(obj, game)
        this.maxSpeed = 0
        this.damage = 20
        this.acceleration = 0.2
        this.running = false
        this.activated = false
        this.direction = this.properties && this.properties.direction || DIRECTIONS.LEFT
        this.setBoundingBox(18, 40, this.width - 36, this.height - 40)
    }

    update () {
        if (this.onScreen()) {
            this.activated = true
        }
        if (this.activated) {
            const { world, startTimeout } = this.game

            // @todo: rebuild whole solution and timeouts
            if (this.running) {
                switch (this.animFrame) {
                case 2:
                    this.maxSpeed = 1.4
                    break
                case 12:
                    this.maxSpeed = 0
                    break
                case 13:
                    this.running = false
                    break
                }
            }
            else if (!this.game.checkTimeout(`wait_${this.id}`)) {
                startTimeout(`wait_${this.id}`, 2300, () => {
                    this.onScreen()
                        ? this.running = true
                        : this.activated = false
                })
            }

            this.force.x += this.direction === DIRECTIONS.RIGHT
                ? this.acceleration
                : -this.acceleration

            if (this.onFloor) {
                this.force.y = 0
            }
            else {
                this.force.y += this.force.y > 0
                    ? world.gravity
                    : world.gravity / 2
            }

            this.move()
            const PX = Math.floor(this.x + 18 / world.spriteSize)
            const PW = Math.floor((this.x + this.width - 18) / world.spriteSize)
            const PH = Math.floor((this.y + this.height) / world.spriteSize)
            if (!world.isSolidArea(PX, PH, this.collisionLayers) ||
                !world.isSolidArea(PW, PH, this.collisionLayers)) {
                this.bounce()
            }
            if (this.x !== this.expectedX) {
                this.bounce()
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
}
