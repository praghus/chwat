import React from 'react'
import PropTypes from 'prop-types'
import { SCENES } from '../../lib/constants'

const propTypes = {
    setScene: PropTypes.func.isRequired
}

export default function IntroScene (props) {
    const { setScene } = props
    return (
        <div className='splash'>
            <div className='logo' onClick={() => setScene(SCENES.GAME)} />
        </div>
    )
}

IntroScene.propTypes = propTypes
