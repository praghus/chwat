import Entity from '../entity'
import {DIRECTIONS} from '../../lib/constants'

export default class Rock extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.doShake = false
        this.speed = 0.2
        this.maxSpeed = 2
        this.direction = DIRECTIONS.RIGHT
        this.damage = 50
        this.solid = true
        this.rotation = 0
    }
    draw (ctx) {
        const { assets, camera } = this._game
        const r = Math.PI / 16
        ctx.save()
        ctx.translate(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y))
        ctx.translate(16, 16)
        if (this.force.x !== 0) {
            this.rotation += this.speed / 5
        }
        ctx.rotate(this.rotation * r)
        ctx.drawImage(assets[this.asset], -16, -16)
        ctx.restore()
    }

    update () {
        if (this.activated && !this.dead) {
            const { camera, world } = this._game

            this.force.y += world.gravity

            if (this.onFloor && this.speed < this.maxSpeed) {
                this.speed += 0.01
            }

            this.force.x = this.direction === DIRECTIONS.RIGHT
                ? this.speed
                : -this.speed

            this.move()

            if (!this.onFloor) {
                this.doShake = true
            }
            else if (this.doShake) {
                camera.shake()
                this.doShake = false
            }
        }
    }
}
