import { GameEntity } from '../models'
import { overlap } from '../../lib/utils/helpers'

export default class DarkMask extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.active = false
        this.activated = false
        this.visible = false
    }

    update () {
        const { player, scene } = this.game
        if (this.onScreen()) {
            if (overlap(player, this)) {
                this.active = true
                if (!this.activated) {
                    player.inDark += 1
                    this.activated = true
                    if (this.properties) {
                        if (this.properties.showLayer) {
                            scene.showLayer(this.properties.showLayer)
                        }
                        else if (this.properties.hideLayer) {
                            scene.hideLayer(this.properties.hideLayer)
                        }
                    }
                }
            }
            else this.deactivate()
        }
        else this.deactivate()
    }

    deactivate () {
        const { player } = this.game
        if (this.active) {
            player.inDark -= 1
            this.activated = false
            this.active = false
        }
    }
}
