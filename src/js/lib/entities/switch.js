import { GameEntity } from '../models'
import {
    DIRECTIONS,
    ENTITIES_TYPE,
    LAYERS
} from '../../lib/constants'

export default class Switch extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.switched = false
        this.activated = false
    }

    update () {
        const { camera, player, overlay, scene, startTimeout } = this.game
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
                    scene.putTile(225, 23, 196, LAYERS.BACKGROUND2)
                    scene.putTile(226, 23, 229, LAYERS.BACKGROUND2)
                    scene.putTile(225, 24, 258, LAYERS.MAIN)
                    scene.putTile(226, 24, 259, LAYERS.MAIN)
                    scene.putTile(227, 24, 101, LAYERS.MAIN)
                    scene.putTile(225, 25, 129, LAYERS.MAIN)
                    scene.putTile(226, 25, 132, LAYERS.MAIN)
                    scene.putTile(227, 25, 130, LAYERS.MAIN)
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
                    scene.putTile(495, 75, 0, LAYERS.BACKGROUND2)
                    scene.putTile(496, 75, 0, LAYERS.BACKGROUND2)
                    scene.putTile(497, 75, 0, LAYERS.BACKGROUND2)
                    scene.putTile(498, 75, 0, LAYERS.BACKGROUND2)
                    scene.putTile(495, 76, 0, LAYERS.MAIN)
                    scene.putTile(496, 76, 0, LAYERS.MAIN)
                    scene.putTile(497, 76, 0, LAYERS.MAIN)
                    scene.putTile(498, 76, 0, LAYERS.MAIN)
                    scene.putTile(495, 76, 161, LAYERS.FOREGROUND1)
                    scene.putTile(498, 76, 161, LAYERS.FOREGROUND1)
                    scene.putTile(495, 77, 161, LAYERS.FOREGROUND1)
                    scene.putTile(498, 77, 161, LAYERS.FOREGROUND1)
                    scene.putTile(495, 78, 161, LAYERS.FOREGROUND1)
                    scene.putTile(498, 78, 161, LAYERS.FOREGROUND1)
                    scene.putTile(495, 79, 161, LAYERS.FOREGROUND1)
                    scene.putTile(498, 79, 161, LAYERS.FOREGROUND1)
                    scene.putTile(495, 79, 82, LAYERS.BACKGROUND2)
                    scene.putTile(496, 79, 82, LAYERS.BACKGROUND2)
                    scene.putTile(497, 79, 82, LAYERS.BACKGROUND2)
                    scene.putTile(498, 79, 82, LAYERS.BACKGROUND2)
                    scene.putTile(495, 80, 292, LAYERS.MAIN)
                    scene.putTile(496, 80, 293, LAYERS.MAIN)
                    scene.putTile(497, 80, 293, LAYERS.MAIN)
                    scene.putTile(498, 80, 294, LAYERS.MAIN)
                    scene.addObject({
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

        this.sprite.animate(this.switched
            ? this.animations.ON
            : this.animations.OFF
        )
    }

    interact () {
        const { player, scene, startTimeout } = this.game
        const { activator, anchor_hint } = this.properties

        if (player.canUse(activator)) {
            player.hideHint()
            player.useItem(activator)
            this.switched = true
            startTimeout('switch_wait', 500, () => {
                this.activated = true
            })
        }
        else if (!this.switched) {
            const item = scene.getObjectByProperty('id', activator, LAYERS.OBJECTS)
            player.moveItems()
            if (item) {
                anchor_hint
                    ? this.showHint([item])
                    : player.showHint([item])
            }
        }
    }
}
