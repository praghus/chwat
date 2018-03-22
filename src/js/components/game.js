import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Canvas from './canvas'
import { IntroScene, GameScene } from '../models/scenes'
import { getKeyPressed, SCENES } from '../lib/constants'

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
        this.scene = null
        this.scenes = null
        this.getScene = this.getScene.bind(this)
        this.setScene = this.setScene.bind(this)
    }

    componentDidMount () {
        const { onKey, startTicker } = this.props
        this.ctx = this.canvas.context
        this.scenes = {
            [SCENES.INTRO]: new IntroScene(this),
            [SCENES.GAME]: new GameScene(this)
        }
        // this.wrapper.addEventListener('click', onMouse, false)
        document.addEventListener('keydown', ({code}) => onKey(getKeyPressed(code), true))
        document.addEventListener('keyup', ({code}) => onKey(getKeyPressed(code), false))
        this.setScene(SCENES.INTRO)
        startTicker()
    }

    componentWillReceiveProps (nextProps) {
        if (this.scene) {
            this.scene.update(nextProps)
        }
    }

    componentDidUpdate () {
        if (this.ctx && this.scene) {
            this.scene.draw(this.ctx)
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

    setScene (scene) {
        this.scene = this.getScene(scene)
    }

    getScene (scene) {
        return this.scenes[scene]
    }
}

Game.propTypes = propTypes
