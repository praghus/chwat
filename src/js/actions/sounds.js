export const SOUND_MAIN_LOOP = 'SOUND_MAIN_LOOP'
export const SOUND_PLAYER_JUMP = 'SOUND_PLAYER_JUMP'
export const SOUND_PLAYER_GET = 'SOUND_PLAYER_GET'

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

