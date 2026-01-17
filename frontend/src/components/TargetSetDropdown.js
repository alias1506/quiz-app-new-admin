import React from 'react'
import {
    CFormLabel,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
} from '@coreui/react'
import { Folder, ChevronDown, Plus } from 'lucide-react'

const TargetSetDropdown = ({
    selectedSet,
    sets,
    onSetSelect,
    onCreateNew,
    label = "Target Set",
    showIcon = true,
    showLabel = true,
    className = ""
}) => {
    return (
        <div className={className}>
            {showLabel && (
                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                    {showIcon && <Folder size={14} />}
                    {label}
                </CFormLabel>
            )}
            <div className="d-flex align-items-center bg-body-tertiary rounded-2 border" style={{ height: '42px' }}>
                <CDropdown className="flex-grow-1 h-100">
                    <CDropdownToggle
                        variant="ghost"
                        className="w-100 h-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer text-start"
                        caret={false}
                    >
                        <span className={`fw-bold ${!selectedSet ? 'text-body-secondary' : 'text-body-emphasis'}`}>
                            {selectedSet ? sets.find(s => s._id === selectedSet)?.name : 'Select Set...'}
                        </span>
                        <ChevronDown size={16} className="text-body-secondary dropdown-chevron" />
                    </CDropdownToggle>
                    <CDropdownMenu
                        className="dropdown-menu-custom dropdown-menu-strict-anim w-100 shadow-lg p-1"
                        placement="bottom-start"
                        style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            zIndex: 9999
                        }}
                    >
                        <CDropdownItem
                            onClick={onCreateNew}
                            className="px-3 py-2 rounded-1 cursor-pointer fw-bold text-primary d-flex align-items-center"
                        >
                            <Plus size={16} className="me-2" /> Create New Set
                        </CDropdownItem>
                        <div className="border-bottom my-1"></div>
                        <CDropdownItem
                            disabled
                            className="small text-body-secondary fw-bold text-uppercase px-3 py-2"
                            style={{ fontSize: '0.75rem' }}
                        >
                            Select a Set...
                        </CDropdownItem>
                        {sets.map(set => (
                            <CDropdownItem
                                key={set._id}
                                onClick={() => onSetSelect(set._id)}
                                className="px-3 py-2 rounded-1 cursor-pointer fw-medium mb-1"
                                style={selectedSet === set._id ? { backgroundColor: '#5856d6', color: 'white' } : {}}
                            >
                                {set.name}
                            </CDropdownItem>
                        ))}
                    </CDropdownMenu>
                </CDropdown>
            </div>
        </div>
    )
}

export default TargetSetDropdown
