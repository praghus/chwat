import { requireAll } from '../utils/helpers'

const allSounds = require.context('../../../assets/sounds', true, /.*\.(mp3|wav)$/)
const loadedSounds = requireAll(allSounds).reduce(
    (state, sound) => ({ ...state, [sound.split('-')[0]]: sound }), {}
)

export const SOUNDS = {
    PLAYER_JUMP: 'jump',
    PLAYER_GET: 'get',
    SLIME: 'slime'
}

export const soundsData = {
    [SOUNDS.PLAYER_JUMP]: { src: [loadedSounds[SOUNDS.PLAYER_JUMP]] },
    [SOUNDS.PLAYER_GET]: { src: [loadedSounds[SOUNDS.PLAYER_GET]] },
    [SOUNDS.SLIME]: { src: [loadedSounds[SOUNDS.SLIME]] }
}

