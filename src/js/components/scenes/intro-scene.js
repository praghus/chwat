import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Canvas from '../canvas'
import Debug from '../debug'
import Inputs from '../inputs'
import { displayText, isProduction } from '../../lib/utils/helpers'
import { ASSETS, COLORS, CONFIG, SCENES } from '../../lib/constants'
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
    setScene: PropTypes.func.isRequired,
    startTicker: PropTypes.func.isRequired,
    ticker: tickerPropType.isRequired,
    viewport: viewportPropType.isRequired
}

export default class IntroScene extends Component {
    constructor (props) {
        super(props)
        this.wrapper = null
        this.canvas = null
        this.ctx = null
    }

    componentDidMount () {
        const { startTicker } = this.props
        startTicker()
    }

    componentDidUpdate () {
        const { ctx, ctxBuffer } = this.canvas
        if (ctx && ctxBuffer) {
            const { assets, config, viewport: { scale, width, height } } = this.props
            const resolutionX = Math.round(width / scale)
            const resolutionY = Math.round(height / scale)
            ctxBuffer.imageSmoothingEnabled = false
            ctxBuffer.save()
            ctxBuffer.scale(scale, scale)
            ctxBuffer.fillStyle = COLORS.BLUE_SKY
            ctxBuffer.fillRect(0, 0, resolutionX, resolutionY)
            ctxBuffer.drawImage(assets[ASSETS.SKY], 0, 0, resolutionX, resolutionY)
            ctxBuffer.drawImage(assets[ASSETS.MOUNTAINS], -495, -30)
            ctxBuffer.drawImage(assets[ASSETS.LOGO], Math.ceil(resolutionX / 2) - 66, Math.ceil(resolutionY / 2) - 34)
            displayText(
                'PRESS ANY KEY TO START',
                Math.ceil(resolutionX / 2) - 54, resolutionY - 16
            )(ctxBuffer, assets)
            ctxBuffer.restore()
            if (config[CONFIG.CRT_EFFECT]) {
                ctxBuffer.drawImage(assets[ASSETS.CRT], 0, 0, width, height)
                ctxBuffer.drawImage(assets[ASSETS.SCANLINES], 0, 0, width, 1000)
            }
            ctx.drawImage(ctxBuffer.canvas, 0, 0)
        }
    }

    render () {
        const { config, onConfig, setScene, viewport: { width, height } } = this.props
        const onKey = (key, pressed) => key && pressed && setScene(SCENES.GAME)

        return (
            <div ref={(ref) => { this.wrapper = ref }}>
                <Canvas ref={(ref) => { this.canvas = ref }} {...{ config, width, height }} />
                <Inputs {...{ onKey }} />
                {!isProduction && <Debug {...{ config, onConfig }} />}
            </div>
        )
    }
}

IntroScene.propTypes = propTypes
