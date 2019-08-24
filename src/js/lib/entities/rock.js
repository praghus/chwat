import { GameEntity } from '../models'
import { randomInt } from '../../lib/utils/helpers'
import { DIRECTIONS, PARTICLES, SOUNDS } from '../../lib/constants'

export default class Rock extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.doShake = false
        this.activated = false
        this.soundPlayed = false
        this.acceleration = 0.2
        this.maxSpeed = 2
        this.damage = 100
        this.solid = true
        this.rotation = 0
        this.direction = DIRECTIONS.RIGHT
        this.shadowCaster = true
    }

    draw () {
        if (this.onScreen()) {
            const { ctx, camera, props: { assets } } = this.game
            const r = Math.PI / 16
            ctx.save()
            ctx.translate(
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            )
            ctx.translate(16, 16)
            if (this.force.x !== 0) {
                this.rotation += this.acceleration / 5
            }
            ctx.rotate(this.rotation * r)
            ctx.drawImage(assets[this.asset], -16, -16)
            ctx.restore()
        }
    }

    onScreen () {
        return this.activated
    }

    update () {
        if (this.activated) {
            if (!this.soundPlayed) {
                this.soundPlayed = true
                this.game.props.playSound(SOUNDS.ROCK)
            }
            const { camera, scene: { gravity } } = this.game

            if (this.onFloor && this.acceleration < this.maxSpeed) {
                this.acceleration += 0.01
            }

            this.force.y += gravity
            this.force.x = this.acceleration

            this.move()

            if (this.x < 7260) {
                if (!this.onFloor) {
                    this.doShake = true
                }
                else if (this.doShake) {
                    camera.shake()
                    this.doShake = false
                    this.emitParticles(
                        PARTICLES.DIRT,
                        this.x + 8,
                        this.y + this.height,
                        randomInt(5, 10),
                        16
                    )
                }
            }
            else {
                this.kill()
            }
        }
    }
}
