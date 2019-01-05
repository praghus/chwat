import { requireAll } from '../lib/helpers'
import {
    SOUND_PLAYER_JUMP,
    SOUND_PLAYER_GET
    // SOUND_MAIN_LOOP
} from '../actions/sounds'

const allSounds = require.context('../../assets/sounds', true, /.*\.(mp3|wav)$/)
const sounds = requireAll(allSounds).reduce(
    (state, sound) => ({...state, [sound.split('-')[0]]: sound}), {}
)

export const soundsData = {
    [SOUND_PLAYER_JUMP]: sounds[SOUND_PLAYER_JUMP],
    [SOUND_PLAYER_GET]: sounds[SOUND_PLAYER_GET]
    // [SOUND_MAIN_LOOP]: {
    //     urls: [sounds[SOUND_MAIN_LOOP]],
    //     loop: 1
    // }
}
