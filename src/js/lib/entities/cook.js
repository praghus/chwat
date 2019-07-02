import Character from '../models/character'

export default class Cook extends Character {
    update () {
        if (this.onScreen()) {
            this.animate(this.animations.STANDING)
        }
    }
}
