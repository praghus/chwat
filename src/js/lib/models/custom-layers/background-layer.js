import { Layer } from 'tiled-platformer-lib'
import { ASSETS, COLORS, LAYERS } from '../../constants'

export default class BackgroundLayer extends Layer {
    constructor (game) {
        super(game)
        this.game = game
        this.id = LAYERS.CUSTOM_BACKGROUND
    }

    draw () {
        const {
            ctx,
            camera,
            player,
            scene: {
                assets,
                resolutionX,
                resolutionY
            }
        } = this.game

        if (!camera.underground && !player.inDark) {
            const offsetX = camera.x + 3300
            const fogBorder = 600

            ctx.fillStyle = COLORS.BLUE_SKY
            ctx.fillRect(0, 0, resolutionX, resolutionY)

            if (offsetX < 0) {
                ctx.drawImage(assets[ASSETS.MOUNTAINS], offsetX / 15, 278 + camera.y / 2)
                ctx.drawImage(assets[ASSETS.FAR_FOREST], offsetX / 10, 112 + camera.y / 2)
                ctx.drawImage(assets[ASSETS.FOREST], offsetX / 5, 270 + camera.y / 2)

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
