import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/entities'
import { INPUTS, LAYERS } from '../../lib/constants'

export default class Switch extends ActiveElement {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.activated = false
        this.animations = {
            OFF: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            ON: {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.animations.OFF
    }

    collide (element) {
        const { camera, input, player, overlay, world } = this._scene
        const { activator, message, produce, hint, offsetX, offsetY } = this.properties
        const triggered = !this.activated && input[INPUTS.INPUT_ACTION]

        if (element.type === ENTITIES_TYPE.PLAYER && !this.dead) {
            if (triggered) {
                if (player.canUse(activator)) {
                    player.useItem(activator)
                    // const { message, produce } = this.properties
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
                            world.putTile(225, 23, 196, LAYERS.BACKGROUND2)
                            world.putTile(226, 23, 229, LAYERS.BACKGROUND2)
                            world.putTile(225, 24, 258, LAYERS.MAIN)
                            world.putTile(226, 24, 259, LAYERS.MAIN)
                            world.putTile(227, 24, 101, LAYERS.MAIN)
                            world.putTile(225, 25, 129, LAYERS.MAIN)
                            world.putTile(226, 25, 132, LAYERS.MAIN)
                            world.putTile(227, 25, 130, LAYERS.MAIN)
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
                            world.putTile(495, 75, 0, LAYERS.BACKGROUND2)
                            world.putTile(496, 75, 0, LAYERS.BACKGROUND2)
                            world.putTile(497, 75, 0, LAYERS.BACKGROUND2)
                            world.putTile(498, 75, 0, LAYERS.BACKGROUND2)
                            world.putTile(495, 76, 0, LAYERS.MAIN)
                            world.putTile(496, 76, 0, LAYERS.MAIN)
                            world.putTile(497, 76, 0, LAYERS.MAIN)
                            world.putTile(498, 76, 0, LAYERS.MAIN)
                            world.putTile(495, 76, 161, LAYERS.FOREGROUND1)
                            world.putTile(498, 76, 161, LAYERS.FOREGROUND1)
                            world.putTile(495, 77, 161, LAYERS.FOREGROUND1)
                            world.putTile(498, 77, 161, LAYERS.FOREGROUND1)
                            world.putTile(495, 78, 161, LAYERS.FOREGROUND1)
                            world.putTile(498, 78, 161, LAYERS.FOREGROUND1)
                            world.putTile(495, 79, 161, LAYERS.FOREGROUND1)
                            world.putTile(498, 79, 161, LAYERS.FOREGROUND1)
                            world.putTile(495, 79, 82, LAYERS.BACKGROUND2)
                            world.putTile(496, 79, 82, LAYERS.BACKGROUND2)
                            world.putTile(497, 79, 82, LAYERS.BACKGROUND2)
                            world.putTile(498, 79, 82, LAYERS.BACKGROUND2)
                            world.putTile(495, 80, 292, LAYERS.MAIN)
                            world.putTile(496, 80, 293, LAYERS.MAIN)
                            world.putTile(497, 80, 293, LAYERS.MAIN)
                            world.putTile(498, 80, 294, LAYERS.MAIN)
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
