import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import Debug from '../debug'
import Canvas from '../canvas'
import Inputs from '../inputs'
import map from '../../../assets/levels/map.tmx'
import fx from 'glfx'
import { findDOMNode } from 'react-dom'
import { Camera, World } from 'tiled-platformer-lib'
import { tmxParser } from 'tmx-tiledmap'
import { Overlay } from '../../lib/models'
import { noop, getPerformance } from '../../lib/utils/helpers'
import {
    ASSETS,
    COLORS,
    CONFIG,
    ENTITIES,
    ENTITIES_TYPE,
    LAYERS
} from '../../lib/constants'
import {
    assetPropType,
    inputPropType,
    tickerPropType,
    viewportPropType,
    configPropType
} from '../../lib/prop-types'

const propTypes = {
    assets: assetPropType.isRequired,
    config: configPropType.isRequired,
    input: inputPropType.isRequired,
    onConfig: PropTypes.func.isRequired,
    onKey: PropTypes.func.isRequired,
    onMouse: PropTypes.func.isRequired,
    playSound: PropTypes.func.isRequired,
    startTicker: PropTypes.func.isRequired,
    ticker: tickerPropType.isRequired,
    viewport: viewportPropType.isRequired
}

export default class GameScene extends Component {
    constructor (props) {
        super(props)
        this.loaded = false
        this.gameStarted = false
        this.wrapper = null
        this.scene = null
        this.scenes = null
        this.canvas = null
        this.ctx = null
        this.delta = null
        this.lastLoop = null
        this.timer = null
        this.frameTime = null
        this.fps = 0
        this.timeoutsPool = {}
        this.frameStart = getPerformance()
        this.then = getPerformance()
        this.debug = props.config[CONFIG.DEBUG_MODE]

        this.countFPS = this.countFPS.bind(this)
        this.countTime = this.countTime.bind(this)
        this.checkTimeout = this.checkTimeout.bind(this)
        this.startTimeout = this.startTimeout.bind(this)
        this.stopTimeout = this.stopTimeout.bind(this)
        this.startGame = this.startGame.bind(this)
    }

    componentDidMount () {
        const { startTicker, viewport: { resolutionX } } = this.props
        this.ctx = this.canvas.context
        this.map = tmxParser(map).then((data) => {
            this.loaded = true
            this.world = new World(data, ENTITIES, this)
            this.world.setShadowCastingLayer(LAYERS.MAIN, 10)

            this.player = this.world.getObjectByType(ENTITIES_TYPE.PLAYER, LAYERS.OBJECTS)

            this.camera = new Camera(this)
            this.camera.setSurfaceLevel(this.world.getProperty('surfaceLevel'))
            this.camera.x = -(this.player.x + (this.player.width / 2) - (resolutionX / 2))

            this.overlay = new Overlay(this)
            this.overlay.fadeIn()
            this.startTimeout('intro', 3000, this.startGame)
        })
        // this.setOpenGlEffects()
        startTicker()
    }

    componentDidUpdate () {
        if (this.ctx) {
            if (this.loaded) {
                const { config, ticker } = this.props
                this.frameStart = getPerformance()
                this.delta = this.frameStart - this.then
                this.debug = config[CONFIG.DEBUG_MODE]

                if (!this.timer) this.timer = moment()
                if (this.delta > ticker.interval) {
                    this.gameStarted && this.world.update()
                    this.camera.update()
                    this.countFPS()
                }
                this.draw()
            }

            /** Experimental: create CRT scanlines effect */
            if (this.glcanvas) {
                const { assets, viewport: { width, height } } = this.props
                this.ctx.drawImage(assets[ASSETS.SCANLINES], 0, 0, width, height)
                this.texture.loadContentsOf(this.source)
                this.glcanvas
                    .draw(this.texture)
                    .bulgePinch(
                        Math.round(width / 2),
                        Math.round(height / 2),
                        width * 0.75,
                        0.12
                    )
                    .vignette(0.25, 0.74)
                    .update()
            }
        }
    }

    render () {
        const {
            config,
            onConfig,
            onKey,
            viewport: { width, height }
        } = this.props

        return (
            <div ref={(ref) => { this.wrapper = ref }}>
                <Canvas ref={(ref) => { this.canvas = ref }} {...{ width, height }} />
                <Inputs {...{ onKey }} />
                <Debug {...{ config, onConfig, fps: this.fps }} />
            </div>
        )
    }

    startGame () {
        this.gameStarted = true
        this.camera.setFollow(this.player)
        this.camera.center()
    }

    draw () {
        if (this.loaded) {
            const { viewport } = this.props
            const { ctx, camera, player, overlay, world } = this
            const {
                resolutionX,
                resolutionY,
                scale
            } = viewport

            ctx.imageSmoothingEnabled = false
            ctx.save()
            ctx.scale(scale, scale)
            ctx.clearRect(0, 0, resolutionX, resolutionY)

            this.renderBackground()

            world.toggleDynamicLights(camera.underground || player.underground || player.inDark > 0)
            world.draw()

            this.gameStarted
                ? overlay.displayHUD()
                : overlay.displayIntro()

            this.checkTimeout('player_map') && overlay.displayMap()
            overlay.update()
            ctx.restore()
        }
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
            player,
            props: { assets },
            camera: { follow, x, y, underground }
        } = this
        if (underground || player.underground || player.inDark > 0) {
            ctx.drawImage(assets[ASSETS.LIGHTING],
                -400 + (follow.x + x + follow.width / 2),
                -400 + (follow.y + y + follow.height / 2)
            )
        }
    }

    countFPS () {
        const now = getPerformance()
        const currentFrameTime = now - this.lastLoop
        this.then = this.frameStart - (this.delta % this.props.ticker.interval)
        this.frameTime += (currentFrameTime - this.frameTime) / 100
        this.fps = 1000 / this.frameTime
        this.lastLoop = now
    }

    countTime () {
        const ms = moment().diff(moment(this.timer))
        const d = moment.duration(ms)
        return d.asHours() >= 1
            ? Math.floor(d.asHours()) + moment.utc(ms).format(':mm:ss')
            : moment.utc(ms).format('mm:ss')
    }

    checkTimeout (name) {
        return this.timeoutsPool[name] || null
    }

    startTimeout (name, duration, callback = noop) {
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
    /** Experimental */
    setOpenGlEffects () {
        try {
            this.source = findDOMNode(this.canvas)
            this.glcanvas = fx.canvas()
            this.texture = this.glcanvas.texture(this.source)
            // Hide the source 2D canvas and put the WebGL Canvas in its place
            this.source.parentNode.insertBefore(this.glcanvas, this.source)
            this.source.style.display = 'none'
            this.glcanvas.className = this.source.className
            this.glcanvas.id = this.source.id
            this.source.id = `old_${this.source.id}`
        }
        catch (e) {
            return
        }
    }
    /**/
}

GameScene.propTypes = propTypes
