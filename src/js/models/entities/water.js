import Entity from '../entity'
import { DIRECTIONS } from '../../lib/constants'

export default class Water extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 100
        this.wave = 0
        this.animation = {x: 0, y: 0, w: 16, h: 16, frames: 7, fps: 20, loop: true}
        this.direction = DIRECTIONS.DOWN
    }

    draw (ctx) {
        const { assets, camera, world } = this._game
        const { spriteSize } = world

        for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
            for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
                const PX = Math.round((this.x + (x * spriteSize)) / spriteSize)
                const PY = Math.round((this.y + (y * spriteSize)) / spriteSize)
                if (this.properties.selective || !this._game.world.isSolid(PX, PY)) {
                    ctx.drawImage(assets[this.asset],
                        this.animFrame * spriteSize, y === 0 ? y + this.wave : spriteSize,
                        spriteSize, spriteSize,
                        Math.floor(this.x + camera.x) + (x * spriteSize),
                        Math.floor(this.y + camera.y) + (y * spriteSize),
                        spriteSize, spriteSize
                    )
                }
                if (
                    this.properties.canFall &&
                    y + 1 === Math.round(this.height / spriteSize) &&
                    !world.isSolid(PX, PY + 1)
                ) {
                    this.fall = true
                }
            }
        }
        if (this.fall) {
            this.fall = false
            this.y += 16
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
        }
    }
}
