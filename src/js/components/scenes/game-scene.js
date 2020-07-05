import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Debug from '../debug'
import Canvas from '../canvas'
import Inputs from '../inputs'
import map from '../../../assets/levels/map.tmx'
import { isEqual } from 'lodash'
import { tmx } from 'tmx-tiledmap'
import { Scene } from 'tiled-platformer-lib'
import { isProduction, getPerformance } from '../../lib/utils/helpers'
import { BackgroundLayer, LightLayer, OverlayLayer } from '../../lib/models'
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
        this.lastLoop = null
        this.frameTime = null
        this.fps = 60
        this.then = getPerformance()
        this.onKey = this.onKey.bind(this)
    }

    componentDidMount () {
        const { assets, startTicker, setScene, viewport } = this.props
        this.map = tmx(map).then((data) => {
            const scene = new Scene(assets, viewport, { setScene, sfx: (snd) => this.props.sfx(snd) })
            scene.createCustomLayer(BackgroundLayer)
            scene.addTmxMap(data, ENTITIES)
            scene.createCustomLayer(LightLayer)
            scene.createCustomLayer(OverlayLayer)
            scene.addPlayer(scene.getObjectByType(ENTITIES_TYPE.PLAYER, LAYERS.OBJECTS))
            scene.getLayer(LAYERS.OVERLAY).fadeIn()
            scene.setProperty('gravity', 0.5)
            scene.camera.center()
            this.scene = scene
            this.loaded = true
        })
        startTicker()
    }

    componentDidUpdate (prevProps) {
        const { ctx, ctxBuffer } = this.canvas
        if (ctx && ctxBuffer && this.loaded) {
            const { assets, config, input, ticker, viewport } = this.props
            const { scene } = this
            const delta = ticker.lastFrameTime - this.then

            if (!isEqual(viewport, prevProps.viewport)) {
                scene.resize(viewport)
                scene.player.cameraFollow(this.scene)
            }
            if (delta > ticker.interval) {
                if (!scene.player.paused) {
                    scene.player.inDark = false
                    scene.update(input, delta)
                    scene.setProperty('debug', config[CONFIG.DEBUG_MODE])
                    scene.setProperty('inDark', scene.camera.y < -740 || scene.player.inDark)
                }
                scene.draw(ctxBuffer)
                if (config[CONFIG.CRT_EFFECT]) {
                    ctxBuffer.drawImage(assets[ASSETS.CRT], 0, 0, viewport.width, viewport.height)
                    ctxBuffer.drawImage(assets[ASSETS.SCANLINES], 0, 0, viewport.width, 1000)
                }
                ctx.drawImage(ctxBuffer.canvas, 0, 0)
                this.countFPS()
                this.then = ticker.lastFrameTime - (delta % ticker.interval)
            }
        }
    }

    render () {
        const { config, onConfig, viewport: { width, height } } = this.props
        return (
            <div className='game-scene' ref={(ref) => { this.wrapper = ref }}>
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
        this.frameTime += (now - this.lastLoop - this.frameTime) / 100
        this.fps = 1000 / this.frameTime
        this.lastLoop = now
    }
}

GameScene.propTypes = propTypes
