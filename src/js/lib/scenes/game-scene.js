import Overlay from '../models/overlay'
import tmxFile from '../../../assets/levels/map.tmx'
import { ENTITIES, ENTITIES_TYPE } from '../../lib/constants'
import { tmxParser } from 'tmx-tiledmap'
import { Game, World } from 'tiled-platformer-lib'
import {
    noop,
    isMobileDevice,
    createLamp,
    createRectangleObject,
    getMiniTile,
    isMiniTile,
    setLightmaskElement
} from '../../lib/utils/helpers'
import {
    ASSETS,
    COLORS,
    CONFIG,
    JUMP_THROUGH_TILES,
    LAYERS,
    NON_COLLIDE_TILES,
    TIMEOUTS
} from '../../lib/constants'

const {
    DarkMask,
    Lighting
} = window.illuminated

const worldConfig = {
    gravity: 0.5,
    entities: ENTITIES,
    nonColideTiles: NON_COLLIDE_TILES,
    oneWayTiles: JUMP_THROUGH_TILES
}

export default class GameScene extends Game {
    constructor (ctx, props) {
        super(ctx, props)
        this.debug = false
        this.dynamicLights = !isMobileDevice()
        this.onLoad = this.onLoad.bind(this)
        this.addLightElement = this.addLightElement.bind(this)
        this.addLightmaskElement = this.addLightmaskElement.bind(this)
        this.saveGame = this.saveGame.bind(this)
        this.loadGame = this.loadGame.bind(this)
        this.map = tmxParser(tmxFile).then(this.onLoad)
    }

    onLoad (data) {
        this.loaded = true
        this.world = new World(data, worldConfig, this)
        this.overlay = new Overlay(this)
        this.player = this.world.getObjectByType(ENTITIES_TYPE.PLAYER, LAYERS.OBJECTS)
        this.camera.setSurfaceLevel(this.world.getProperty('surfaceLevel'))
        this.camera.setFollow(this.player)
        this.camera.setMiddlePoint(
            this.props.viewport.resolutionX / 3,
            this.player.height
        )
        if (this.dynamicLights) {
            this.light = createLamp(0, 0, 96, COLORS.TRANS_WHITE)
            this.lighting = new Lighting({light: this.light, objects: []})
            this.darkmask = new DarkMask({lights: [this.light]})
            this.lightmask = []
            this.lights = []
            this.generateShadowCasters()
        }
        this.overlay.fadeIn()
    }

    onUpdate () {
        this.debug = this.props.config[CONFIG.DEBUG_MODE]
    }

    tick () {
        this.dynamicLights && this.clearLights()
        this.world.update()
        this.camera.update()
    }

    render () {
        const { camera, player, overlay, world } = this
        this.renderBackground()
        world.draw()
        if (camera.underground || player.underground || player.inDark > 0) {
            this.dynamicLights && this.calculateShadows()
            this.renderLightingEffect()
        }
        overlay.displayHUD()
        this.checkTimeout(TIMEOUTS.PLAYER_MAP) && overlay.displayMap()
        overlay.update()
    }

