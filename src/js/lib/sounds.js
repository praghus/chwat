import {
    SOUND_PLAYER_JUMP,
    SOUND_PLAYER_GET,
    SOUND_MAIN_LOOP
} from '../actions/sounds'

export const soundsData = {
    [SOUND_PLAYER_JUMP]: '../../assets/sounds/jump.mp3',
    [SOUND_PLAYER_GET]: '../../assets/sounds/get.mp3',
    [SOUND_MAIN_LOOP]: {
        urls: ['../../assets/sounds/loop.mp3'],
        loop: 1
    }
}
