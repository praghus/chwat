import Entity from '../entity'
import { overlap } from '../../lib/helpers'

export default class DarkMask extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.active = false
        this.activated = false
        this.visible = false
    }

    update () {
        const { player } = this._game
        if (this.onScreen()) {
            if (overlap(player, this)) {
                this.active = true
                if (!this.activated) {
                    player.inDark += 1
                    this.activated = true
                }
            }
            else this.deactivate()
        }
        else this.deactivate()
    }

    deactivate () {
        const { player } = this._game
        if (this.active) {
            player.inDark -= 1
            this.activated = false
            this.active = false
        }
    }
}
