import { GameEntity } from '../models'

export default class KillZone extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 1000
    }
}
