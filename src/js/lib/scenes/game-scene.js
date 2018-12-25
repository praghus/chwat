import moment from 'moment'
import Overlay from '../models/overlay'
import levelData from '../../../assets/levels/map.json'
import { ENTITIES, ENTITIES_TYPE } from '../../lib/entities'
import { Camera, Elements, Scene, World } from 'tmx-platformer-lib'
import { isMobileDevice, createLamp, getElementProperties } from '../../lib/helpers'
import {
    createRectangleObject,
    gameElementsOrdered,
    getMiniTile,
    isMiniTile,
    overlap,
    setLightmaskElement
} from '../../lib/helpers'
import {
    ASSETS,
    COLORS,
    INPUTS,
    JUMP_THROUGH_TILES,
    LAYERS,
    NON_COLLIDE_INDEX,
    SPECIAL_TILES_INDEX,
    TIMEOUTS
} from '../../lib/constants'

const { DarkMask, Lighting } = window.illuminated

const worldConfig = {
    entities: ENTITIES,
    jumpThroughTiles: JUMP_THROUGH_TILES,
    mainLayer: LAYERS.MAIN,
    nonColideIndex: NON_COLLIDE_INDEX
}

export default class GameScene extends Scene {
    constructor (game) {
        super(game)

        this.world = new World(levelData, worldConfig)
        this.elements = new Elements(gameElementsOrdered(this.world.getObjects()), this)
        this.player = this.elements.create(this.world.getElementsByType(ENTITIES_TYPE.PLAYER))
        this.overlay = new Overlay(this)
        this.camera = new Camera(this)
        this.camera.setFollow(this.player)

        this.lastCheckpointId = null
        this.timer = null

        this.debug = false
        this.dynamicLights = !isMobileDevice()
        this.light = createLamp(0, 0, 96, COLORS.PLAYER_LIGHT)
        this.lighting = new Lighting({light: this.light, objects: []})
        this.darkmask = new DarkMask({lights: [this.light]})
        this.lightmask = []

        this.dynamicLights && this.createShadowCasters()

        this.overlay.fadeIn()
        this.addLightmaskElement = this.addLightmaskElement.bind(this)
        this.saveGame = this.saveGame.bind(this)
        this.loadGame = this.loadGame.bind(this)
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

        if (this.fetchInput(INPUTS.INPUT_DEBUG)) {
            this.debug = !this.debug
        }
    }

    draw () {
        const { ctx, viewport, world } = this
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

        this.overlay.displayHUD()
        this.checkTimeout(TIMEOUTS.PLAYER_MAP) && this.overlay.displayMap()
        this.overlay.update()
        ctx.restore()
    }

    createShadowCasters () {
        const { width, height, spriteSize } = this.world
        this.shadowCasters = [...Array(width).keys()].map(() => Array(height))
        // @todo: optimization
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.shadowCasters[x][y] = this.world.get(LAYERS.MAIN, x, y) > 0
                    ? createRectangleObject(x, y, spriteSize, spriteSize)
                    : null
            }
        }
    }

    getShadowCaster (x, y) {
        return this.world.inRange(x, y) && this.shadowCasters[x][y]
    }

    renderLightingEffect () {
        const { ctx, assets, camera: {follow, x, y}, viewport } = this
        const { resolutionX, resolutionY } = viewport

        if (this.dynamicLights) {
            this.light.position.x = follow.x + (follow.width / 2) + x
            this.light.position.y = follow.y + (follow.height / 2) + y

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
                -400 + (follow.x + x + follow.width / 2),
                -400 + (follow.y + y + follow.height / 2)
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
        const castingShadows = camera.underground || player.underground || player.inDark > 0
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
                            const maskElement = this.getShadowCaster(_x, _y) //
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

    loadGame () {
        const loadedData = atob(localStorage.getItem('savedData'))
        const { objects, modifiers, player, lastCheckpointId, time } = JSON.parse(loadedData)
        this.timer = moment().subtract(time)
        this.world.setObjects(objects)
        this.lastCheckpointId = lastCheckpointId
        this.elements = new Elements(gameElementsOrdered(this.world.getObjects()), this)
        this.player = this.elements.create(player)
        this.player.items = player.items.map((id) => this.elements.getByProperties('id', id))
        this.player.mapPieces = player.mapPieces
        this.camera.setFollow(this.player)
        // restore map and set modifiers
        this.world = new World(levelData, worldConfig)
        modifiers.map(({layer, x, y, value}) => this.world.put(layer, x, y, value))
    }

    saveGame (lastCheckpointId) {
        const { world: { modifiers }, elements, player: { items, mapPieces } } = this
        const objects = elements.objects.map((element) => getElementProperties(element))
        const player = getElementProperties(this.player)
        const time = moment().diff(moment(this.timer))

        player.items = items.map((item) => item && item.getProperty('id'))
        player.mapPieces = mapPieces.map((mapPiece) => getElementProperties(mapPiece))

        this.lastCheckpointId = lastCheckpointId

        const savedData = JSON.stringify({
            lastCheckpointId,
            modifiers,
            objects,
            player,
            time
        })

        localStorage.setItem('savedData', btoa(savedData))
    }
}
