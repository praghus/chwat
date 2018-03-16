import Entity from '../entity'
import {ENTITIES_TYPE, INPUTS, LAYERS} from '../../lib/constants'

export default class Switch extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.activated = false
        this.animations = {
            OFF: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            ON: {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.animations.OFF
        this.messageDuration = 4000
    }

    collide (element) {
        const { camera, input, world } = this._game
        if (!this.activated && input[INPUTS.INPUT_ACTION] && element.type === ENTITIES_TYPE.PLAYER) {
            const { message, offsetX, offsetY, produce } = this.properties
            this.activated = true
            this.animation = this.animations.ON
            if (produce) {
                world.put(LAYERS.MAIN, 225, 24, 258)
                world.put(LAYERS.MAIN, 226, 24, 259)
                world.put(LAYERS.MAIN, 227, 24, 101)
                world.put(LAYERS.MAIN, 225, 25, 129)
                world.put(LAYERS.MAIN, 226, 25, 132)
                world.put(LAYERS.MAIN, 227, 25, 130)
            }
            if (message) {
                const [x, y] = [
                    offsetX ? this.x + offsetX * world.spriteSize : this.x,
                    offsetY ? this.y + offsetY * world.spriteSize : this.y
                ]
                this.showMessage(message, x, y)
            }
            camera.shake()
        }
    }
}
