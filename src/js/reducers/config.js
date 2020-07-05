import { CONFIG, SCENES } from '../lib/constants'
import { UPDATE_CONFIG } from '../actions'

const initialState = {
    [CONFIG.CRT_EFFECT]: false,
    [CONFIG.DEBUG_MODE]: false,
    [CONFIG.DISABLE_SOUNDS]: false,
    [CONFIG.SCENE]: SCENES.INTRO
}

const actionsMap = {
    [UPDATE_CONFIG]: (state, action) => {
        return {
            ...state,
            [action.key]: action.value
        }
    }
}

export default function reducer (state = initialState, action) {
    const fn = actionsMap[action.type]
    return fn ? fn(state, action) : state
}
