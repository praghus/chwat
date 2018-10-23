export const SOUND_MAIN_LOOP = 'loop'
export const SOUND_PLAYER_JUMP = 'jump'
export const SOUND_PLAYER_GET = 'get'

export function playMusic () {
    return {
        type: SOUND_MAIN_LOOP,
        meta: { sound: SOUND_MAIN_LOOP }
    }
}

export function playerJump () {
    return {
        type: SOUND_PLAYER_JUMP,
        meta: { sound: SOUND_PLAYER_JUMP }
    }
}

export function playerGet () {
    return {
        type: SOUND_PLAYER_GET,
        meta: { sound: SOUND_PLAYER_GET }
    }
}

