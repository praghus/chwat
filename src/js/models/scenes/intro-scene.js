import '../../lib/illuminated'
import Scene from '../scene'

export default class IntroScene extends Scene {
    constructor (game) {
        super(game)
        this.dynamicLights = true
        this.lightmask = []
    }

    draw () {
        const { assets, ctx, viewport } = this._scene
        const { resolutionX, resolutionY, scale } = viewport

        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, resolutionX, resolutionY)
        ctx.drawImage(assets['splash'], 0, 0, resolutionX, resolutionY)
        ctx.restore()
    }
}
