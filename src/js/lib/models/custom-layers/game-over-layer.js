import { Layer } from 'tiled-platformer-lib'
import { COLORS, FONTS, LAYERS, ASSETS } from '../../constants'

export default class GameOverLayer extends Layer {
    constructor (game) {
        super(game)
        this.game = game
        this.id = LAYERS.GAME_OVER
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
        ctx.drawImage(assets[ASSETS.GAME_OVER], Math.ceil(resolutionX / 2) - 36, Math.ceil(resolutionY / 2) - 54)

        overlay.displayText('GAME OVER', Math.ceil(resolutionX / 2) - 36, resolutionY - 16, FONTS.FONT_NORMAL)

        if (this.blackOverlay > 0) {
            ctx.globalAlpha = this.blackOverlay
            ctx.fillRect(0, 0, resolutionX, resolutionY)
        }
    }
}
