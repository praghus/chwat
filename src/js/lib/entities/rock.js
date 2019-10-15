import { GameEntity } from '../models'
import { randomInt } from '../../lib/utils/helpers'
import { DIRECTIONS, PARTICLES, SOUNDS } from '../../lib/constants'

export default class Rock extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.doShake = false
        this.activated = false
        this.soundPlayed = false
        this.attached = true
        this.acceleration = 0.2
        this.maxSpeed = 2
        this.damage = 100
        this.solid = true
        this.rotation = 0
        this.direction = DIRECTIONS.RIGHT
        this.shadowCaster = true
    }

    draw (ctx, scene) {
        if (this.activated) {
            const { camera, assets } = scene
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
            ctx.drawImage(assets[this.aid], -16, -16)
            ctx.restore()
        }
    }

    update (scene) {
        if (this.activated) {
            super.update(scene)
            if (!this.soundPlayed) {
                this.soundPlayed = true
                scene.properties.sfx(SOUNDS.ROCK)
            }
            const { camera } = scene
            const gravity = scene.getProperty('gravity')

            if (this.onGround && this.acceleration < this.maxSpeed) {
                this.acceleration += 0.01
            }

            this.force.y += gravity
            this.force.x = this.acceleration

            if (this.x < 7260) {
                if (!this.onGround) {
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
