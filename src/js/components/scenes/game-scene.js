import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Debug from '../debug'
import Canvas from '../canvas'
import Inputs from '../inputs'
import map from '../../../assets/levels/map.tmx'
import { isEqual } from 'lodash'
import { tmxParser } from 'tmx-tiledmap'
import { Scene } from 'tiled-platformer-lib'
import { isProduction, getPerformance } from '../../lib/utils/helpers'
import { BackgroundLayer, OverlayLayer } from '../../lib/models'
import { ASSETS, CONFIG, ENTITIES, ENTITIES_TYPE, LAYERS } from '../../lib/constants'
import { assetPropType, inputPropType, tickerPropType, viewportPropType, configPropType } from '../../lib/prop-types'

const propTypes = {
    assets: assetPropType.isRequired,
    config: configPropType.isRequired,
    input: inputPropType.isRequired,
    onConfig: PropTypes.func.isRequired,
    onKey: PropTypes.func.isRequired,
    onMouse: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    sfx: PropTypes.func.isRequired,
    startTicker: PropTypes.func.isRequired,
    ticker: tickerPropType.isRequired,
    viewport: viewportPropType.isRequired
}

export default class GameScene extends Component {
    constructor (props) {
        super(props)
        this.loaded = false
        this.wrapper = null
        this.scene = null
        this.canvas = null
        this.delta = null
        this.lastLoop = null
        this.frameTime = null
        this.fps = 60
        this.frameStart = getPerformance()
        this.then = getPerformance()
        this.onKey = this.onKey.bind(this)
    }

    componentDidMount () {
        const { assets, startTicker, setScene, viewport } = this.props
        this.map = tmxParser(map).then((data) => {
            this.scene = new Scene(assets, viewport, { setScene, sfx: (snd) => this.props.sfx(snd) })
            this.scene.createCustomLayer(BackgroundLayer)
            this.scene.addTmxMap(data, ENTITIES)
            this.scene.createShadowCastingLayer(LAYERS.MAIN)
            this.scene.setGravity(this.scene.getMapProperty('gravity'))
            this.scene.createCustomLayer(OverlayLayer)
            this.scene.addPlayer(this.scene.getObjectByType(ENTITIES_TYPE.PLAYER, LAYERS.OBJECTS))
            this.scene.getLayer(LAYERS.OVERLAY).fadeIn()
            this.scene.camera.center()
            this.loaded = true
        })
        startTicker()
    }

    componentDidUpdate (prevProps) {
        const { ctx, ctxBuffer } = this.canvas
        if (ctx && ctxBuffer && this.loaded) {
            const { assets, config, input, ticker, viewport } = this.props
            const { scene } = this
            const paused = scene.getProperty('pause')

            this.frameStart = getPerformance()
            this.delta = this.frameStart - this.then

            if (!isEqual(viewport, prevProps.viewport)) {
                scene.resize(viewport)
                scene.player.cameraFollow()
            }
            if (this.delta > ticker.interval && !paused) {
                scene.player.inDark = false
                scene.player.onInput(input)
                scene.update()
                scene.setProperty('debug', config[CONFIG.DEBUG_MODE])
                scene.setProperty('inDark', scene.camera.y < -740 || scene.player.inDark)
                this.countFPS()
            }
            scene.draw(ctxBuffer)
            if (config[CONFIG.CRT_EFFECT]) {
                ctxBuffer.drawImage(assets[ASSETS.SCANLINES], 0, 0, viewport.width, 1000)
            }
            ctx.drawImage(ctxBuffer.canvas, 0, 0)
        }
    }

    render () {
        const { config, onConfig, viewport: { width, height } } = this.props
        return (
            <div ref={(ref) => { this.wrapper = ref }}>
                <Canvas ref={(ref) => { this.canvas = ref }} {...{ config, width, height }} />
                <Inputs onKey={this.onKey} />
                {!isProduction && <Debug {...{ config, onConfig, fps: this.fps }} />}
            </div>
        )
    }

    onKey (key, pressed) {
        const { player } = this.scene
        if (!player.gameOver || !player.gameFinished) {
            this.props.onKey(key, pressed)
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
}

GameScene.propTypes = propTypes
