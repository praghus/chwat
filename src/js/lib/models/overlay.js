import { ASSETS, COLORS, FONTS } from '../constants'

export default class Overlay {
    constructor (game) {
        this.game = game
        this.blackOverlay = 0
        this.hints = []
        this.fade = {
            in: false,
            out: false
        }
        this.addHint = ({x, y, width, hint}) => {
            this.hints.push({x, y, width, hint})
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
        if (this.hints.length) {
            this.hints.map((element, index) => {
                this.displayHint(element)
                this.hints.splice(index, 1)
            })
        }
        if (this.blackOverlay > 0) {
            const {
                ctx,
                props: {
                    viewport: { resolutionX, resolutionY }
                }
            } = this.game

            ctx.globalAlpha = this.blackOverlay
            ctx.fillStyle = COLORS.BLACK
            ctx.fillRect(0, 0, resolutionX, resolutionY)
        }
        if (this.fade.in) {
            this.blackOverlay -= 0.01
            if (this.blackOverlay < 0) {
                this.blackOverlay = 0
                this.fade.in = false
            }
        }
        if (this.fade.out) {
            this.blackOverlay += 0.01
            if (this.blackOverlay > 1) {
                this.blackOverlay = 1
                this.fade.out = false
            }
        }
    }

    displayHUD () {
        const {
            ctx,
            camera,
            countTime,
            debug,
            player,
            props,
            world: {
                activeObjects
            }
        } = this.game

        const { assets, viewport: {resolutionX, resolutionY } } = props
        const { energy, items, lives } = player
        const objects = `OBJ: ${activeObjects.length}`
        const time = countTime()
        this.displayText(time, resolutionX - (3 + time.length * 5), 3)

        // Active objects
        debug && this.displayText(objects, resolutionX - (3 + objects.length * 5), 9)

        // Camera position in debug mode
        debug && this.displayText(`CAMERA\nx:${Math.floor(camera.x)}\ny:${Math.floor(camera.y)}`, 4, 28)

        // lives and energy
        const indicatorWidth = energy && Math.round(energy / 2) || 1
        ctx.drawImage(assets[ASSETS.HEAD], 2, 1)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 5, 50, 5, -25 + resolutionX / 2, 3, 50, 5)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 0, indicatorWidth, 5, -25 + resolutionX / 2, 3, indicatorWidth, 5)
        this.displayText(`${lives}`, 12, 3)

        // items
        const align = 3 // -19 + resolutionX / 2
        ctx.drawImage(assets[ASSETS.FRAMES], align, resolutionY - 20)
        items.map((item, index) => {
            if (item) {
                this.displayText(item.name, 44, (resolutionY - 18) + index * 9)
                this.drawTile(item.gid, align + 1 + (index * 20), resolutionY - 19)
            }
        })
    }

    displayHint ({x, y, width, hint}) {
        const {
            ctx,
            camera,
            props: { assets }
        } = this.game

        ctx.drawImage(assets[ASSETS.BUBBLE],
            Math.floor(x + camera.x + width / 2),
            Math.floor(y + camera.y) - 20
        )

        this.drawTile(hint, x + 8 + camera.x + width / 2, y + camera.y - 18)
    }

    drawTile (gid, x, y, scale = 1) {
        if (!gid) return
        const { ctx, world } = this.game
        const item = world.createTile(gid)
        item.draw(ctx, x, y, scale)
    }

    displayMap () {
        const {
            ctx,
            player,
            props: {
                viewport: { resolutionX, resolutionY }
            }
        } = this.game

        ctx.save()
        ctx.globalAlpha = 0.5
        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.restore()

        player.mapPieces.map((gid) => {
            const i = (gid - 1221)
            const j = i < 3 ? 0 : 1
            const k = !j ? 48 : 144
            this.drawTile(
                gid,
                Math.floor((resolutionX / 2) + (i * 32) - k),
                Math.floor((resolutionY / 2) + (j * 32) - 32),
                2
            )
        })

        this.displayText('COLLECTED MAP PIECES',
            (resolutionX / 2) - 49,
            (resolutionY / 2) - 42,
        )
    }

    displayText (text, x, y, font = FONTS.FONT_SMALL) {
        const {
            ctx,
            props: { assets }
        } = this.game

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
        const { ctx, camera } = this.game
        const { bounds, width, height, name, type, visible, force } = entity
        const [ posX, posY ] = [
            Math.floor(entity.x + camera.x),
            Math.floor(entity.y + camera.y)
        ]
        if (entity.points) {
            ctx.save()
            ctx.strokeStyle = COLORS.LIGHT_RED
            ctx.beginPath()
            ctx.moveTo(
                entity.points[0][0] + posX,
                entity.points[0][1] + posY
            )
            entity.points.map(([x, y]) => {
                ctx.lineTo(
                    posX + x,
                    posY + y
                )
                // this.displayText(`${entity.x + x},${entity.x + y}`, posX + x, posY + y)
            })
            ctx.lineTo(
                entity.points[0][0] + posX,
                entity.points[0][1] + posY
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
                    posX + bounds.pos.x,
                    posY + bounds.pos.y,
                    bounds.w,
                    bounds.h,
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
        // else {
        //     this.displayText(`${String.fromCharCode(26)}`,
        //         posX,
        //         posY,
        //     )
        // }
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
        const { ctx } = this.game
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
