import { Layer } from 'tiled-platformer-lib'
import { ASSETS, COLORS, LAYERS } from '../../constants'

export default class BackgroundLayer extends Layer {
    constructor (scene) {
        super(scene)
        this.id = LAYERS.CUSTOM_BACKGROUND
    }

    draw (ctx, scene) {
        const {
            player,
            camera,
            assets,
            resolutionX,
            resolutionY
        } = scene

        if (camera.y > -740 && !player.inDark) {
            const offsetX = camera.x + 3000
            const offsetY = camera.y / 2
            const fogBorder = 600

            ctx.fillStyle = COLORS.BLUE_SKY
            ctx.fillRect(0, 0, resolutionX, resolutionY)

            if (offsetX < 0) {
                ctx.drawImage(assets[ASSETS.MOUNTAINS], offsetX / 15, 278 + offsetY)
                ctx.drawImage(assets[ASSETS.FAR_FOREST], offsetX / 10, 122 + offsetY)
                ctx.drawImage(assets[ASSETS.FOREST], offsetX / 5, 270 + offsetY)
                if (camera.y > -fogBorder) {
                    ctx.save()
                    ctx.globalAlpha = ((fogBorder + camera.y) / fogBorder).toFixed(2) * 2
                    ctx.fillRect(0, 0, resolutionX, resolutionY)
                    ctx.restore()
                }
            }
            else {
                ctx.drawImage(assets[ASSETS.SKY], 0, 0, resolutionX, resolutionY)
            }
        }
    }
}
