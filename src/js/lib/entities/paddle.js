import { GameEntity } from '../models'
import { createLightSource } from 'tiled-platformer-lib'
import { COLORS } from '../../lib/constants'

export default class Paddle extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.acceleration = 0.1
        this.maxSpeed = 1
        this.activated = false
    }

    draw (ctx) {
        if (this.onScreen()) {
            super.draw(ctx)
            const { camera, assets, map: { tilewidth, tileheight } } = this.scene

            for (let x = 0; x < Math.round(this.width / tilewidth); x++) {
                ctx.drawImage(
                    assets[this.aid],
                    0, 0, tilewidth, tileheight,
                    Math.floor(this.x + camera.x) + (x * tilewidth), Math.floor(this.y + camera.y),
                    tilewidth, tileheight
                )
            }
        }
    }

    update () {
        if (this.activated && !this.dead) {
            const { map: { tileheight } } = this.scene
            const { destY } = this.properties
            if (this.y > destY * tileheight) {
                this.light = createLightSource(0, 0, 96, COLORS.TRANS_WHITE)
                this.force.y -= this.acceleration
                this.move()
            }
            else {
                this.kill()
            }
        }
    }
}