    renderBackground () {
        const {
            ctx,
            player,
            props: {
                assets,
                viewport: { resolutionX, resolutionY }
            }
        } = this
        if (!this.camera.underground && !player.inDark) {
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

    renderLightingEffect () {
        const {
            ctx,
            camera: { follow, x, y },
            props: {
                assets,
                viewport: { resolutionX, resolutionY }
            }
        } = this

        if (this.dynamicLights) {
            this.light.position.x = follow.x + (follow.width / 2) + x
            this.light.position.y = follow.y + (follow.height / 2) + y
            this.lighting.light = this.light
            this.lighting.objects = this.lightmask
            this.lighting.compute(resolutionX, resolutionY)
            this.darkmask.lights = [this.light].concat(this.lights)
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

    calculateShadows () {
        const {
            camera,
            player,
            world,
            props: {
                viewport: { resolutionX, resolutionY }
            }
        } = this

        const castingShadows = camera.underground || player.underground || player.inDark > 0
        const shouldCreateLightmask = this.dynamicLights && castingShadows

        let y = Math.floor(camera.y % world.spriteSize)
        let _y = Math.floor(-camera.y / world.spriteSize)

        while (y < resolutionY) {
            let x = Math.floor(camera.x % world.spriteSize)
            let _x = Math.floor(-camera.x / world.spriteSize)
            while (x < resolutionX) {
                const tile = world.getTile(_x, _y, LAYERS.MAIN)
                if (tile > 0 && shouldCreateLightmask) {
                    const maskElement = this.getShadowCaster(_x, _y) //
                    if (isMiniTile(tile)) { // todo: fix this
                        this.addLightmaskElement(maskElement, getMiniTile(tile, x, y))
                    }
                    else if (world.isSolidTile(tile)) {
                        this.addLightmaskElement(maskElement, {x, y})
                    }
                }
                x += world.spriteSize
                _x++
            }
            y += world.spriteSize
            _y++
        }
    }

    generateShadowCasters () {
        const { width, height, spriteSize } = this.world
        this.shadowCasters = [...Array(width).keys()].map(() => Array(height))
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.shadowCasters[x][y] = this.world.getTile(x, y, LAYERS.MAIN) > 0
                    ? createRectangleObject(x, y, spriteSize, spriteSize)
                    : null
            }
        }
    }

    addShadowCaster (x, y) {
        const { spriteSize } = this.world
        this.shadowCasters[x][y] = createRectangleObject(x, y, spriteSize, spriteSize)
    }

    getShadowCaster (x, y) {
        return this.world.inRange(x, y) && this.shadowCasters[x][y]
    }

    clearLights () {
        this.lightmask.map((v, k) => {
            this.lightmask[k] = null
        })
        this.lights.map((v, k) => {
            this.lights[k] = null
        })
        this.lightmask.splice(0, this.lightmask.length)
        this.lights.splice(0, this.lights.length)
    }

    addLightmaskElement (maskElement, {x, y, width, height}) {
        const { spriteSize } = this.world
        this.lightmask.push(setLightmaskElement(maskElement, {
            x, y, width: width || spriteSize, height: height || spriteSize
        }))
    }

    addLightElement (x, y, distance, color) {
        this.lights.push(createLamp(x, y, distance, color))
    }

    addTile (x, y, tile, layer) {
        const { world } = this
        world.putTile(x, y, tile, layer)
        if (world.isSolidTile(tile) && layer === LAYERS.MAIN) {
            this.addShadowCaster(x, y)
        }
    }

    loadGame () {
        // const loadedData = atob(localStorage.getItem('savedData'))
        // const { objects, modifiers, player, lastCheckpointId, time } = JSON.parse(loadedData)
        // this.timer = moment().subtract(time)
        // this.world.setObjects(objects)
        // this.lastCheckpointId = lastCheckpointId
        // this.elements = new Elements(gameElementsOrdered(this.world.getObjects()), this)
        // this.player = this.elements.create(player)
        // this.player.items = player.items.map((id) => this.elements.getByProperties('id', id))
        // this.player.mapPieces = player.mapPieces
        // this.camera.setFollow(this.player)
        // // restore map and set modifiers
        // this.world = new World(levelData, worldConfig)
        // modifiers.map(({layer, x, y, value}) => this.world.put(layer, x, y, value))
    }

    saveGame (lastCheckpointId) {
        // const { world: { modifiers }, elements, player: { items, mapPieces } } = this
        // const objects = elements.objects.map((element) => getElementProperties(element))
        // const player = getElementProperties(this.player)
        // const time = moment().diff(moment(this.timer))

        // player.items = items.map((item) => item && item.properties.id)
        // player.mapPieces = mapPieces.map((mapPiece) => getElementProperties(mapPiece))

        // this.lastCheckpointId = lastCheckpointId

        // const savedData = JSON.stringify({
        //     lastCheckpointId,
        //     modifiers,
        //     objects,
        //     player,
        //     time
        // })

        // localStorage.setItem('savedData', btoa(savedData))
    }

    checkTimeout ({name}) {
        return this.timeoutsPool[name] || null
    }

    startTimeout ({name, duration}, callback = noop) {
        if (!this.timeoutsPool[name]) {
            this.timeoutsPool[name] = setTimeout(() => {
                this.stopTimeout(name)
                callback()
            }, duration)
        }
    }

    stopTimeout (name) {
        if (this.timeoutsPool[name] !== null) {
            clearTimeout(this.timeoutsPool[name])
            this.timeoutsPool[name] = null
        }
    }
}
