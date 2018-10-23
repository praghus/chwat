import Overlays from './overlays'
import { INPUTS } from '../lib/constants'

export default class Scene {
    constructor (game) {
        this.ctx = game.ctx
        this.assets = game.assets
        this.viewport = game.viewport
        this.ticker = game.ticker
        this.playSound = game.playSound
        this.setScene = game.setScene
        this.fps = 0
        this.debug = false
        this.lastInput = null
        this.delta = null
        this.lastLoop = null
        this.frameTime = null
        this.frameStart = performance.now()
        this.then = performance.now()
        this.countFPS = this.countFPS.bind(this)
        this.fetchAction = this.fetchAction.bind(this)
        this.overlays = new Overlays(this)
    }

    update (nextProps) {
        const { assets, input, ticker, viewport } = nextProps

        this.lastInput = {...this.input}
        this.assets = assets
        this.ticker = ticker
        this.viewport = viewport
        this.input = {...input.keyPressed}
        this.frameStart = performance.now()
        this.delta = this.frameStart - this.then

        if (this.fetchAction(INPUTS.INPUT_DEBUG)) {
            this.debug = !this.debug
        }
    }

    draw () {
        // draw
    }

    countFPS () {
        const now = performance.now()
        const currentFrameTime = now - this.lastLoop
        this.then = this.frameStart - (this.delta % this.ticker.interval)
        this.frameTime += (currentFrameTime - this.frameTime) / 100
        this.fps = 1000 / this.frameTime
        this.lastLoop = now
    }

    fetchAction (action) {
        return this.input[action] && !this.lastInput[action]
    }
}
