import { Layer } from 'tiled-platformer-lib'
import { countTime, isValidArray } from '../../utils/helpers'
import { ASSETS, COLORS, FONTS, LAYERS } from '../../constants'

export default class OverlayLayer extends Layer {
    constructor (scene) {
        super(scene)
        this.id = LAYERS.OVERLAY
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

    draw (ctx) {
        const { resolutionX, resolutionY } = this.scene

        this.displayHUD(ctx)

        isValidArray(this.hints) && this.hints.map(
            (hint, i) => this.displayHint(ctx, hint, i)
        )
        isValidArray(this.messages) && this.messages.map(
            (message, i) => this.displayMessage(ctx, message, i)
        )

        this.scene.checkTimeout('player_map') && this.displayMap(ctx)

        if (this.blackOverlay > 0) {
            ctx.globalAlpha = this.blackOverlay
            ctx.fillStyle = COLORS.BLACK
            ctx.fillRect(0, 0, resolutionX, resolutionY)
        }
    }

    displayHUD (ctx) {
        const { assets, camera, player, resolutionX, resolutionY, timer } = this.scene
        const { energy, items, lives } = player
        const debug = this.scene.getProperty('debug')
        const activeObjectsCount = this.scene.getLayer(LAYERS.OBJECTS).activeObjectsCount
        const objects = `OBJ: ${activeObjectsCount}`
        const time = countTime(timer)

        ctx.save()

        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, resolutionX, 8)

        if (this.alpha < 1) {
            ctx.globalAlpha = this.alpha
            this.alpha += 0.02
        }

        this.displayText(`${String.fromCharCode(8)}`, resolutionX - (10 + time.length * 5), 2)(ctx)
        this.displayText(time, resolutionX - (3 + time.length * 5), 2)(ctx)

        // Active objects
        debug && this.displayText(objects, resolutionX - (3 + objects.length * 5), 10)(ctx)

        // Camera position in debug mode
        debug && this.displayText(`CAMERA\nx:${Math.floor(camera.x)}\ny:${Math.floor(camera.y)}`, 3, 22)(ctx)

        // lives and energy
        const indicatorWidth = energy && Math.round(energy / 2) || 1
        // ctx.drawImage(assets[ASSETS.HEAD], 2, 1)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 5, 50, 5, -25 + resolutionX / 2, 2, 50, 5)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 0, indicatorWidth, 5, -25 + resolutionX / 2, 2, indicatorWidth, 5)
        this.displayText('LIVES', 3, 2)(ctx)
        for (let l = 0; l < lives; l++) {
            this.displayText(`${String.fromCharCode(3)}`, 30 + (l * 6), 2)(ctx)
        }

        // items
        const align = 4 // -19 + resolutionX / 2
        ctx.drawImage(assets[ASSETS.FRAMES], align, resolutionY - 20)
        items.map((item, index) => {
            if (item) {
                // this.displayText(item.name, 44, (resolutionY - 18) + index * 9)
                this.drawTile(item.gid, align + 1 + (index * 20), resolutionY - 19)(ctx)
            }
        })
        ctx.restore()
    }

    displayHint (ctx, { x, y, width, hint }, index) {
        if (isValidArray(hint)) {
            const { camera, assets } = this.scene

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
            )(ctx))
        }
        this.hints.splice(index, 1)
    }

    displayMessage (ctx, { x, y, message }, index) {
        const { camera } = this.scene
        this.displayText(message, x + camera.x, y + camera.y)(ctx)
        this.messages.splice(index, 1)
    }

    drawTile (gid, x, y, scale) {
        return (ctx) => {
            if (!gid) return
            const item = this.scene.createSprite(gid, { gid, width: 16, height: 16 })
            item.draw(ctx, x, y, scale)
        }
    }

    displayMap (ctx) {
        const {
            player,
            assets,
            resolutionX,
            resolutionY
        } = this.scene

        ctx.save()
        ctx.globalAlpha = 0.8
        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.restore()

        ctx.drawImage(assets[ASSETS.MAP_BG], 0, 0, 50, 34,
            Math.floor((resolutionX / 2) - 50),
            Math.floor((resolutionY / 2) - 39), 50 * 2, 34 * 2
        )

        player.mapPieces.map((gid) => {
            const i = (gid - 1221)
            const j = i < 3 ? 0 : 1
            const k = !j ? 48 : 144
            this.drawTile(gid,
                Math.floor((resolutionX / 2) + (i * 32) - k),
                Math.floor((resolutionY / 2) + (j * 32) - 37),
                2
            )(ctx)
        })

        this.displayText('COLLECTED MAP PIECES', (resolutionX / 2) - 49, 12)(ctx)
        this.displayText('[M] - Display map', (resolutionX / 2) - 44, resolutionY - 24)(ctx)
    }

    displayText (text, x, y, font = FONTS.FONT_SMALL) {
        const { assets } = this.scene
        return (ctx) => {
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
    }

    displayDebug (ctx, entity) {
        const { camera } = this.scene
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
            )(ctx)
        }
        if (collisionMask) {
            ctx.save()
            ctx.lineWidth = 1
            ctx.strokeStyle = visible ? COLORS.LIGHT_RED : COLORS.PURPLE

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
            )(ctx)
        }
        if (force.x !== 0) {
            const forceX = `${force.x.toFixed(2)}`
            this.displayText(forceX,
                force.x > 0 ? posX + width + 1 : posX - (forceX.length * 5) - 1,
                posY + height / 2,
            )(ctx)
        }
        if (force.y !== 0) {
            const forceY = `${force.y.toFixed(2)}`
            this.displayText(forceY,
                posX + (width - (forceY.length * 5)) / 2,
                posY + height / 2
            )(ctx)
        }
    }

    // @todo: move to helpers
    outline (x, y, width, height, color) {
        return (ctx) => {
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
