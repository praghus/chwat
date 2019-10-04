import { GameEntity } from '../models'
import {
    DIRECTIONS,
    ENTITIES_TYPE,
    LAYERS,
    SOUNDS
} from '../../lib/constants'

export default class Switch extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.switched = false
        this.activated = false
    }

    update () {
        const { camera, resolutionX, resolutionY } = this.scene
        const { produce } = this.properties

        if (this.activated && !this.used) {
            camera.setMiddlePoint(resolutionX / 2, resolutionY / 2)
            switch (produce) {
            case 'platform':
                camera.setFollow({
                    x: 3600,
                    y: 384,
                    width: 32,
                    height: 16,
                    force: { x: 0, y: 0 }
                })
                this.scene.startTimeout('switch_wait', 500, () => {
                    this.scene.putTile(225, 23, 196, LAYERS.BACKGROUND2)
                    this.scene.putTile(226, 23, 229, LAYERS.BACKGROUND2)
                    this.scene.putTile(225, 24, 258, LAYERS.MAIN)
                    this.scene.putTile(226, 24, 259, LAYERS.MAIN)
                    this.scene.putTile(227, 24, 101, LAYERS.MAIN)
                    this.scene.putTile(225, 25, 129, LAYERS.MAIN)
                    this.scene.putTile(226, 25, 132, LAYERS.MAIN)
                    this.scene.putTile(227, 25, 130, LAYERS.MAIN)
                    this.focusOnPlayer()
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
                this.scene.startTimeout('switch_wait', 500, () => {
                    this.scene.clearTile(495, 75, LAYERS.BACKGROUND2)
                    this.scene.clearTile(496, 75, LAYERS.BACKGROUND2)
                    this.scene.clearTile(497, 75, LAYERS.BACKGROUND2)
                    this.scene.clearTile(498, 75, LAYERS.BACKGROUND2)
                    this.scene.clearTile(495, 75, LAYERS.MAIN)
                    this.scene.clearTile(496, 75, LAYERS.MAIN)
                    this.scene.clearTile(497, 75, LAYERS.MAIN)
                    this.scene.clearTile(498, 75, LAYERS.MAIN)
                    this.scene.clearTile(495, 76, LAYERS.MAIN)
                    this.scene.clearTile(496, 76, LAYERS.MAIN)
                    this.scene.clearTile(497, 76, LAYERS.MAIN)
                    this.scene.clearTile(498, 76, LAYERS.MAIN)
                    this.scene.putTile(495, 76, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(498, 76, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(495, 77, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(498, 77, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(495, 78, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(498, 78, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(495, 79, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(498, 79, 161, LAYERS.FOREGROUND1)
                    this.scene.putTile(495, 80, 292, LAYERS.MAIN)
                    this.scene.putTile(496, 80, 293, LAYERS.MAIN)
                    this.scene.putTile(497, 80, 293, LAYERS.MAIN)
                    this.scene.putTile(498, 80, 294, LAYERS.MAIN)
                    this.scene.putTile(495, 80, 292, LAYERS.FOREGROUND1)
                    this.scene.putTile(496, 80, 293, LAYERS.FOREGROUND1)
                    this.scene.putTile(497, 80, 293, LAYERS.FOREGROUND1)
                    this.scene.putTile(498, 80, 294, LAYERS.FOREGROUND1)
                    this.scene.addObject({
                        type: ENTITIES_TYPE.DUST,
                        x: 7904,
                        y: 1276,
                        direction: DIRECTIONS.RIGHT
                    }, LAYERS.OBJECTS)
                    this.focusOnPlayer()
                })
            }

            this.used = true
            camera.shake()
        }

        const defaultAnimation = produce === 'lift'
            ? this.animations.BROKEN
            : this.animations.OFF

        this.sprite.animate(this.switched
            ? this.animations.ON
            : defaultAnimation
        )
    }

    focusOnPlayer () {
        const { camera, player } = this.scene
        const overlay = this.scene.getLayer(LAYERS.OVERLAY)

        this.scene.startTimeout('switch_focus_on_player', 500, () => {
            overlay.fadeIn()
            camera.setFollow(player)
            player.cameraFollow()
        })
    }

    interact () {
        const { player, properties: { sfx } } = this.scene
        const { activator, anchor_hint } = this.properties

        if (player.canUse(activator)) {
            player.hideHint()
            player.useItem(activator)
            !this.switched && sfx(SOUNDS.SWITCH)
            this.switched = true
            this.scene.startTimeout('switch_wait', 500, () => {
                this.activated = true
            })
        }
        else if (!this.switched) {
            const item = this.scene.getObjectByProperty('id', activator, LAYERS.OBJECTS)
            player.moveItems()
            if (item) {
                anchor_hint
                    ? this.showHint([item])
                    : player.showHint([item])
            }
        }
    }
}
