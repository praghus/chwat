import '../../lib/illuminated'
import Scene from '../scene'
import levelData from '../../../assets/levels/map.json'
import { Camera, Elements, World } from '../index'
import { setLightmaskElement } from '../../lib/helpers'
import {
    ASSETS,
    COLORS,
    LAYERS,
    LIGHTS,
    NON_COLLIDE_INDEX,
    SPECIAL_TILES_INDEX
} from '../../lib/constants'

const { DarkMask, Lighting } = window.illuminated

export default class GameScene extends Scene {
    constructor (game) {
        super(game)
        this.dynamicLights = true
        this.lightmask = []
        this.world = new World(levelData)
        this.elements = new Elements(this.world.getObjects(), this)
        this.player = this.elements.create(this.world.getPlayer())
        this.camera = new Camera(this)
        this.camera.setFollow(this.player)
        this.light = this.elements.getLight(LIGHTS.PLAYER_LIGHT)
        this.lighting = new Lighting({light: this.light, objects: []})
        this.darkmask = new DarkMask({lights: [this.light]})
    }

    update (nextProps) {
        super.update(nextProps)
        const { delta, ticker } = this
        if (delta > ticker.interval) {
            this.elements.update()
            this.player.update()
            this.camera.update()
            this.countFPS()
        }
    }

    draw (ctx) {
        const { assets, camera, player, viewport, world } = this
        const { resolutionX, resolutionY, scale } = viewport
        const { renderOrder } = world

        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, resolutionX, resolutionY)

        this.renderStaticBackground(ctx)

        renderOrder.map((layer) => layer === LAYERS.OBJECTS
            ? this.renderObjects(ctx)
            : this.renderLayer(ctx, layer)
        )

        this.renderHUD(ctx)

        // display hint
        if (player.hint) {
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

        // display collected map pieces
        if (player.mapTimeout) {
            ctx.save()
            ctx.globalAlpha = 0.8
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
            this.fontPrint('COLLECTED MAP PIECES',
                (resolutionX / 2) - 49,
                (resolutionY / 2) - 42,
            )(ctx)
        }

        if (this.blackOverlay > 0) {
            ctx.globalAlpha = this.blackOverlay
            ctx.fillStyle = COLORS.BLACK
            ctx.fillRect(0, 0, resolutionX, resolutionY)
            this.blackOverlay -= 0.01
        }

        ctx.restore()
    }

    renderLightingEffect (ctx) {
        const { player, viewport } = this
        const { resolutionX, resolutionY } = viewport

        this.light.position = Object.assign(this.light.position, {
            x: player.x + (player.width / 2) + this.camera.x,
            y: player.y + (player.height / 2) + this.camera.y
        })

        this.darkmask.lights = [this.light]
        this.lighting.light = this.light
        this.lighting.objects = this.lightmask

        this.lighting.compute(resolutionX, resolutionY)
        this.darkmask.compute(resolutionX, resolutionY)

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        this.lighting.render(ctx)
        ctx.globalCompositeOperation = 'source-over'
        this.darkmask.render(ctx)
        ctx.restore()
    }

    renderStaticBackground (ctx) {
        const { assets, player, viewport } = this
        const { resolutionX, resolutionY } = viewport

        if (!this.camera.underground && player.inDark === 0) {
            const cameraX = this.camera.x + 3300
            const fogBorder = 600

            ctx.fillStyle = COLORS.BLUE_SKY
            ctx.fillRect(0, 0, resolutionX, resolutionY)

            if (cameraX < 0) {
                ctx.drawImage(assets[ASSETS.MOUNTAINS], cameraX / 15, 275 + this.camera.y / 2)
                ctx.drawImage(assets[ASSETS.FAR_FOREST], cameraX / 10, 100 + this.camera.y / 2)
                ctx.drawImage(assets[ASSETS.FOREST], cameraX / 5, 270 + this.camera.y / 2)

                if (this.camera.y > -fogBorder) {
                    ctx.save()
                    ctx.globalAlpha = ((fogBorder + this.camera.y) / fogBorder).toFixed(2) * 2
                    ctx.fillRect(0, 0, resolutionX, resolutionY)
                    ctx.restore()
                }
            }
            else {
                ctx.drawImage(assets[ASSETS.SKY], 0, 0, resolutionX, resolutionY)
            }
        }
    }

