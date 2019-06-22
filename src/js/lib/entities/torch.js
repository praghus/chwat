import ActiveElement from '../models/active-element'
import { COLORS } from '../../lib/constants'

export default class Torch extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.y -= this.height
        this.light = {
            distance: 24,
            color: COLORS.TRANS_WHITE
        }
    }
}
