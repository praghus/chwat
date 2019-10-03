import { GameEntity } from '../models'
import { COLORS } from '../constants'

export default class SpiderTrap extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.damage = 50
        this.fall = false
        this.rise = false
        this.solid = true
        this.startX = this.x + (this.width / 2)
        this.startY = this.y
        this.fallDelay = parseInt(this.properties.delay) || 1000
        this.fallTimeout = setTimeout(() => {
            this.fall = true
        }, this.fallDelay)
    }

    draw (ctx) {
        if (this.onScreen()) {
            const { camera } = this.scene
            ctx.beginPath()
            ctx.strokeStyle = COLORS.SPIDER_WEB
            ctx.moveTo(this.startX + camera.x, this.startY + camera.y)
            ctx.lineTo(this.startX + camera.x, this.y + camera.y)
            ctx.stroke()
            super.draw(ctx)
        }
    }

    update () {
        if (this.onScreen()) {
            if (this.rise) {
                this.force.y = -1
            }
            else if (this.fall) {
                this.force.y += this.scene.gravity
            }
            else {
                this.force.y = 0
            }

            this.move()
            this.sprite.animate(this.animations.DEFAULT)

            if (this.onGround) {
                this.fall = false
                this.rise = true
            }
            if (this.y <= this.startY) {
                this.rise = false
                this.fall = false
                this.fallTimeout = setTimeout(() => {
                    this.fall = true
                }, this.fallDelay)
            }
        }
        else {
            this.fallTimeout = null
        }
    }
}
