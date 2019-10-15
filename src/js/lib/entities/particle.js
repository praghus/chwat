import { Vector } from 'sat'
import { GameEntity } from '../models'
import { approach, random, randomInt } from '../../lib/utils/helpers'

export default class Particle extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        const dir = random(0, 2) * Math.PI
        this.attached = true
        this.maxSpeed = random(0.5, 1)
        this.force = obj.force || new Vector(
            Math.cos(dir) * this.maxSpeed,
            Math.sin(dir) * this.maxSpeed
        )
        this.life = randomInt(60, 120)
        this.mass = obj.mass || random(0.3, 1)
        this.dead = false
        this.setBoundingBox(0, 0, this.width, this.height)
    }

    onScreen () {
        return true
    }

    draw (ctx, scene) {
        if (scene.onScreen(this)) {
            const { camera } = scene
            ctx.save()
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.rect(
                this.x + camera.x,
                this.y + camera.y,
                this.width,
                this.height
            )
            ctx.fill()
            ctx.closePath()
            ctx.restore()
        }
    }

    update (scene) {
        if (!this.dead) {
            this.force.y = approach(this.force.y, 3, 1)
            super.update(scene)
            if (
                this.y !== this.expectedPos.y ||
                this.x !== this.expectedPos.x
            ) {
                this.force.y *= -0.8
                this.force.x *= 0.9
            }
            this.life--
        }
        if (this.life < 0) {
            this.dead = true
        }
    }
}
