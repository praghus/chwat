import '../lib/illuminated'
import { ASSETS, FONTS, LAYERS, LIGHTS, NON_COLLIDE_INDEX } from '../lib/constants'

const { DarkMask, Lighting, Vec2, RectangleObject } = window.illuminated

export default class Renderer {
    constructor (game) {
        this._game = game
        this.frame = 0
        this.fps = 0
        this.then = performance.now()
        this.dynamicLights = true
        this.lightmask = []
    }

    draw () {
        const { ctx, camera, player, viewport, world } = this._game
        const { resolutionX, resolutionY, scale } = viewport
        const { renderOrder } = world
        const castingShadows = this.dynamicLights && (camera.underground || player.inDark > 0)

        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, resolutionX, resolutionY)

        this.renderStaticBackground()

        renderOrder.map((layer) => {
            if (layer === LAYERS.OBJECTS) {
                this.renderObjects()
            }
            else {
                if (layer === LAYERS.FOREGROUND2 && castingShadows) {
                    this.renderLightingEffect()
                }
                else {
                    this.renderLayer(layer)
                }
            }
        })
        this.renderHUD()

        ctx.restore()
    }

    fontPrint (text, x = -1, y = -1, font = FONTS.FONT_NORMAL) {
        const { ctx, assets, viewport } = this._game
        const { resolutionX, resolutionY } = viewport

        x = x === -1 ? (resolutionX - text.length * font.size) / 2 : x
        y = y === -1 ? (resolutionY - font.size) / 2 : y

        for (let i = 0; i < text.length; i++) {
            const chr = text.charCodeAt(i)
            ctx.drawImage(assets[font.name],
                ((chr) % 16) * font.size, Math.ceil(((chr + 1) / 16) - 1) * font.size,
                font.size, font.size, x + (i * font.size), y, font.size, font.size
            )
        }
    }

    renderStaticBackground () {
        const { ctx, camera, assets, viewport, player } = this._game
        const { resolutionX, resolutionY } = viewport

        if (!camera.underground && player.inDark === 0) {
            const cameraX = camera.x + 3300
            ctx.fillStyle = '#73C3FF'
            ctx.fillRect(0, 0, resolutionX, resolutionY)
            if (cameraX < 0) {
                ctx.drawImage(assets[ASSETS.MOUNTAINS], (cameraX / 15), 275 + (camera.y / 2))
                ctx.drawImage(assets[ASSETS.FAR_FOREST], (cameraX / 10), 100 + (camera.y / 2))
                ctx.drawImage(assets[ASSETS.FOREST], (cameraX / 5), (camera.y / 2))
            }
        }
    }

    renderLayer (layer) {
        const { ctx, world, camera, assets, viewport } = this._game
        const { resolutionX, resolutionY } = viewport
        const { spriteCols, spriteSize } = world

        const shouldCreateLightmask = this.dynamicLights && layer === LAYERS.MAIN

        let y = Math.floor(camera.y % spriteSize)
        let _y = Math.floor(-camera.y / spriteSize)

        if (shouldCreateLightmask) {
            this.lightmask = []
        }

        while (y < resolutionY) {
            let x = Math.floor(camera.x % spriteSize)
            let _x = Math.floor(-camera.x / spriteSize)
            while (x < resolutionX) {
                const tile = world.get(layer, _x, _y)
                if (tile > 0) {
                    // illuminated.js light mask
                    if (shouldCreateLightmask && tile > NON_COLLIDE_INDEX) {
                        this.addLightmaskElement(x, y, spriteSize, spriteSize)
                    }
                    if (tile > 0) {
                        ctx.drawImage(assets[ASSETS.TILES],
                            (((tile - 1) % spriteCols)) * spriteSize,
                            (Math.ceil(tile / spriteCols) - 1) * spriteSize,
                            spriteSize, spriteSize, x, y,
                            spriteSize, spriteSize)
                    }
                }
                x += spriteSize
                _x++
            }
            y += spriteSize
            _y++
        }
    }

    renderObjects () {
        const { ctx, elements, player } = this._game
        const { objects } = elements
        objects.forEach((obj) => obj.draw(ctx))
        player.draw(ctx)
    }

    /**
     * illuminated.js
     */
    addLightmaskElement (x, y, width, height) {
        this.lightmask.push(new RectangleObject({
            topleft: new Vec2(x, y),
            bottomright: new Vec2(x + width, y + height)
        }))
    }

    renderLightingEffect () {
        const { ctx, camera, elements, player, viewport } = this._game
        const { resolutionX, resolutionY } = viewport
        const light = elements.getLight(LIGHTS.PLAYER_LIGHT)

        light.position = new Vec2(
            player.x + (player.width / 2) + camera.x,
            player.y + (player.height / 2) + camera.y
        )

        const lighting = new Lighting({light: light, objects: this.lightmask})
        const darkmask = new DarkMask({lights: [light]})

        lighting.compute(resolutionX, resolutionY)
        darkmask.compute(resolutionX, resolutionY)

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        lighting.render(ctx)
        ctx.globalCompositeOperation = 'source-over'
        darkmask.render(ctx)
        ctx.restore()
    }

    renderHUD () {
        const { ctx, assets, fps, player, viewport } = this._game
        const { resolutionX, resolutionY } = viewport
        const { energy, lives, items } = player
        const fpsIndicator = `FPS:${Math.round(fps)}`

        // FPS meter
        this.fontPrint(fpsIndicator, resolutionX - (5 + fpsIndicator.length * 5), 4, FONTS.FONT_SMALL)

        // energy
        ctx.save()
        ctx.fillStyle = '#222'
        ctx.fillRect(17, 4, 52, 5)
        ctx.fillStyle = '#000'
        ctx.fillRect(18, 5, 50, 3)
        ctx.fillStyle = '#d60000'
        ctx.fillRect(18, 5, energy / 2, 3)
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(18, 5, energy / 2, 1)
        ctx.restore()

        // lives
        ctx.drawImage(assets[ASSETS.HEART], 0, 0)
        this.fontPrint(`x${lives}`, 17, 10, FONTS.FONT_SMALL)

        // items
        const align = (resolutionX - 60)
        ctx.drawImage(assets[ASSETS.FRAMES], align, resolutionY - 26)
        items.map((item, index) => {
            if (item && item.properties) {
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
}
