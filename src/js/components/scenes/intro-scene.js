import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Canvas from '../canvas'
import Inputs from '../inputs'
import { OverlayLayer } from '../../lib/models'
import { ASSETS, COLORS, SCENES } from '../../lib/constants'
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
        this.ctx = this.canvas.context
        this.overlay = new OverlayLayer(this)
        startTicker()
    }

    componentDidUpdate () {
        if (this.ctx) {
            this.draw()
        }
    }

    render () {
        const {
            setScene,
            viewport: { width, height }
        } = this.props

        const onKey = (key, pressed) => key && pressed && setScene(SCENES.GAME)

        return (
            <div ref={(ref) => { this.wrapper = ref }}>
                <Canvas ref={(ref) => { this.canvas = ref }} {...{ width, height }} />
                <Inputs {...{ onKey }} />
            </div>
        )
    }

    draw () {
        const { ctx, overlay } = this
        const {
            assets, viewport: {
                scale,
                resolutionX,
                resolutionY
            }
        } = this.props

        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)

        ctx.fillStyle = COLORS.BLUE_SKY
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.drawImage(assets[ASSETS.SKY], 0, 0)
        ctx.drawImage(assets[ASSETS.MOUNTAINS], -495, -30)
        ctx.drawImage(assets[ASSETS.LOGO], Math.ceil(resolutionX / 2) - 66, Math.ceil(resolutionY / 2) - 34)

        overlay.displayText('PRESS ANY KEY TO START', Math.ceil(resolutionX / 2) - 54, resolutionY - 16)

        ctx.restore()
    }
}

IntroScene.propTypes = propTypes
