import { Layer } from 'tiled-platformer-lib'
import { countTime, displayText, isValidArray, outline } from '../../utils/helpers'
import { ASSETS, COLORS, LAYERS } from '../../constants'

export default class OverlayLayer extends Layer {
    constructor (scene) {
        super(scene)
        this.id = LAYERS.OVERLAY
        this.blackOverlay = 0
        this.hints = []
        this.messages = []
        this.fade = {
            in: false,
            out: false
        }
        this.addHint = ({ x, y, width, hint }) => {
            this.hints.push({ x, y, width, hint })
        }
        this.addMessage = ({ x, y, message }) => {
            this.messages.push({ x, y, message })
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

    draw (ctx, scene) {
        const { resolutionX, resolutionY } = scene

        this.displayHUD(scene)(ctx)

        isValidArray(this.hints) && this.hints.map(
            (hint, i) => this.displayHint(scene, hint, i)(ctx)
        )
        isValidArray(this.messages) && this.messages.map(
            (message, i) => this.displayMessage(scene, message, i)(ctx)
        )

        scene.player.checkTimeout('player_map') && this.displayMap(scene)(ctx)

        if (this.blackOverlay > 0) {
            ctx.globalAlpha = this.blackOverlay
            ctx.fillStyle = COLORS.BLACK
            ctx.fillRect(0, 0, resolutionX, resolutionY)
        }
    }

    displayHUD (scene) {
        const { assets, camera, player, resolutionX, resolutionY, timer } = scene
        const { energy, items, lives } = player
        const debug = scene.getProperty('debug')
        const activeObjectsCount = scene.getLayer(LAYERS.OBJECTS).activeObjectsCount
        const objects = `OBJ: ${activeObjectsCount}`
        const time = countTime(timer)
        return (ctx) => {
            ctx.save()
            ctx.fillStyle = COLORS.BLACK
            ctx.fillRect(0, 0, resolutionX, 8)

            displayText(`${String.fromCharCode(8)}`, resolutionX - (10 + time.length * 5), 2)(ctx, assets)
            displayText(time, resolutionX - (3 + time.length * 5), 2)(ctx, assets)

            // Active objects
            debug && displayText(objects, resolutionX - (3 + objects.length * 5), 10)(ctx, assets)

            // Camera position in debug mode
            debug && displayText(`CAMERA\nx:${Math.floor(camera.x)}\ny:${Math.floor(camera.y)}`, 3, 22)(ctx, assets)

            // lives and energy
            const indicatorWidth = energy && Math.round(energy / 2) || 1

            ctx.drawImage(assets[ASSETS.ENERGY], 0, 5, 50, 5, -25 + resolutionX / 2, 2, 50, 5)
            ctx.drawImage(assets[ASSETS.ENERGY], 0, 0, indicatorWidth, 5, -25 + resolutionX / 2, 2, indicatorWidth, 5)
            displayText('LIVES', 3, 2)(ctx, assets)
            for (let l = 0; l < lives; l++) {
                displayText(`${String.fromCharCode(3)}`, 30 + (l * 6), 2)(ctx, assets)
            }

            // items
            const align = 4 // -19 + resolutionX / 2
            ctx.drawImage(assets[ASSETS.FRAMES], align, resolutionY - 20)
            items.map((item, index) => {
                item && this.drawTile(item.gid, align + 1 + (index * 20), resolutionY - 19)(ctx, scene)
            })
            ctx.restore()
        }
    }

    displayHint (scene, { x, y, width, hint }, index) {
        return (ctx) => {
            if (isValidArray(hint)) {
                const { camera, assets } = scene
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
                )(ctx, scene))
            }
            this.hints.splice(index, 1)
        }
    }

    displayMessage (scene, { x, y, message }, index) {
        const { assets, camera } = scene
        this.messages.splice(index, 1)
        return (ctx) => {
            displayText(message, x + camera.x, y + camera.y)(ctx, assets)
        }
    }

    displayMap (scene) {
        const { player, assets, resolutionX, resolutionY } = scene
        return (ctx) => {
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
                )(ctx, scene)
            })
            displayText('COLLECTED MAP PIECES', (resolutionX / 2) - 49, 12)(ctx, assets)
            displayText('[M] - Display map', (resolutionX / 2) - 44, resolutionY - 24)(ctx, assets)
        }
    }

    displayDebug (scene, entity) {
        const { assets, camera } = scene
        const { collisionMask, width, height, name, type, visible, force } = entity
        const [ posX, posY ] = [
            Math.floor(entity.x + camera.x),
            Math.floor(entity.y + camera.y)
        ]
        return (ctx) => {
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
                outline(
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
                displayText(`${name || type}\nx:${Math.floor(entity.x)}\ny:${Math.floor(entity.y)}`,
                    posX,
                    posY - 8,
                )(ctx, assets)
            }
            if (force.x !== 0) {
                const forceX = `${force.x.toFixed(2)}`
                displayText(forceX,
                    force.x > 0 ? posX + width + 1 : posX - (forceX.length * 5) - 1,
                    posY + height / 2,
                )(ctx, assets)
            }
            if (force.y !== 0) {
                const forceY = `${force.y.toFixed(2)}`
                displayText(forceY,
                    posX + (width - (forceY.length * 5)) / 2,
                    posY + height / 2
                )(ctx, assets)
            }
        }
    }

    drawTile (gid, x, y, scale) {
        return (ctx, scene) => {
            if (!gid) return
            scene.createTile(gid).draw(ctx, x, y, scale)
        }
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
