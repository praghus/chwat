import Entity from '../entity'
import {ENTITIES_TYPE, INPUTS} from '../../lib/constants'

export default class Paddle extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.speed = 0.1
        this.maxSpeed = 1
        this.activated = false
    }
    draw (ctx) {
        const { assets, camera, world } = this._game
        const { spriteSize } = world
        for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
            ctx.drawImage(
                assets[this.asset],
                0, 0, spriteSize, spriteSize,
                Math.floor(this.x + camera.x) + (x * spriteSize), Math.floor(this.y + camera.y),
                spriteSize, spriteSize
            )
        }
    }

    collide (element) {
        if (!this.dead && element.solid && element.type !== ENTITIES_TYPE.BLOB) {
            const { input } = this._game
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

            if (element.type === ENTITIES_TYPE.PLAYER && element.canMove() && input[INPUTS.INPUT_UP]) {
                element.doJump = true
            }
        }
    }

    update () {
        if (this.activated && !this.dead) {
            const { spriteSize } = this._game.world
            const { destY } = this.properties
            if (this.y > destY * spriteSize) {
                this.force.y -= this.speed
                this.move()
            }
        }
    }
}
