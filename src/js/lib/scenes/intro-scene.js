import Overlay from '../models/overlay'
import { Game } from 'tiled-platformer-lib'
import { isMobileDevice } from '../../lib/utils/helpers'
import { ASSETS, COLORS, INPUTS, SCENES } from '../../lib/constants'

export default class IntroScene extends Game {
    constructor (ctx, props) {
        super(ctx, props)
        this.overlay = new Overlay(this)
        this.loaded = true
        this.overlay.fadeIn()
    }

    onUpdate () {
        const {
            input,
            onKey,
            setScene
        } = this.props
        if (input.keyPressed[INPUTS.INPUT_ACTION]) {
            onKey(INPUTS.INPUT_ACTION, false)
            setScene(SCENES.GAME)
        }
    }

    render () {
        const {
            ctx,
            overlay,
            props: {
                assets,
                viewport: {
                    resolutionX,
                    resolutionY
                }
            }
        } = this

        ctx.fillStyle = COLORS.BLUE_SKY
        ctx.fillRect(0, 0, resolutionX, resolutionY)
        ctx.drawImage(assets['bg6'], 0, 0)
        ctx.drawImage(assets[ASSETS.MOUNTAINS], -495, -30)
        ctx.drawImage(assets[ASSETS.LOGO], Math.ceil(resolutionX / 2) - 66, Math.ceil(resolutionY / 2) - 45)

        overlay.displayText(isMobileDevice()
            ? '    TAP TO BEGIN    '
            : 'PRESS SPACE TO BEGIN',
        Math.ceil(resolutionX / 2) - 50, resolutionY - 10)
    }
}
