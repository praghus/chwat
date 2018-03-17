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
            switch (produce) {
            case 'platform':
                world.put(LAYERS.MAIN, 225, 24, 258)
                world.put(LAYERS.MAIN, 226, 24, 259)
                world.put(LAYERS.MAIN, 227, 24, 101)
                world.put(LAYERS.MAIN, 225, 25, 129)
                world.put(LAYERS.MAIN, 226, 25, 132)
                world.put(LAYERS.MAIN, 227, 25, 130)
                break
            case 'lift':
                world.put(LAYERS.MAIN, 495, 76, 0)
                world.put(LAYERS.MAIN, 496, 76, 0)
                world.put(LAYERS.MAIN, 497, 76, 0)
                world.put(LAYERS.MAIN, 498, 76, 0)
                world.put(LAYERS.FOREGROUND1, 495, 76, 161)
                world.put(LAYERS.FOREGROUND1, 498, 76, 161)
                world.put(LAYERS.FOREGROUND1, 495, 77, 161)
                world.put(LAYERS.FOREGROUND1, 498, 77, 161)
                world.put(LAYERS.FOREGROUND1, 495, 78, 161)
                world.put(LAYERS.FOREGROUND1, 498, 78, 161)
                world.put(LAYERS.FOREGROUND1, 495, 79, 161)
                world.put(LAYERS.FOREGROUND1, 498, 79, 161)
                world.put(LAYERS.MAIN, 495, 80, 292)
                world.put(LAYERS.MAIN, 496, 80, 293)
                world.put(LAYERS.MAIN, 497, 80, 293)
                world.put(LAYERS.MAIN, 498, 80, 294)
                break
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
