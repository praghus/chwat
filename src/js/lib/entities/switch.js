import ActiveElement from '../models/active-element'
import {
    DIRECTIONS,
    ENTITIES_TYPE,
    LAYERS
} from '../../lib/constants'

export default class Switch extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.switched = false
        this.activated = false
        this.animation = this.animations.OFF
    }

    update () {
        const { camera, player, overlay, world, startTimeout } = this.game
        const { produce } = this.properties

        if (this.activated && !this.used) {
            switch (produce) {
            case 'platform':
                camera.setFollow({
                    x: 3600,
                    y: 384,
                    width: 32,
                    height: 16,
                    force: { x: 0, y: 0 }
                })
                startTimeout('switch_wait', 500, () => {
                    world.putTile(225, 23, 196, LAYERS.BACKGROUND2)
                    world.putTile(226, 23, 229, LAYERS.BACKGROUND2)
                    world.putTile(225, 24, 258, LAYERS.MAIN)
                    world.putTile(226, 24, 259, LAYERS.MAIN)
                    world.putTile(227, 24, 101, LAYERS.MAIN)
                    world.putTile(225, 25, 129, LAYERS.MAIN)
                    world.putTile(226, 25, 132, LAYERS.MAIN)
                    world.putTile(227, 25, 130, LAYERS.MAIN)
                    camera.shake()
                    startTimeout('wait_for_player', 500, () => {
                        overlay.fadeIn()
                        camera.setFollow(player)
                    })
                })
                break
            case 'lift':
                camera.setFollow({
                    x: 7860,
                    y: 1210,
                    width: 64,
                    height: 64,
                    force: { x: 0, y: 0 }
                })
                startTimeout('switch_wait', 500, () => {
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
                    world.addObject({
                        type: ENTITIES_TYPE.DUST,
                        x: 7904,
                        y: 1276,
                        direction: DIRECTIONS.RIGHT
                    }, LAYERS.OBJECTS)

                    camera.shake()
                    startTimeout('switch_wait', 500, () => {
                        overlay.fadeIn()
                        camera.setFollow(player)
                    })
                })
            }
            this.used = true
        }
    }

    interact () {
        const { player, world, startTimeout } = this.game
        const { activator, anchor_hint } = this.properties

        if (player.canUse(activator)) {
            player.hideHint()
            player.useItem(activator)
            this.switched = true
            this.animation = this.animations.ON
            startTimeout('switch_wait', 500, () => {
                this.activated = true
            })
        }
        else if (!this.switched) {
            const item = world.getObjectByProperty('id', activator, LAYERS.OBJECTS)
            player.moveItems()
            if (item) {
                anchor_hint
                    ? this.showHint(item)
                    : player.showHint(item)
            }
        }
    }
}
