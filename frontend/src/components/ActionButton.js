import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'

/**
 * Reusable Action Button with standard quiz-app styling
 * Colors: Primary (#5856d6), Secondary (light/outline)
 */
const ActionButton = ({
    children,
    onClick,
    loading = false,
    disabled = false,
    showSpinner = true,
    variant = 'primary', // 'primary' | 'secondary' | 'outline'
    icon: Icon,
    className = '',
    style = {},
    fullWidth = true,
    padding = 'py-2',
    ...props
}) => {
    const isPrimary = variant === 'primary'

    const defaultStyles = isPrimary ? {
        backgroundColor: '#5856d6',
        borderColor: '#5856d6',
        color: 'white'
    } : {}

    const buttonVariant = isPrimary ? undefined : (variant === 'secondary' ? 'light' : 'outline')

    return (
        <CButton
            onClick={onClick}
            disabled={loading || disabled}
            color={buttonVariant}
            className={`fw-bold d-flex align-items-center justify-content-center shadow-none transition-all ${fullWidth ? 'w-100' : ''} ${padding} ${className}`}
            style={{
                ...defaultStyles,
                borderRadius: '8px',
                ...style
            }}
            {...props}
        >
            {loading && showSpinner ? (
                <CSpinner size="sm" />
            ) : (
                <>
                    {Icon && <Icon size={18} className="me-2" />}
                    {children}
                </>
            )}
        </CButton>
    )
}

ActionButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
    icon: PropTypes.elementType,
    className: PropTypes.string,
    style: PropTypes.object,
    fullWidth: PropTypes.bool,
    padding: PropTypes.string
}

export default ActionButton
