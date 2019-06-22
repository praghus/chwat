export const PLAYER = {
    WALK_LEFT: {
        frames: [
            [704, 16, 60], [736, 16, 60], [768, 16, 60], [800, 16, 60],
            [832, 16, 60], [864, 16, 60], [896, 16, 60], [928, 16, 60]
        ],
        width: 32,
        height: 48,
        loop: true
    },
    WALK_RIGHT: {
        frames: [
            [0, 16, 60], [32, 16, 60], [64, 16, 60], [96, 16, 60],
            [128, 16, 60], [160, 16, 60], [192, 16, 60], [224, 16, 60]
        ],
        width: 32,
        height: 48,
        loop: true
    },
    JUMP_LEFT: {
        frames: [
            [512, 16, 60], [544, 16, 60], [576, 16, 150], [608, 16, 150]
        ],
        width: 32,
        height: 48,
        loop: false
    },
    JUMP_RIGHT: {
        frames: [
            [256, 16, 60], [288, 16, 60], [320, 16, 150], [352, 16, 150]
        ],
        width: 32,
        height: 48,
        loop: false
    },
    STAND_LEFT: {
        strip: { x: 480, y: 16, frames: 1, duration: 0 },
        width: 32,
        height: 48,
        loop: false
    },
    STAND_RIGHT: {
        strip: { x: 448, y: 16, frames: 1, duration: 0 },
        width: 32,
        height: 48,
        loop: false
    },
    FALL_LEFT: {
        strip: { x: 672, y: 16, frames: 1, duration: 1000 },
        width: 32,
        height: 48,
        loop: false
    },
    FALL_RIGHT: {
        strip: { x: 416, y: 16, frames: 1, duration: 1000 },
        width: 32,
        height: 48,
        loop: false
    }
}
