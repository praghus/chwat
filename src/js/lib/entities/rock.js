import ActiveElement from '../models/active-element'
import { DIRECTIONS } from '../../lib/constants'

export default class Rock extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.doShake = false
        this.acceleration = 0.2
        this.maxSpeed = 2
        this.damage = 50
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

    update () {
        if (this.activated && !this.dead) {
            const { camera, world: { gravity } } = this.game

            if (this.onFloor && this.acceleration < this.maxSpeed) {
                this.acceleration += 0.01
            }
            this.force.y += gravity
            this.force.x = this.direction === DIRECTIONS.RIGHT
                ? this.acceleration
                : -this.acceleration

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
            // if (this.expectedX > this.x) {
            //     this.kill()
            // }
        }
    }
}
