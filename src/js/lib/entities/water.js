import { GameEntity } from '../models'
import { COLORS, DIRECTIONS, ENTITIES_TYPE } from '../../lib/constants'

export default class Water extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.damage = 100
        this.direction = DIRECTIONS.DOWN
        this.animation = this.animations.WAVES
        this.addLightSource(this.height, COLORS.WATER)
    }

    draw (ctx, scene) {
        if (scene.onScreen(this)) {
            const { camera, assets, map: { tilewidth, tileheight } } = scene
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
                        ctx.drawImage(assets[this.aid],
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

    collide (element, scene) {
        // restore the initial position of the item when it falls into the water
        if (element.family === ENTITIES_TYPE.ITEM) {
            element.restore(scene)
        }
    }

    update (scene) {
        if (scene.onScreen(this)) {
            this.sprite.animate(this.animation)
            if (this.fall) {
                this.fall = false
                this.y += 16
            }
        }
    }
}
