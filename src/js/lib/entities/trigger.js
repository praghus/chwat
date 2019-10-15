import { GameEntity } from '../models'
import { getItemById, isValidArray } from '../utils/helpers'
import { ENTITIES_TYPE, LAYERS, PARTICLES, SCENES } from '../constants'

export default class Trigger extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = false
        this.activated = false
    }

    collide (element, scene) {
        const { anchor_hint, activator, message } = this.properties
        const { player } = scene
        if (element.type === ENTITIES_TYPE.PLAYER) {
            if (activator === element.type) {
                this.interact(scene)
            }
            else if (message) {
                anchor_hint
                    ? this.showMessage(message, this.x, this.y)
                    : player.showMessage(message, this.x, this.y)
            }
        }
    }

    update (scene) {
        if (this.activated) {
            const {
                camera, player, resolutionX, resolutionY, map: { tilewidth }
            } = scene
            const {
                activator, clear, fade, follow, kill, goal, modify,
                particles, produce, related, reusable, shake
            } = this.properties

            if (related) {
                const rel = scene.getObjectById(related, LAYERS.OBJECTS)
                const item = player.useItem(activator)

                if (follow) {
                    camera.setFollow(rel)
                    camera.setMiddlePoint(resolutionX - resolutionX / 2, resolutionY / 2)
                    this.startTimeout('trigger_wait', 300, () => {
                        rel.activated = true
                        rel.trigger = this
                        rel.activator = item
                        modify && this.modifyLayer(modify, scene)
                        this.startTimeout('trigger_wait_for_player', 1500, () => {
                            scene.getLayer(LAYERS.OVERLAY).fadeIn()
                            camera.setFollow(player)
                        })
                    })
                }
                else {
                    rel.activated = true
                    rel.trigger = this
                    rel.activator = item
                    modify && this.modifyLayer(modify, scene)
                }
            }
            else if (modify) this.modifyLayer(modify, scene)

            produce && this.addItem(produce, this.x + 16, this.y + 16)
            clear && this.clearTiles(clear, scene)
            kill && scene.getObjectById(kill, LAYERS.OBJECTS).kill()
            shake && camera.shake()
            fade && scene.getLayer(LAYERS.OVERLAY).fadeIn()
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
                scene.getLayer(LAYERS.OVERLAY).fadeOut()
                this.startTimeout('game_over', 2000, player.gameCompleted(scene))
                this.startTimeout('restart', 10000, () => {
                    scene.properties.setScene(SCENES.INTRO)
                })
            }

            this.hideHint()
            this.hideMessage()

            player.hideHint()
            player.hideMessage()
            super.update(scene)
        }
    }

    modifyLayer (modify, scene) {
        const matrix = JSON.parse(modify)
        isValidArray(matrix) && matrix.map(
            ([x, y, id, layer]) => id
                ? scene.putTile(x, y, id, layer)
                : scene.clearTile(x, y, layer)
        )
    }

    interact (scene) {
        const { player } = scene
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

    clearTiles (layerId, scene) {
        const { player, map: { tilewidth, tileheight } } = scene
        for (let x = 0; x < Math.round(this.width / tilewidth); x++) {
            for (let y = 0; y < Math.round(this.height / tileheight); y++) {
                scene.clearTile(
                    Math.round((this.x + (x * tilewidth)) / tilewidth),
                    Math.round((this.y + (y * tileheight)) / tileheight),
                    layerId
                )
            }
        }
        player.onGround = false
    }
}
