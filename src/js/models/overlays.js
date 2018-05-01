import {
    ASSETS, COLORS, FONTS
} from '../lib/constants'

export default class Overlays {
    constructor (scene) {
        this._scene = scene
        this.blackOverlay = 0
        this.fade = {
            in: false,
            out: false
        }
        this.fadeIn = () => {
            if (!this.fade.in) {
                this.blackOverlay = 1
                this.fade.in = true
                this.fade.out = false
            }
        }
        this.fadeOut = () => {
            if (!this.fade.out) {
                this.blackOverlay = 0
                this.fade.in = false
                this.fade.out = true
            }
        }
    }

    update () {
        if (this.blackOverlay > 0) {
            const { ctx, viewport } = this._scene
            const { resolutionX, resolutionY } = viewport

            ctx.globalAlpha = this.blackOverlay
            ctx.fillStyle = COLORS.BLACK
            ctx.fillRect(0, 0, resolutionX, resolutionY)
        }
        if (this.fade.in) {
            this.blackOverlay -= 0.01
        }
        if (this.fade.out) {
            this.blackOverlay += 0.01
        }
    }

    displayHUD () {
        const { ctx, camera, assets, debug, fps, player, viewport } = this._scene
        const { resolutionX, resolutionY } = viewport
        const { energy, items, lives } = player
        const fpsIndicator = `FPS:${Math.round(fps)}`

        // FPS meter
        this.displayText(fpsIndicator, resolutionX - (3 + fpsIndicator.length * 5), 3)

        // Camera position in debug mode
        debug && this.displayText(`CAMERA\nx:${Math.floor(camera.x)}\ny:${Math.floor(camera.y)}`, 4, 28)

        // lives and energy
        const indicatorWidth = energy && Math.round(energy / 2) || 1
        ctx.drawImage(assets[ASSETS.HEAD], 3, 2)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 5, 50, 5, 12, 3, 50, 5)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 0, indicatorWidth, 5, 12, 3, indicatorWidth, 5)
        this.displayText(`${lives}`, 12, 8)

        // items
        const align = (resolutionX - 60)
        ctx.drawImage(assets[ASSETS.FRAMES], align, resolutionY - 26)
        items.map((item, index) => {
            if (item && item.properties) {
                this.displayText(item.name, 4, (resolutionY - 20) + index * 9)
                ctx.drawImage(
                    assets[ASSETS.ITEMS],
                    item.animation.x, item.animation.y,
                    item.width, item.height,
                    align + 12 + (index * 25), resolutionY - 22,
                    item.width, item.height
                )
            }
        })
    }

    displayHint () {
        const { ctx, assets, camera, player } = this._scene
        const { animation, animFrame } = player.hint
        ctx.drawImage(assets[ASSETS.BUBBLE],
            Math.floor(player.x + camera.x + player.width / 2),
            Math.floor(player.y + camera.y) - 24
        )
        ctx.drawImage(assets[ASSETS.ITEMS],
            animation.x + animFrame * animation.w, animation.y,
            animation.w, animation.h,
            Math.floor(player.x + camera.x + player.width / 2) + 8,
            Math.floor(player.y + camera.y) - 22,
            animation.w, animation.h
        )
    }

    displayMap () {
        const { ctx, assets, player, viewport } = this._scene
        const { resolutionX, resolutionY } = viewport
        ctx.save()
        ctx.globalAlpha = 0.5
        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.restore()
        player.mapPieces.map((piece) => {
            ctx.drawImage(assets[ASSETS.MAP_PIECE],
                piece.x, piece.y,
                piece.w, piece.h,
                Math.floor((resolutionX / 2) + (piece.x * 2) - 48),
                Math.floor((resolutionY / 2) + (piece.y * 2) - 32),
                piece.w * 2, piece.h * 2
            )
        })
        this.displayText('COLLECTED MAP PIECES',
            (resolutionX / 2) - 49,
            (resolutionY / 2) - 42,
        )
    }

    displayText (text, x, y, font = FONTS.FONT_SMALL) {
        const { assets, ctx } = this._scene
        text.split('\n').reverse().map((output, index) => {
            for (let i = 0; i < output.length; i++) {
                const chr = output.charCodeAt(i)
                ctx.drawImage(assets[font.name],
                    ((chr) % 16) * font.size, Math.ceil(((chr + 1) / 16) - 1) * font.size,
                    font.size, font.size,
                    Math.floor(x + (i * font.size)), Math.floor(y - (index * (font.size + 1))),
                    font.size, font.size
                )
            }
        })
    }

    displayDebug (entity) {
        const { ctx, camera } = this._scene
        const { bounds, width, height, name, type, visible, force } = entity
        const [ posX, posY ] = [
            Math.floor(entity.x + camera.x),
            Math.floor(entity.y + camera.y)
        ]
        if (entity.vectorMask) {
            ctx.save()
            ctx.strokeStyle = COLORS.LIGHT_RED
            ctx.beginPath()
            ctx.moveTo(posX, posY)
            entity.vectorMask.map(({x, y}) => ctx.lineTo(
                posX + x,
                posY + y
            ))
            ctx.lineTo(
                entity.vectorMask[0].x + posX,
                entity.vectorMask[0].y + posY
            )
            ctx.stroke()
            ctx.restore()
        }
        else {
            this.outline(
                posX, posY, width, height,
                visible ? COLORS.GREEN : COLORS.PURPLE
            )
            if (bounds) {
                this.outline(
                    posX + bounds.x,
                    posY + bounds.y,
                    bounds.width,
                    bounds.height,
                    COLORS.LIGHT_RED
                )
            }
        }
        if (visible) {
            this.displayText(`${name || type}\nx:${Math.floor(entity.x)}\ny:${Math.floor(entity.y)}`,
                posX,
                posY - 8,
            )
        }
        // ${String.fromCharCode(26)}
        if (force.x !== 0) {
            const forceX = `${force.x.toFixed(2)}`
            this.displayText(forceX,
                force.x > 0 ? posX + width + 1 : posX - (forceX.length * 5) - 1,
                posY + height / 2,
            )
        }
        if (force.y !== 0) {
            const forceY = `${force.y.toFixed(2)}`
            this.displayText(forceY,
                posX + (width - (forceY.length * 5)) / 2,
                posY + height / 2
            )
        }
    }

    outline (x, y, width, height, color) {
        const { ctx } = this._scene
        ctx.save()
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + width, y)
        ctx.lineTo(x + width, y + height)
        ctx.lineTo(x, y + height)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.restore()
    }
}
