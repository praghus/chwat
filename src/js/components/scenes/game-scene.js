import React, { Component } from 'react'
import PropTypes from 'prop-types'
import fx from 'glfx'
import moment from 'moment'
import Debug from '../debug'
import Canvas from '../canvas'
import Inputs from '../inputs'
import { isEqual } from 'lodash'
import { findDOMNode } from 'react-dom'
import { tmxParser } from 'tmx-tiledmap'
import { Camera, Scene } from 'tiled-platformer-lib'
import {
    noop,
    isProduction,
    getPerformance
} from '../../lib/utils/helpers'
import {
    BackgroundLayer,
    EndLayer,
    GameOverLayer,
    OverlayLayer
} from '../../lib/models'
import {
    ASSETS,
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

import map from '../../../assets/levels/map.tmx'

const propTypes = {
    assets: assetPropType.isRequired,
    config: configPropType.isRequired,
    input: inputPropType.isRequired,
    onConfig: PropTypes.func.isRequired,
    onKey: PropTypes.func.isRequired,
    onMouse: PropTypes.func.isRequired,
    playSound: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    startTicker: PropTypes.func.isRequired,
    ticker: tickerPropType.isRequired,
    viewport: viewportPropType.isRequired
}

export default class GameScene extends Component {
    constructor (props) {
        super(props)
        this.loaded = false
        this.finished = false
        this.gameOver = false
        this.paused = false
        this.wrapper = null
        this.scene = null
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

        this.onKey = this.onKey.bind(this)
        this.over = this.over.bind(this)
        this.pause = this.pause.bind(this)
        this.completed = this.completed.bind(this)
        this.countFPS = this.countFPS.bind(this)
        this.countTime = this.countTime.bind(this)
        this.checkTimeout = this.checkTimeout.bind(this)
        this.startTimeout = this.startTimeout.bind(this)
        this.stopTimeout = this.stopTimeout.bind(this)
    }

    componentDidMount () {
        const { startTicker, assets, viewport } = this.props
        this.ctx = this.canvas.context
        this.map = tmxParser(map).then((data) => {
            this.loaded = true
            this.overlay = new OverlayLayer(this)

            this.scene = new Scene(this, { viewport, assets })
            this.scene.addLayer(new BackgroundLayer(this))
            this.scene.addTmxMap(data, ENTITIES)
            this.scene.setShadowCastingLayer(LAYERS.MAIN)
            this.scene.addLayer(this.overlay)
            this.scene.setGravity(this.scene.getMapProperty('gravity'))

            this.player = this.scene.getObjectByType(ENTITIES_TYPE.PLAYER, LAYERS.OBJECTS)

            this.camera = new Camera(this)
            this.camera.setSurfaceLevel(this.scene.getMapProperty('surfaceLevel'))
            this.camera.setFollow(this.player)
            this.camera.center()

            this.overlay.fadeIn()
        })
        // this.setOpenGlEffects()
        startTicker()
    }

    componentDidUpdate (prevProps) {
        if (this.ctx) {
            if (this.loaded) {
                const { config, ticker, viewport } = this.props
                const { camera, player, scene } = this

                this.frameStart = getPerformance()
                this.delta = this.frameStart - this.then
                this.debug = config[CONFIG.DEBUG_MODE]

                if (!isEqual(viewport, prevProps.viewport)) {
                    this.scene.resize(viewport)
                    player.cameraFollow()
                }

                if (!this.timer) this.timer = moment()

                if (this.delta > ticker.interval && !this.paused) {
                    this.scene.update()
                    this.camera.update()
                    this.countFPS()
                    scene.toggleDynamicLights(camera.underground || player.underground || player.inDark > 0)
                }
                scene.draw()
            }

            // @todo: move to Canvas component
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
            viewport: { width, height }
        } = this.props

        return (
            <div ref={(ref) => { this.wrapper = ref }}>
                <Canvas ref={(ref) => { this.canvas = ref }} {...{ width, height }} />
                <Inputs onKey={this.onKey} />
                {!isProduction && <Debug {...{ config, onConfig, fps: this.fps }} />}
            </div>
        )
    }

    onKey (key, pressed) {
        if (!this.gameOver || !this.finished) {
            this.props.onKey(key, pressed)
        }
    }

    over () {
        if (!this.gameOver) {
            this.gameOver = true
            this.scene.addLayer(new GameOverLayer(this), 1000)
        }
    }

    completed () {
        if (!this.finished) {
            this.finished = true
            this.scene.addLayer(new EndLayer(this), 1000)
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

    pause (paused = true) {
        this.paused = paused
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
