import { GameEntity } from '../models'
import { createLamp } from 'tiled-platformer-lib'
import { COLORS, ENTITIES_TYPE } from '../../lib/constants'

export default class Paddle extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.acceleration = 0.1
        this.maxSpeed = 1
        this.activated = false
    }

    draw () {
        if (this.onScreen()) {
            const { ctx, camera, scene, props: { assets } } = this.game
            const { map: { tilewidth, tileheight } } = scene

            for (let x = 0; x < Math.round(this.width / tilewidth); x++) {
                ctx.drawImage(
                    assets[this.asset],
                    0, 0, tilewidth, tileheight,
                    Math.floor(this.x + camera.x) + (x * tilewidth), Math.floor(this.y + camera.y),
                    tilewidth, tileheight
                )
            }
        }
    }

    collide (element) {
        if (!this.dead && element.solid && element.type !== ENTITIES_TYPE.BLOB) {
            const expectedY = (this.y - element.height) + (this.height - 16)
            if (element.y >= expectedY && !element.jump) {
                element.y = expectedY
                element.force.y = 0
                element.fall = false
                element.onFloor = true
            }
            else if (element.force.y === 0) {
                element.force.y += 1
            }
        }
    }

    update () {
        if (this.activated && !this.dead) {
            const { map: { tileheight } } = this.game.scene
            const { destY } = this.properties
            if (this.y > destY * tileheight) {
                this.light = createLamp(0, 0, 96, COLORS.TRANS_WHITE)
                this.force.y -= this.acceleration
                this.move()
            }
            else {
                this.light = null
            }
        }
    }
}
