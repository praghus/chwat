import { GameEntity } from '../models'
import { DIRECTIONS, SOUNDS } from '../../lib/constants'

export default class Slime extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.distance = obj.width
        this.x = obj.x - 16
        this.width = 48
        this.height = 16
        this.maxSpeed = 0
        this.damage = 20
        this.acceleration = 0.2
        this.running = false
        this.activated = false
        this.sprite.animation = this.animations.BOUNCE
        this.direction = DIRECTIONS.RIGHT
        this.setBoundingBox(17, 4, 14, 12)
    }

    onScreen () {
        const {
            camera,
            scene: {
                resolutionX,
                resolutionY,
                map: {
                    tilewidth,
                    tileheight
                }
            }
        } = this.game

        const { x, y } = this.initialPosition

        return (
            x + this.distance + tilewidth > -camera.x &&
            y + this.height + tileheight > -camera.y &&
            x - tilewidth < -camera.x + resolutionX &&
            y - tileheight < -camera.y + resolutionY
        )
    }

    update () {
        if (this.onScreen()) {
            this.activated = true
        }
        if (this.activated) {
            const { props: { playSound }, scene, startTimeout } = this.game

            if (this.running) {
                switch (this.sprite.animFrame) {
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
                    if (this.onScreen()) {
                        this.running = true
                        playSound(SOUNDS.SLIME)
                    }
                    else {
                        this.activated = false
                    }
                })
            }

            this.force.x += this.direction === DIRECTIONS.RIGHT
                ? this.acceleration
                : -this.acceleration

            this.force.y += this.force.y > 0
                ? scene.gravity
                : scene.gravity / 2

            this.move()

            if (
                this.x + 32 > this.initialPosition.x + this.distance ||
                this.x + 16 < this.initialPosition.x
            ) {
                this.bounce()
            }

            if (this.direction === DIRECTIONS.RIGHT) {
                this.sprite.animate(this.running
                    ? this.animations.RUN_RIGHT
                    : this.animations.BOUNCE
                )
            }
            else {
                this.sprite.animate(this.running
                    ? this.animations.RUN_LEFT
                    : this.animations.BOUNCE
                )
            }
        }
    }
}
