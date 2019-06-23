import { CONFIG, SCENES } from '../lib/constants'
import { UPDATE_CONFIG } from '../actions'

const initialState = {
    [CONFIG.SCENE]: SCENES.GAME,
    [CONFIG.DEBUG_MODE]: true,
    [CONFIG.DISABLE_SOUNDS]: false
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
