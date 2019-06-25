import ActiveElement from '../models/active-element'
import { DIRECTIONS, ENTITIES_TYPE } from '../../lib/constants'

export default class Water extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 100
        this.wave = 0
        this.direction = DIRECTIONS.DOWN
        this.animation = this.animations.WAVES
    }

    draw () {
        if (this.onScreen()) {
            const { ctx, camera, world, props: { assets } } = this.game
            const { canFall } = this.properties
            const { spriteSize } = world
            const [posX, posY, pW, pH] = [
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y),
                Math.round(this.width / spriteSize),
                Math.round(this.height / spriteSize)
            ]
            for (let y = 0; y < pH; y++) {
                for (let x = 0; x < pW; x++) {
                    const PX = Math.round((this.x + (x * spriteSize)) / spriteSize)
                    const PY = Math.round((this.y + (y * spriteSize)) / spriteSize)
                    if (!world.isSolidArea(PX, PY, this.collisionLayers)) {
                        ctx.drawImage(assets[this.asset],
                            y === 0 ? this.animation.frames[this.animFrame][0] : 0,
                            y === 0 ? this.animation.frames[this.animFrame][1] : 32,
                            spriteSize, spriteSize,
                            posX + (x * spriteSize), posY + (y * spriteSize),
                            spriteSize, spriteSize
                        )
                    }
                    if (!world.isSolidArea(PX, PY + 1, this.collisionLayers) && canFall && y + 1 === pH) {
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
            this.animate()
            if (this.fall) {
                this.fall = false
                this.y += 16
            }
        }
    }
}
