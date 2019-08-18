import { Layer } from 'tiled-platformer-lib'
import { COLORS, LAYERS, ASSETS } from '../../constants'

export default class EndLayer extends Layer {
    constructor (game) {
        super(game)
        this.game = game
        this.id = LAYERS.THE_END
        this.blackOverlay = 1
    }

    update () {
        if (this.blackOverlay > 0) {
            this.blackOverlay -= 0.01
        }
    }

    draw () {
        const {
            ctx,
            overlay,
            scene: {
                assets,
                resolutionX,
                resolutionY
            }
        } = this.game

        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.drawImage(assets[ASSETS.THE_END], Math.ceil(resolutionX / 2) - 80, Math.ceil(resolutionY / 2) - 64)

        overlay.displayText('PRESS ANY KEY TO RETURN', Math.ceil(resolutionX / 2) - 60, resolutionY - 10)

        if (this.blackOverlay > 0) {
            ctx.globalAlpha = this.blackOverlay
            ctx.fillRect(0, 0, resolutionX, resolutionY)
        }
    }
}
