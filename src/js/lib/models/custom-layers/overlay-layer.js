import { Layer } from 'tiled-platformer-lib'
import { isValidArray } from '../../utils/helpers'
import { ASSETS, COLORS, FONTS, LAYERS } from '../../constants'

export default class OverlayLayer extends Layer {
    constructor (game) {
        super(game)
        this.id = LAYERS.OVERLAY
        this.game = game
        this.blackOverlay = 0
        this.alpha = 1
        this.introShow = 1
        this.hints = []
        this.messages = []
        this.fade = {
            in: false,
            out: false
        }
    }

    update () {
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

    draw () {
        this.displayHUD()

        isValidArray(this.hints) && this.hints.map(
            (hint, i) => this.displayHint(hint, i)
        )
        isValidArray(this.messages) && this.messages.map(
            (message, i) => this.displayMessage(message, i)
        )

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
    }

    displayHUD () {
        const {
            ctx,
            camera,
            countTime,
            debug,
            player,
            props,
            scene
        } = this.game

        const { assets, viewport: { resolutionX, resolutionY } } = props
        const { energy, items, lives } = player

        const activeObjects = scene.getLayer(LAYERS.OBJECTS).activeObjects
        const objects = `OBJ: ${activeObjects.length}`
        const time = countTime()

        ctx.save()

        if (this.alpha < 1) {
            ctx.globalAlpha = this.alpha
            this.alpha += 0.02
        }

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
        ctx.restore()
    }

    displayHint ({ x, y, width, hint }, index) {
        if (isValidArray(hint)) {
            const {
                ctx,
                camera,
                props: { assets }
            } = this.game

            ctx.drawImage(assets[ASSETS.BUBBLE],
                0, (hint.length - 1) * 32, 160, 32,
                Math.ceil(x + camera.x + width / 2) - 64,
                Math.ceil(y + camera.y - 20),
                160, 32
            )
            const offsetX = (hint.length - 1) * -10

            hint.map(({ gid }, i) => this.drawTile(gid,
                offsetX + Math.ceil(x + 8 + camera.x + width / 2) + i * 20,
                Math.ceil(y + camera.y - 18)
            ))
        }
        this.hints.splice(index, 1)
    }

    displayMessage ({ x, y, message }, index) {
        const { camera } = this.game
        this.displayText(message, x + camera.x, y + camera.y)
        this.messages.splice(index, 1)
    }

    drawTile (gid, x, y, scale) {
        if (!gid) return

        const item = this.game.scene.createSprite(gid, { gid, width: 16, height: 16 })

        item.draw(x, y, scale)
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
        ctx.globalAlpha = 0.9
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
        const { ctx, props: { assets } } = this.game

        if (text) {
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
    }

    displayDebug (entity) {
        const { ctx, camera } = this.game
        const { collisionMask, width, height, name, type, visible, force } = entity
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
            entity.points.map(([x, y]) => ctx.lineTo(posX + x, posY + y))
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
        }
        if (collisionMask) {
            ctx.save()
            ctx.lineWidth = 1
            ctx.strokeStyle = '#f00'

            ctx.beginPath()
            ctx.moveTo(collisionMask.points[0].x + posX, collisionMask.points[0].y + posY)
            collisionMask.points.map((v) => ctx.lineTo(posX + v.x, posY + v.y))
            ctx.lineTo(collisionMask.points[0].x + posX, collisionMask.points[0].y + posY)
            ctx.stroke()
            ctx.restore()
        }
        if (visible) {
            this.displayText(`${name || type}\nx:${Math.floor(entity.x)}\ny:${Math.floor(entity.y)}`,
                posX,
                posY - 8,
            )
        }
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

    addHint ({ x, y, width, hint }) {
        this.hints.push({ x, y, width, hint })
    }

    addMessage ({ x, y, message }) {
        this.messages.push({ x, y, message })
    }

    fadeIn () {
        if (!this.fade.in) {
            this.blackOverlay = 1
            this.fade.in = true
            this.fade.out = false
        }
    }

    fadeOut () {
        if (!this.fade.out) {
            this.blackOverlay = 0
            this.fade.in = false
            this.fade.out = true
        }
    }
}
