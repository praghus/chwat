import Character from '../models/character'
import { DIRECTIONS } from '../../lib/constants'

export default class Slime extends Character {
    constructor (obj, game) {
        super(obj, game)
        this.maxSpeed = 0
        this.damage = 25
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
            const { world } = this.game
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
                    this.running = false
                    break
                }
            }
            else if (!this.game.checkTimeout(`wait_${this.id}`)) {
                this.game.startTimeout({name: `wait_${this.id}`, duration: 2300}, () => {
                    this.onScreen()
                        ? this.running = true
                        : this.activated = false
                })
            }

            this.force.y += gravity
            this.force.x += this.direction === DIRECTIONS.RIGHT
                ? this.acceleration
                : -this.acceleration

            this.move()

            if (
                this.expectedX !== this.x ||
                this.onRightEdge ||
                this.onLeftEdge
            ) {
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
