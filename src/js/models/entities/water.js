import Entity from '../entity'
import { DIRECTIONS } from '../../lib/constants'
import { ENTITIES_FAMILY } from '../../lib/entities'

export default class Water extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.damage = 100
        this.wave = 0
        this.animation = {x: 0, y: 0, w: 16, h: 16, frames: 7, fps: 20, loop: true}
        this.direction = DIRECTIONS.DOWN
    }

    draw () {
        const { assets, ctx, camera, world } = this._scene
        const { canFall, selective } = this.properties
        const { spriteSize } = world
        const [posX, posY] = [
            Math.floor(this.x + camera.x),
            Math.floor(this.y + camera.y)
        ]
        for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
            for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
                const PX = Math.round((this.x + (x * spriteSize)) / spriteSize)
                const PY = Math.round((this.y + (y * spriteSize)) / spriteSize)
                if (selective || !world.isSolid(PX, PY)) {
                    ctx.drawImage(assets[this.asset],
                        this.animFrame * spriteSize, y === 0 ? y + this.wave : spriteSize,
                        spriteSize, spriteSize,
                        posX + (x * spriteSize),
                        posY + (y * spriteSize),
                        spriteSize, spriteSize
                    )
                }
                if (
                    canFall && !world.isSolid(PX, PY + 1) &&
                    y + 1 === Math.round(this.height / spriteSize)
                ) {
                    this.fall = true
                }
            }
        }
    }

    collide (element) {
        // restore the initial position of the item
        // when it falls into the water
        if (element.family === ENTITIES_FAMILY.ITEMS) {
            element.restore()
        }
    }

    update () {
        if (this.onScreen()) {
            this.animate()
            if (this.animFrame === 5) {
                this.wave += this.direction === DIRECTIONS.DOWN ? 0.5 : -0.5
            }
            if (this.wave > 2) {
                this.direction = DIRECTIONS.UP
            }
            if (this.wave < -2) {
                this.direction = DIRECTIONS.DOWN
            }
            if (this.fall) {
                this.fall = false
                this.y += 16
            }
        }
    }
}
