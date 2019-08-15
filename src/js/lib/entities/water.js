import { GameEntity } from '../models'
import { createLamp } from 'tiled-platformer-lib'
import { COLORS, DIRECTIONS, ENTITIES_TYPE } from '../../lib/constants'

export default class Water extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 100
        this.direction = DIRECTIONS.DOWN
        this.radius = this.height
        this.animation = this.animations.WAVES
        this.light = createLamp(0, 0, this.radius, COLORS.WATER)
    }

    draw () {
        if (this.onScreen()) {
            const { ctx, camera, scene, props: { assets } } = this.game
            const { map: { tilewidth, tileheight } } = scene
            const { canFall } = this.properties
            const { animFrame } = this.sprite

            const [ posX, posY, pW, pH ] = [
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y),
                Math.round(this.width / tilewidth),
                Math.round(this.height / tileheight)
            ]

            for (let y = 0; y < pH; y++) {
                for (let x = 0; x < pW; x++) {
                    const PX = Math.round((this.x + (x * tilewidth)) / tilewidth)
                    const PY = Math.round((this.y + (y * tileheight)) / tileheight)
                    if (!scene.isSolidArea(PX, PY, this.collisionLayers)) {
                        ctx.drawImage(assets[this.asset],
                            y === 0 ? this.animation.frames[animFrame][0] : 0,
                            y === 0 ? this.animation.frames[animFrame][1] : 32,
                            tilewidth, tileheight,
                            posX + (x * tilewidth), posY + (y * tileheight),
                            tilewidth, tileheight
                        )
                    }
                    if (!scene.isSolidArea(PX, PY + 1, this.collisionLayers) && canFall && y + 1 === pH) {
                        this.fall = true
                    }
                }
            }
        }
    }

    collide (element) {
        // restore the initial position of the item when it falls into the water
        if (element.family === ENTITIES_TYPE.ITEM) {
            element.restore()
        }
    }

    update () {
        if (this.onScreen()) {
            this.sprite.animate(this.animation)
            if (this.fall) {
                this.fall = false
                this.y += 16
            }
        }
    }
}
