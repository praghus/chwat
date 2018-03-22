import {FONTS, INPUTS} from '../lib/constants'

export default class Scene {
    constructor (game) {
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
        this.blackOverlay = 1
        this.countFPS = this.countFPS.bind(this)
        this.fontPrint = this.fontPrint.bind(this)
    }

    update (nextProps) {
        const { assets, input, ticker, viewport } = nextProps

        this.lastInput = Object.assign({}, this.input)
        this.assets = assets
        this.ticker = ticker
        this.viewport = viewport
        this.input = Object.assign({}, input.keyPressed)
        this.frameStart = performance.now()
        this.delta = this.frameStart - this.then

        if (this.fetchAction(INPUTS.INPUT_DEBUG)) {
            this.debug = !this.debug
        }
    }

    draw (ctx) {
        // draw
    }

    fontPrint (ctx, text, x, y, font = FONTS.FONT_NORMAL) {
        const { assets } = this
        text.split('\n').reverse().map((output, index) => {
            for (let i = 0; i < output.length; i++) {
                const chr = output.charCodeAt(i)
                ctx.drawImage(assets[font.name],
                    ((chr) % 16) * font.size, Math.ceil(((chr + 1) / 16) - 1) * font.size,
                    font.size, font.size,
                    Math.floor(x + (i * font.size)), Math.floor(y - (index * (font.size + 1))),
                    font.size, font.size
                )
            }
        })
    }

    countFPS () {
        const now = performance.now()
        const currentFrameTime = now - this.lastLoop
        this.then = this.frameStart - (this.delta % this.ticker.interval)
        this.frameTime += (currentFrameTime - this.frameTime) / 100
        this.fps = 1000 / this.frameTime
        this.lastLoop = now
    }

    fetchAction (action){
        return this.input[action] && !this.lastInput[action]
    }
}