    renderLayer (ctx, layer) {
        const { assets, camera, player, viewport, world } = this
        const { resolutionX, resolutionY } = viewport
        const { spriteCols, spriteSize } = world
        const castingShadows = this.dynamicLights && (camera.underground || player.inDark > 0)
        const shouldCreateLightmask = castingShadows && layer === LAYERS.MAIN

        let y = Math.floor(camera.y % spriteSize)
        let _y = Math.floor(-camera.y / spriteSize)

        if (layer === LAYERS.FOREGROUND2 && castingShadows) {
            this.renderLightingEffect(ctx)
        }
        else {
            if (shouldCreateLightmask) {
                this.lightmask.map((v, k) => {
                    this.lightmask[k] = null
                })
                this.lightmask.splice(0, this.lightmask.length)
            }
            while (y < resolutionY) {
                let x = Math.floor(camera.x % spriteSize)
                let _x = Math.floor(-camera.x / spriteSize)
                while (x < resolutionX) {
                    const tile = world.get(layer, _x, _y)
                    if (tile > 0) {
                    // create light mask
                        if (shouldCreateLightmask) {
                            const maskElement = world.getLightmask(_x, _y)
                            // stairs
                            // todo: move it to some method
                            if (tile === 230 || tile === 233 || tile === 234 || tile === 235) {
                                this.lightmask.push(setLightmaskElement(
                                    maskElement, tile === 233 || tile === 235 ? x : x + 8, y + 8, 8, 8
                                ))
                            }
                            else if (tile > NON_COLLIDE_INDEX && tile < SPECIAL_TILES_INDEX) {
                                this.lightmask.push(setLightmaskElement(
                                    maskElement, x, y, spriteSize, spriteSize
                                ))
                            }
                        }
                        ctx.drawImage(assets[ASSETS.TILES],
                            ((tile - 1) % spriteCols) * spriteSize,
                            (Math.ceil(tile / spriteCols) - 1) * spriteSize,
                            spriteSize, spriteSize, x, y,
                            spriteSize, spriteSize)
                    }
                    x += spriteSize
                    _x++
                }
                y += spriteSize
                _y++
            }
        }
    }

    renderObjects (ctx) {
        this.elements.objects.map((obj) => obj.draw(ctx))
        this.player.draw(ctx)
    }

    renderHUD (ctx) {
        const { camera, assets, debug, fps, player, viewport } = this
        const { resolutionX, resolutionY } = viewport
        const { energy, items, lives } = player
        const fpsIndicator = `FPS:${Math.round(fps)}`

        // FPS meter
        this.fontPrint(fpsIndicator, resolutionX - (3 + fpsIndicator.length * 5), 3)(ctx)

        // Camera position in debug mode
        if (debug) {
            this.fontPrint(`CAMERA\nx:${Math.floor(camera.x)}\ny:${Math.floor(camera.y)}`, 4, 28)(ctx)
        }

        // lives and energy
        const indicatorWidth = energy && Math.round(energy / 2) || 1
        ctx.drawImage(assets[ASSETS.HEAD], 3, 2)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 5, 50, 5, 12, 3, 50, 5)
        ctx.drawImage(assets[ASSETS.ENERGY], 0, 0, indicatorWidth, 5, 12, 3, indicatorWidth, 5)
        this.fontPrint(`${lives}`, 12, 8)(ctx)

        // items
        const align = (resolutionX - 60)
        ctx.drawImage(assets[ASSETS.FRAMES], align, resolutionY - 26)
        items.map((item, index) => {
            if (item && item.properties) {
                this.fontPrint(item.name, 4, (resolutionY - 20) + index * 9)(ctx)
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
