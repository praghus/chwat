import '../../lib/illuminated'
import moment from 'moment'
import Scene from '../scene'
import levelData from '../../../assets/levels/map.json'
import { Camera, Elements, World } from '../index'
import {
    getMiniTile,
    isMiniTile,
    setLightmaskElement
} from '../../lib/helpers'
import {
    ASSETS,
    COLORS,
    LAYERS,
    LIGHTS,
    NON_COLLIDE_INDEX,
    SPECIAL_TILES_INDEX,
    TIMEOUTS
} from '../../lib/constants'

const { DarkMask, Lighting } = window.illuminated

export default class GameScene extends Scene {
    constructor (game) {
        super(game)
        this.world = new World(levelData)
        this.elements = new Elements(this.world.getObjects(), this)
        this.player = this.elements.create(this.world.getPlayer())
        this.timer = null

        this.camera = new Camera(this)
        this.camera.setFollow(this.player)

        this.dynamicLights = this.world.shouldCreateLightmask
        this.light = this.elements.getLight(LIGHTS.PLAYER_LIGHT)
        this.lighting = new Lighting({light: this.light, objects: []})
        this.darkmask = new DarkMask({lights: [this.light]})
        this.lightmask = []

        this.overlays.fadeIn()
        this.addLightmaskElement = this.addLightmaskElement.bind(this)
    }

    update (nextProps) {
        super.update(nextProps)
        const { delta, ticker } = this
        if (!this.timer) this.timer = moment()

        if (delta > ticker.interval) {
            this.elements.update()
            this.player.update()
            this.camera.update()
            this.countFPS()
        }
    }

    draw () {
        const { ctx, player, viewport, world } = this
        const { resolutionX, resolutionY, scale } = viewport
        const { renderOrder } = world

        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, resolutionX, resolutionY)

        this.renderStaticBackground()

        renderOrder.map((layer) => layer === LAYERS.OBJECTS
            ? this.renderObjects()
            : this.renderLayer(layer)
        )

        this.overlays.displayHUD()

        // display collected map pieces
        player.checkTimeout(TIMEOUTS.PLAYER_MAP) && this.overlays.displayMap()

        this.overlays.update()

        ctx.restore()
    }

    renderLightingEffect () {
        const { ctx, assets, camera, player, viewport } = this
        const { resolutionX, resolutionY } = viewport

        if (this.dynamicLights) {
            this.light.position.x = player.x + (player.width / 2) + this.camera.x
            this.light.position.y = player.y + (player.height / 2) + this.camera.y

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
        else {
            ctx.drawImage(assets[ASSETS.LIGHTING],
                -400 + (player.x + camera.x + player.width / 2),
                -400 + (player.y + camera.y + player.height / 2)
            )
        }
    }

    renderObjects () {
        this.elements.objects.map((obj) => obj.draw())
        this.player.draw()
    }

    renderStaticBackground () {
        const { ctx, assets, player, viewport } = this
        const { resolutionX, resolutionY } = viewport

        if (!this.camera.underground && player.inDark === 0) {
            const cameraX = this.camera.x + 3300
            const fogBorder = 600

            ctx.fillStyle = COLORS.BLUE_SKY
            ctx.fillRect(0, 0, resolutionX, resolutionY)

            if (cameraX < 0) {
                ctx.drawImage(assets[ASSETS.MOUNTAINS], cameraX / 15, 278 + this.camera.y / 2)
                ctx.drawImage(assets[ASSETS.FAR_FOREST], cameraX / 10, 112 + this.camera.y / 2)
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

    renderLayer (layer) {
        const { ctx, assets, camera, player, viewport, world } = this
        const { resolutionX, resolutionY } = viewport
        const { spriteCols, spriteSize } = world
        const castingShadows = camera.underground || player.inDark > 0
        const shouldCreateLightmask = this.dynamicLights && castingShadows && layer === LAYERS.MAIN

        let y = Math.floor(camera.y % spriteSize)
        let _y = Math.floor(-camera.y / spriteSize)

        if (layer === LAYERS.FOREGROUND2 && castingShadows) {
            this.renderLightingEffect()
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
                        if (shouldCreateLightmask) {
                            const maskElement = world.getLightmask(_x, _y)
                            if (isMiniTile(tile)) {
                                this.addLightmaskElement(maskElement, getMiniTile(tile, x, y))
                            }
                            else if (tile > NON_COLLIDE_INDEX && tile < SPECIAL_TILES_INDEX) {
                                this.addLightmaskElement(maskElement, {x, y})
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

    addLightmaskElement (maskElement, {x, y, width, height}) {
        const { spriteSize } = this.world
        this.lightmask.push(setLightmaskElement(maskElement, {
            x, y, width: width || spriteSize, height: height || spriteSize
        }))
    }
}
