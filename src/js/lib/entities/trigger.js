import { GameEntity } from '../models'
import { getItemById, isValidArray } from '../utils/helpers'
import { ENTITIES_TYPE, LAYERS, SCENES, PARTICLES } from '../constants'

export default class Trigger extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
        this.activated = false
    }

    collide (element) {
        const { anchor_hint, activator, message } = this.properties
        const { player } = this.game
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
                camera, overlay, player, scene, startTimeout
            } = this.game
            const {
                activator, clear, fade, follow, kill, goal, modify,
                particles, produce, related, reusable, shake
            } = this.properties

            if (related) {
                const rel = scene.getObjectById(related, LAYERS.OBJECTS)
                const item = player.useItem(activator)

                if (follow) {
                    camera.setFollow(rel)
                    camera.setMiddlePoint(
                        scene.resolutionX - scene.resolutionX / 2,
                        scene.resolutionY / 2
                    )
                    startTimeout('trigger_wait', 300, () => {
                        rel.activated = true
                        rel.trigger = this
                        rel.activator = item
                        modify && this.modifyLayer(modify)
                        startTimeout('trigger_wait_for_player', 1500, () => {
                            overlay.fadeIn()
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
            kill && scene.getObjectById(kill, LAYERS.OBJECTS).kill()
            shake && camera.shake()
            fade && overlay.fadeIn()
            !reusable && this.kill()

            if (particles) {
                const { map: { tilewidth } } = scene
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
                this.game.overlay.fadeOut()
                this.game.startTimeout('game_over', 2000, this.game.completed)
                this.game.startTimeout('restart', 10000, () => {
                    this.game.props.setScene(SCENES.INTRO)
                })
            }

            this.hideHint()
            this.hideMessage()

            player.hideHint()
            player.hideMessage()
        }
    }

    modifyLayer (modify) {
        const { scene } = this.game
        const matrix = JSON.parse(modify)
        isValidArray(matrix) && matrix.map(
            ([x, y, id, layer]) => id
                ? scene.putTile(x, y, id, layer)
                : scene.clearTile(x, y, layer)
        )
    }

    interact () {
        const { player } = this.game
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
        const { scene } = this.game
        const {
            map: {
                tilewidth,
                tileheight
            }
        } = scene

        for (let x = 0; x < Math.round(this.width / tilewidth); x++) {
            for (let y = 0; y < Math.round(this.height / tileheight); y++) {
                scene.clearTile(
                    Math.round((this.x + (x * tilewidth)) / tilewidth),
                    Math.round((this.y + (y * tileheight)) / tileheight),
                    layerId
                )
            }
        }
    }
}
