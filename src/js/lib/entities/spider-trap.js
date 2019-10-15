import { GameEntity } from '../models'
import { COLORS } from '../constants'

export default class SpiderTrap extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
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

    draw (ctx, scene) {
        if (scene.onScreen(this)) {
            const { camera } = scene
            ctx.beginPath()
            ctx.strokeStyle = COLORS.SPIDER_WEB
            ctx.moveTo(this.startX + camera.x, this.startY + camera.y)
            ctx.lineTo(this.startX + camera.x, this.y + camera.y)
            ctx.stroke()
            super.draw(ctx, scene)
        }
    }

    update (scene) {
        if (scene.onScreen(this)) {
            const gravity = scene.getProperty('gravity')

            if (this.rise) {
                this.force.y = -1
            }
            else if (this.fall) {
                this.force.y += gravity
            }
            else {
                this.force.y = 0
            }

            super.update(scene)
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
