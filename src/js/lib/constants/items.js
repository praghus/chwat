import { ENTITIES_TYPE } from './entities'

export const ITEMS_TYPE = {
    CRANK: 'crank'
}

export const ITEMS = {
    [ITEMS_TYPE.CRANK]: {
        gid: 1146,
        type: ENTITIES_TYPE.ITEM,
        name: 'Crank',
        properties: { id: ITEMS_TYPE.CRANK }
    }
}
