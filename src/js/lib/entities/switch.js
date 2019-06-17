import ActiveElement from '../models/active-element'
import {
    DIRECTIONS,
    ENTITIES_TYPE,
    INPUTS,
    LAYERS
} from '../../lib/constants'

export default class Switch extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.activated = false
        this.animations = {
            OFF: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            ON: {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.animations.OFF
    }

    collide (element) {
        const { camera, props: { input }, player, overlay, world } = this.game
        const { activator, message, produce, hint, offsetX, offsetY } = this.properties
        const triggered = !this.activated && input.keyPressed[INPUTS.INPUT_ACTION]

        if (element.type === ENTITIES_TYPE.PLAYER && !this.dead) {
            if (triggered) {
                if (player.canUse(activator)) {
                    player.useItem(activator)
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
                        this.game.startTimeout({
                            name: 'wait_for_camera',
                            duration: 500
                        }, () => {
                            this.game.addTile(225, 23, 196, LAYERS.BACKGROUND2)
                            this.game.addTile(226, 23, 229, LAYERS.BACKGROUND2)
                            this.game.addTile(225, 24, 258, LAYERS.MAIN)
                            this.game.addTile(226, 24, 259, LAYERS.MAIN)
                            this.game.addTile(227, 24, 101, LAYERS.MAIN)
                            this.game.addTile(225, 25, 129, LAYERS.MAIN)
                            this.game.addTile(226, 25, 132, LAYERS.MAIN)
                            this.game.addTile(227, 25, 130, LAYERS.MAIN)
                            camera.shake()
                            this.game.startTimeout({
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
                        this.game.startTimeout({
                            name: 'wait_for_camera',
                            duration: 500
                        }, () => {
                            this.game.addTile(495, 75, 0, LAYERS.BACKGROUND2)
                            this.game.addTile(496, 75, 0, LAYERS.BACKGROUND2)
                            this.game.addTile(497, 75, 0, LAYERS.BACKGROUND2)
                            this.game.addTile(498, 75, 0, LAYERS.BACKGROUND2)
                            this.game.addTile(495, 76, 0, LAYERS.MAIN)
                            this.game.addTile(496, 76, 0, LAYERS.MAIN)
                            this.game.addTile(497, 76, 0, LAYERS.MAIN)
                            this.game.addTile(498, 76, 0, LAYERS.MAIN)
                            this.game.addTile(495, 76, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(498, 76, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(495, 77, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(498, 77, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(495, 78, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(498, 78, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(495, 79, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(498, 79, 161, LAYERS.FOREGROUND1)
                            this.game.addTile(495, 79, 82, LAYERS.BACKGROUND2)
                            this.game.addTile(496, 79, 82, LAYERS.BACKGROUND2)
                            this.game.addTile(497, 79, 82, LAYERS.BACKGROUND2)
                            this.game.addTile(498, 79, 82, LAYERS.BACKGROUND2)
                            this.game.addTile(495, 80, 292, LAYERS.MAIN)
                            this.game.addTile(496, 80, 293, LAYERS.MAIN)
                            this.game.addTile(497, 80, 293, LAYERS.MAIN)
                            this.game.addTile(498, 80, 294, LAYERS.MAIN)
                            world.addObject({
                                type: ENTITIES_TYPE.DUST,
                                x: 7904,
                                y: 1276,
                                direction: DIRECTIONS.RIGHT
                            }, LAYERS.OBJECTS)

                            camera.shake()
                            this.game.startTimeout({
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
