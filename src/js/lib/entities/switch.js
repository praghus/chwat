import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/entities'
import { INPUTS, LAYERS } from '../../lib/constants'

export default class Switch extends ActiveElement {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.animations = {
            OFF: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            ON: {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.animations.OFF
    }

    collide (element) {
        const { camera, overlay, input, player, world } = this._scene
        const activator = this.getProperty('activator')
        const hint = this.getProperty('hint')
        const offsetX = this.getProperty('offsetX')
        const offsetY = this.getProperty('offsetY')

        const triggered = !this.activated && input[INPUTS.INPUT_ACTION]

        if (element.type === ENTITIES_TYPE.PLAYER && !this.dead) {
            if (triggered) {
                if (player.canUse(activator)) {
                    player.useItem(activator)
                    const message = this.getProperty('message')
                    const produce = this.getProperty('produce')
                    this.activated = true
                    this.animation = this.animations.ON
                    switch (produce) {
                    case 'platform':
                        camera.setFollow({
                            x: 3600,
                            y: 384,
                            width: 32,
                            height: 16,
                            force: {
                                x: 0, y: 0
                            }
                        })
                        this._scene.startTimeout({
                            name: 'wait_for_camera',
                            duration: 500
                        }, () => {
                            world.put(LAYERS.BACKGROUND2, 225, 23, 196)
                            world.put(LAYERS.BACKGROUND2, 226, 23, 229)
                            world.put(LAYERS.MAIN, 225, 24, 258)
                            world.put(LAYERS.MAIN, 226, 24, 259)
                            world.put(LAYERS.MAIN, 227, 24, 101)
                            world.put(LAYERS.MAIN, 225, 25, 129)
                            world.put(LAYERS.MAIN, 226, 25, 132)
                            world.put(LAYERS.MAIN, 227, 25, 130)
                            camera.shake()
                            this._scene.startTimeout({
                                name: 'wait_for_player',
                                duration: 500
                            }, () => {
                                overlay.fadeIn()
                                camera.setFollow(player)
                                message && this.showMessage(message)
                            })
                        })

                        break
                    case 'lift':
                        camera.setFollow({
                            x: 7860,
                            y: 1210,
                            width: 64,
                            height: 64,
                            force: {
                                x: 0, y: 0
                            }
                        })
                        this._scene.startTimeout({
                            name: 'wait_for_camera',
                            duration: 500
                        }, () => {
                            world.put(LAYERS.BACKGROUND2, 495, 75, 0)
                            world.put(LAYERS.BACKGROUND2, 496, 75, 0)
                            world.put(LAYERS.BACKGROUND2, 497, 75, 0)
                            world.put(LAYERS.BACKGROUND2, 498, 75, 0)
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
                            world.put(LAYERS.BACKGROUND2, 495, 79, 82)
                            world.put(LAYERS.BACKGROUND2, 496, 79, 82)
                            world.put(LAYERS.BACKGROUND2, 497, 79, 82)
                            world.put(LAYERS.BACKGROUND2, 498, 79, 82)
                            world.put(LAYERS.MAIN, 495, 80, 292)
                            world.put(LAYERS.MAIN, 496, 80, 293)
                            world.put(LAYERS.MAIN, 497, 80, 293)
                            world.put(LAYERS.MAIN, 498, 80, 294)
                            camera.shake()
                            this._scene.startTimeout({
                                name: 'wait_for_player',
                                duration: 800
                            }, () => {
                                overlay.fadeIn()
                                camera.setFollow(player)
                                message && this.showMessage(message)
                            })
                        })
                    }
                }
                else if (hint && !player.hintTimeout) {
                    const [x, y] = [
                        offsetX ? this.x + parseFloat(offsetX) * world.spriteSize : this.x,
                        offsetY ? this.y + parseFloat(offsetY) * world.spriteSize : this.y
                    ]
                    this.showMessage(hint, x, y)
                }
            }
        }
    }
}
