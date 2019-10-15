import PropTypes from 'prop-types'

export const viewportPropType = PropTypes.shape({
    height: PropTypes.number.isRequired,
    scale: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
})
