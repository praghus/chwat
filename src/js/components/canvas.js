import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { configPropType } from '../lib/prop-types'

const propTypes = {
    config: configPropType.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
}

export default class Canvas extends Component {
    constructor (props) {
        super(props)
        this.buffer = null
        this.canvas = null
        this.ctx = null
        this.ctxBuffer = null
    }

    componentDidMount () {
        this.ctx = findDOMNode(this.canvas).getContext('2d')
        this.ctxBuffer = findDOMNode(this.buffer).getContext('2d')
    }

    render () {
        const { width, height } = this.props
        const style = { width: `${width}px`, height: `${height}px` }
        const containerStyle = {
            ...style,
            marginLeft: -Math.round(width / 2),
            marginTop: -Math.round(height / 2)
        }
        return (
            <div className='canvas' style={containerStyle}>
                <canvas ref={(ref) => { this.buffer = ref }} {...style} className='hidden' />
                <canvas ref={(ref) => { this.canvas = ref }} {...style} />
            </div>
        )
    }
}

Canvas.propTypes = propTypes
