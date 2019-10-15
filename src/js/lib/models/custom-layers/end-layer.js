import { Layer } from 'tiled-platformer-lib'
import { COLORS, LAYERS, ASSETS } from '../../constants'

export default class EndLayer extends Layer {
    constructor (scene) {
        super(scene)
        this.id = LAYERS.THE_END
        this.blackOverlay = 1
    }

    update () {
        if (this.blackOverlay > 0) {
            this.blackOverlay -= 0.01
        }
    }

    draw (ctx, scene) {
        const { assets, resolutionX, resolutionY } = scene
        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.drawImage(assets[ASSETS.THE_END],
            Math.ceil(resolutionX / 2) - 80,
            Math.ceil(resolutionY / 2) - 60
        )
        if (this.blackOverlay > 0) {
            ctx.globalAlpha = this.blackOverlay
            ctx.fillRect(0, 0, resolutionX, resolutionY)
        }
    }
}
