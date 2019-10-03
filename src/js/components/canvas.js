import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import fx from 'glfx'
import { findDOMNode } from 'react-dom'
import { configPropType } from '../lib/prop-types'
import { CONFIG } from '../lib/constants'

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

    componentDidUpdate () {
        const { config, width, height } = this.props
        const CRTeffect = config[CONFIG.CRT_EFFECT]
        if (this.glcanvas) {
            if (!CRTeffect) {
                this.disableOpenGlEffects()
            }
            else {
            /** Experimental: create CRT scanlines effect */
                this.texture.loadContentsOf(this.source)
                this.glcanvas
                    .draw(this.texture)
                    .bulgePinch(
                        Math.round(width / 2),
                        Math.round(height / 2),
                        width * 0.75,
                        0.12
                    )
                    .vignette(0.25, 0.74)
                    .update()
            }
        }
        else if (CRTeffect) {
            this.setOpenGlEffects()
        }
    }

    render () {
        const { width, height } = this.props
        const style = { width: `${width}px`, height: `${height}px` }
        return (
            <Fragment>
                <canvas ref={(ref) => { this.buffer = ref }} {...style} className='hidden' />
                <canvas ref={(ref) => { this.canvas = ref }} {...style} />
            </Fragment>
        )
    }

    /** Experimental */
    setOpenGlEffects () {
        try {
            this.glcanvas = fx.canvas()
            this.source = findDOMNode(this.canvas)
            this.texture = this.glcanvas.texture(this.source)
            this.source.parentNode.insertBefore(this.glcanvas, this.source)
            this.source.style.display = 'none'
            this.glcanvas.className = this.source.className
        }
        catch (e) {
            return
        }
    }

    disableOpenGlEffects () {
        this.source.style.display = 'block'
        this.glcanvas.remove()
        delete (this.glcanvas)
    }
    /**/
}

Canvas.propTypes = propTypes
