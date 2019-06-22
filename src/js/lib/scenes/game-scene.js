import Overlay from '../models/overlay'
import map from '../../../assets/levels/map.tmx'
import { tmxParser } from 'tmx-tiledmap'
import { Game, World } from 'tiled-platformer-lib'
import {
    ASSETS,
    COLORS,
    CONFIG,
    ENTITIES,
    ENTITIES_TYPE,
    LAYERS,
    TIMEOUTS
} from '../../lib/constants'

export default class GameScene extends Game {
    constructor (ctx, props) {
        super(ctx, props)
        this.debug = false
        this.onLoad = this.onLoad.bind(this)
        this.map = tmxParser(map).then(this.onLoad)
    }

    onLoad (data) {
        this.loaded = true
        this.world = new World(data, ENTITIES, this)
        this.overlay = new Overlay(this)
        this.player = this.world.getObjectByType(ENTITIES_TYPE.PLAYER, LAYERS.OBJECTS)
        this.camera.setSurfaceLevel(this.world.getProperty('surfaceLevel'))
        this.camera.setFollow(this.player)
        this.camera.center()
        this.overlay.fadeIn()
    }

    onUpdate () {
        this.debug = this.props.config[CONFIG.DEBUG_MODE]
    }

    tick () {
        this.world.update()
        this.camera.update()
    }

    render () {
        const { camera, player, overlay, world } = this
        this.renderBackground()
        world.draw()
        if (camera.underground || player.underground || player.inDark > 0) {
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
            props: { assets }
        } = this

        ctx.drawImage(assets[ASSETS.LIGHTING],
            -400 + (follow.x + x + follow.width / 2),
            -400 + (follow.y + y + follow.height / 2)
        )
    }
}
