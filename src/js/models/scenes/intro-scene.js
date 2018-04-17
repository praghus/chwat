import '../../lib/illuminated'
import Scene from '../scene'
import {ASSETS, COLORS, INPUTS, SCENES} from '../../lib/constants'

export default class IntroScene extends Scene {
    constructor (game) {
        super(game)
        this.backgroundScrollX = 0
    }

    update (nextProps) {
        super.update(nextProps)
        if (this.fetchAction(INPUTS.INPUT_ACTION)) {
            this.setScene(SCENES.GAME)
        }
    }

    draw (ctx) {
        const { assets, viewport } = this
        const { resolutionX, resolutionY, scale } = viewport

        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.fillStyle = COLORS.BLUE_SKY
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.drawImage(assets['bg6'], 0, 0)
        ctx.drawImage(assets[ASSETS.MOUNTAINS], -490, 0)
        ctx.drawImage(assets[ASSETS.LOGO], Math.ceil(resolutionX / 2) - 66, Math.ceil(resolutionY / 2) - 30)
        this.fontPrint('PRESS SPACE TO BEGIN', Math.ceil(resolutionX / 2) - 50, resolutionY - 10)(ctx)
        ctx.restore()
    }

    scrollBackground () {
        this.backgroundScrollX += 1
    }
}
