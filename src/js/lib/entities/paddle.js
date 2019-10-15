import { GameEntity } from '../models'
import { approach } from '../../lib/utils/helpers'
import { COLORS } from '../../lib/constants'

export default class Paddle extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = true
        this.activated = false
    }

    draw (ctx, scene) {
        if (scene.onScreen(this)) {
            super.draw(ctx, scene)
            const { camera, assets, map: { tilewidth, tileheight } } = scene

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

    update (scene) {
        if (this.activated && !this.dead) {
            const { map: { tileheight } } = scene
            const { destY } = this.properties
            if (this.y > destY * tileheight) {
                if (!this.light) {
                    this.addLightSource(96, COLORS.TRANS_WHITE)
                }
                this.force.y = approach(this.force.y, -3, 1)
                super.update(scene)
            }
            else {
                this.kill()
            }
        }
    }
}
