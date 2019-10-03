import { GameEntity } from '../models'
import { getItemById, isValidArray } from '../utils/helpers'
import { ENTITIES_TYPE, LAYERS, PARTICLES, SCENES } from '../constants'

export default class Trigger extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        this.activated = false
    }

    collide (element) {
        const { anchor_hint, activator, message } = this.properties
        const { player } = this.scene
        if (element.type === ENTITIES_TYPE.PLAYER) {
            if (activator === element.type) {
                this.interact()
            }
            else if (message) {
                anchor_hint
                    ? this.showMessage(message, this.x, this.y)
                    : player.showMessage(message, this.x, this.y)
            }
        }
    }

    update () {
        if (this.activated) {
            const {
                camera, player, resolutionX, resolutionY, map: { tilewidth }
            } = this.scene
            const {
                activator, clear, fade, follow, kill, goal, modify,
                particles, produce, related, reusable, shake
            } = this.properties

            if (related) {
                const rel = this.scene.getObjectById(related, LAYERS.OBJECTS)
                const item = player.useItem(activator)

                if (follow) {
                    camera.setFollow(rel)
                    camera.setMiddlePoint(resolutionX - resolutionX / 2, resolutionY / 2)
                    this.scene.startTimeout('trigger_wait', 300, () => {
                        rel.activated = true
                        rel.trigger = this
                        rel.activator = item
                        modify && this.modifyLayer(modify)
                        this.scene.startTimeout('trigger_wait_for_player', 1500, () => {
                            this.scene.getLayer(LAYERS.OVERLAY).fadeIn()
                            camera.setFollow(player)
                            player.cameraFollow()
                        })
                    })
                }
                else {
                    rel.activated = true
                    rel.trigger = this
                    rel.activator = item
                    modify && this.modifyLayer(modify)
                }
            }
            else if (modify) this.modifyLayer(modify)

            produce && this.addItem(produce, this.x + 16, this.y + 16)
            clear && this.clearTiles(clear)
            kill && this.scene.getObjectById(kill, LAYERS.OBJECTS).kill()
            shake && camera.shake()
            fade && this.scene.getLayer(LAYERS.OVERLAY).fadeIn()
            !reusable && this.kill()

            if (particles) {
                for (let px = 0; px < this.width / tilewidth; px++) {
                    this.emitParticles(
                        PARTICLES.STONE,
                        this.x + px * tilewidth,
                        this.y + (this.height / 2),
                        2,
                        16
                    )
                }
            }

            if (goal) {
                this.scene.getLayer(LAYERS.OVERLAY).fadeOut()
                this.scene.startTimeout('game_over', 2000, player.gameCompleted())
                this.scene.startTimeout('restart', 10000, () => {
                    this.scene.setScene(SCENES.INTRO)
                })
            }

            this.hideHint()
            this.hideMessage()

            player.hideHint()
            player.hideMessage()
        }
    }

    modifyLayer (modify) {
        const matrix = JSON.parse(modify)
        isValidArray(matrix) && matrix.map(
            ([x, y, id, layer]) => id
                ? this.scene.putTile(x, y, id, layer)
                : this.scene.clearTile(x, y, layer)
        )
    }

    interact () {
        const { player } = this.scene
        const { activator, anchor_hint } = this.properties
        if (player.canUse(activator)) {
            player.hideHint()
            player.useItem(activator)
            this.activated = true
        }
        else if (!this.activated) {
            const item = getItemById(activator)
            // player.moveItems()
            if (item) {
                anchor_hint
                    ? this.showHint([item])
                    : player.showHint([item])
            }
        }
    }

    clearTiles (layerId) {
        const {
            map: {
                tilewidth,
                tileheight
            }
        } = this.scene

        for (let x = 0; x < Math.round(this.width / tilewidth); x++) {
            for (let y = 0; y < Math.round(this.height / tileheight); y++) {
                this.scene.clearTile(
                    Math.round((this.x + (x * tilewidth)) / tilewidth),
                    Math.round((this.y + (y * tileheight)) / tileheight),
                    layerId
                )
            }
        }
    }
}
