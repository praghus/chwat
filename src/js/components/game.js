import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Canvas from './canvas'
import { IntroScene, GameScene } from '../models/scenes'
import { getKeyPressed, STAGES } from '../lib/constants'

const propTypes = {
    assets: PropTypes.object.isRequired,
    input: PropTypes.object.isRequired,
    onMouse: PropTypes.func.isRequired,
    onKey: PropTypes.func.isRequired,
    playSound: PropTypes.func.isRequired,
    startTicker: PropTypes.func.isRequired,
    ticker: PropTypes.object.isRequired,
    viewport: PropTypes.object
}

export default class Game extends Component {
    constructor (props) {
        super(props)
        this.viewport = props.viewport
        this.ticker = props.ticker
        this.assets = props.assets
        this.playSound = props.playSound.bind(this)
        this.wrapper = null
        this.loadedCount = 0
        this.input = null
        this.assetsLoaded = false
        this.currentStage = null
        this.stage = null
        this.stages = null
    }

    componentDidMount () {
        const { onKey, startTicker } = this.props
        this.ctx = this.canvas.context
        this.stages = {
            [STAGES.INTRO]: new IntroScene(this),
            [STAGES.GAME]: new GameScene(this)
        }
        // this.wrapper.addEventListener('click', onMouse, false)
        document.addEventListener('keydown', ({code}) => onKey(getKeyPressed(code), true))
        document.addEventListener('keyup', ({code}) => onKey(getKeyPressed(code), false))

        this.setStage(STAGES.GAME)

        startTicker()
    }

    componentWillReceiveProps (nextProps) {
        switch (this.currentStage) {
        case STAGES.INTRO:
            // intro state
            break
        case STAGES.GAME:
            this.stage.update(nextProps)
            break
        }
    }

    componentDidUpdate () {
        if (this.ctx && this.stage) {
            this.stage.draw()
        }
    }

    componentWillUnmount () {
        // this.wrapper.removeEventListener('click', this.updateMousePos, false)
        document.removeEventListener('keydown', ({code}) => this.onKey(code, true))
        document.removeEventListener('keyup', ({code}) => this.onKey(code, false))
    }

    render () {
        const { width, height } = this.props.viewport
        return (
            <div ref={(ref) => { this.wrapper = ref }}>
                <Canvas ref={(ref) => { this.canvas = ref }} {...{ width, height }} />
            </div>
        )
    }

    setStage (stage) {
        this.currentStage = stage
        this.stage = this.getStage(stage)
    }

    getStage (stage) {
        return this.stages[stage]
    }
}

Game.propTypes = propTypes
