import '../../lib/illuminated'
import Scene from '../scene'
import {ASSETS, COLORS, FONTS, INPUTS, SCENES} from '../../lib/constants'

export default class IntroScene extends Scene {
    update (nextProps) {
        super.update(nextProps)
        if (this.fetchAction(INPUTS.INPUT_ACTION)) {
            this.setScene(SCENES.GAME)
        }
    }

    draw (ctx) {
        const { assets, viewport } = this
        const { resolutionX, resolutionY, scale } = viewport
        // 270
        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.fillStyle = COLORS.BLUE_SKY
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.drawImage(assets['bg6'], 0, 0)
        ctx.drawImage(assets[ASSETS.FAR_FOREST], 0, -10)
        ctx.drawImage(assets[ASSETS.FOREST], -100, -300)
        ctx.drawImage(assets[ASSETS.LOGO], Math.ceil(resolutionX / 2) - 66, Math.ceil(resolutionY / 2) - 30)
        this.fontPrint(ctx, 'PRESS SPACE TO BEGIN', Math.ceil(resolutionX / 2) - 50, resolutionY - 70, FONTS.FONT_SMALL)
        ctx.restore()
    }
}
