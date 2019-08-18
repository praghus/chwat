import { GameEntity } from '../models'
import { DIRECTIONS } from '../../lib/constants'

export default class Rock extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.doShake = false
        this.activated = false
        this.acceleration = 0.2
        this.maxSpeed = 2
        this.damage = 1000
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
            const { camera, scene: { gravity } } = this.game

            if (this.onFloor && this.acceleration < this.maxSpeed) {
                this.acceleration += 0.01
            }

            this.force.y += gravity
            this.force.x = this.acceleration

            this.move()

            if (this.expectedX === this.x) {
                if (!this.onFloor) {
                    this.doShake = true
                }
                else if (this.doShake) {
                    camera.shake()
                    this.doShake = false
                }
            }
            else {
                this.kill()
            }
        }
    }
}
