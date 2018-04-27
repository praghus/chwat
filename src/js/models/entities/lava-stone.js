import Entity from '../entity'
import { DIRECTIONS } from '../../lib/constants'

export default class LavaStone extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.damage = 100
        this.width = 4
        this.height = 4
        this.speed = 0.5
        this.maxSpeed = 1
        this.damage = 20
        this.color = 'rgb(200,100,0)'
    }

    collide () {

    }

    draw () {
        const { ctx, camera } = this._scene
        ctx.save()
        ctx.fillStyle = this.color
        ctx.fillRect(this.x + camera.x, this.y + camera.y, this.width, this.height)
        ctx.restore()
    }

    update () {
        if (!this.dead) {
            this.force.y += this.force.y < 0 ? 0.2 : 0.4
            this.force.x += this.direction === DIRECTIONS.RIGHT
                ? this.speed
                : -this.speed

            this.move()

            if (this.expectedX !== this.x || this.expectedY !== this.y) {
                const { elements } = this._scene
                this.dead = true
                elements.emitParticles(5 + parseInt(Math.random() * 5), {
                    x: this.direction === DIRECTIONS.RIGHT ? this.x + this.width : this.x,
                    y: this.y,
                    width: 1,
                    height: 1,
                    color: this.color
                })
            }
        }
    }
}
