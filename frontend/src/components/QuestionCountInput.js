import React from 'react'
import { CFormLabel, CFormInput } from '@coreui/react'
import { Hash } from 'lucide-react'

const QuestionCountInput = ({
    value,
    onChange,
    label = "No. Questions",
    showIcon = true,
    showLabel = true,
    min = 1,
    max = 10,
    className = ""
}) => {
    const handleChange = (e) => {
        const val = e.target.value
        if (val === '') {
            onChange('')
        } else {
            const num = parseInt(val)
            if (!isNaN(num) && num >= min && num <= max) {
                onChange(num)
            }
        }
    }

    return (
        <div className={className}>
            {showLabel && (
                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                    {showIcon && <Hash size={14} />}
                    {label}
                </CFormLabel>
            )}
            <CFormInput
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={handleChange}
                className="border bg-body-tertiary focus-ring p-2"
                style={{ height: '42px' }}
            />
        </div>
    )
}

export default QuestionCountInput
