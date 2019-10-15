import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { GameScene, IntroScene } from '../components/scenes'
import { requireAll } from '../lib/utils/helpers'
import { CONFIG, SCENES } from '../lib/constants'
import {
    configPropType,
    inputPropType,
    tickerPropType,
    viewportPropType
} from '../lib/prop-types'
import {
    startTicker,
    tickTime,
    updateConfig,
    updateKeyPressed,
    updateMousePos,
    playSound
} from '../actions'

const allImages = require.context('../../assets/images', true, /.*\.png/)
const images = requireAll(allImages).reduce(
    (state, image) => ({ ...state, [image.split('-')[0]]: image }), {}
)

const propTypes = {
    config: configPropType.isRequired,
    input: inputPropType.isRequired,
    onKey: PropTypes.func.isRequired,
    onMouse: PropTypes.func.isRequired,
    sfx: PropTypes.func.isRequired,
    ticker: tickerPropType.isRequired,
    tickerStart: PropTypes.func.isRequired,
    tickerTick: PropTypes.func.isRequired,
    viewport: viewportPropType
}

class AppContainer extends Component {
    constructor (props) {
        super(props)
        this.state = {
            loadedCount: 0,
            assetsLoaded: false
        }
        this.assets = {}
        this.wrapper = null
        this.onAssetLoad = this.onAssetLoad.bind(this)
        this.startTicker = this.startTicker.bind(this)
    }

    componentDidMount () {
        Object.keys(images).map((key) => {
            this.assets[key] = new Image()
            this.assets[key].src = images[key]
            this.assets[key].addEventListener('load', this.onAssetLoad)
        })
    }

    render () {
        const { config: { scene } } = this.props
        const { loadedCount, assetsLoaded } = this.state
        if (!assetsLoaded) {
            const percent = Math.round((loadedCount / Object.values(this.assets).length) * 100)
            return (<div className='preloader'>Loading assets {percent}%</div>)
        }

        const { assets, startTicker } = this
        const sceneProps = {
            ...this.props, assets, startTicker
        }
        switch (scene) {
        case SCENES.INTRO:
            return <IntroScene {...sceneProps} />
        case SCENES.GAME:
            return <GameScene {...sceneProps} />
        }
    }

    onAssetLoad () {
        this.setState({ loadedCount: ++this.state.loadedCount })
        if (this.state.loadedCount === Object.keys(images).length) {
            this.setState({ assetsLoaded: true })
        }
    }

    startTicker () {
        const { ticker, tickerStart, tickerTick } = this.props
        const { requestAnimationFrame } = window

        const tick = (time) => {
            tickerTick(time)
            requestAnimationFrame(tick)
        }
        if (!ticker.tickerStarted) {
            tickerStart()
            tick()
        }
    }
}

const mapStateToProps = (state) => {
    return {
        config: state.config,
        input: state.input,
        ticker: state.ticker,
        viewport: state.viewport
    }
}

function mergeProps (stateProps, dispatchProps, ownProps) {
    const { config } = stateProps
    const { dispatch } = dispatchProps

    return {
        ...stateProps,
        ...ownProps,
        onKey: (key, pressed) => dispatch(updateKeyPressed(key, pressed)),
        onMouse: (event) => dispatch(updateMousePos(event.x, event.y)),
        tickerStart: () => dispatch(startTicker(performance.now())),
        tickerTick: (time) => dispatch(tickTime(time)),
        onConfig: (key, value) => dispatch(updateConfig(key, value)),
        setScene: (scene) => dispatch(updateConfig(CONFIG.SCENE, scene)),
        sfx: (type) => !config[CONFIG.DISABLE_SOUNDS] && dispatch(playSound(type))
    }
}

AppContainer.propTypes = propTypes

export default connect(mapStateToProps, null, mergeProps)(AppContainer)
