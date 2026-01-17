import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
    CForm,
    CFormInput,
    CFormLabel,
    CSpinner,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilSave } from '@coreui/icons'
import { setsAPI, questionsAPI } from '../../services/api'
import Table from '../../components/Table'
import { Toast, Modal } from '../../utils/sweetalert'
import { Trash2, Pencil, Calendar, Folder, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

const ManageSets = () => {
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSets, setSelectedSets] = useState([])

    // Form State
    const [inputName, setInputName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => {
        fetchSets()
    }, [])

    const fetchSets = async () => {
        setLoading(true)
        try {
            const [setsRes, questionsRes] = await Promise.all([
                setsAPI.getAll(),
                questionsAPI.getAll()
            ])

            const allSets = setsRes.data || []
            const allQuestions = questionsRes.data || []

            // Calculate question counts per set
            const questionCounts = allQuestions.reduce((acc, q) => {
                // Handle case where set might be null, object, or string ID
                const setId = q.set ? (typeof q.set === 'object' ? q.set._id : q.set) : null
                if (setId) {
                    acc[setId] = (acc[setId] || 0) + 1
                }
                return acc
            }, {})

            // Merge counts and sort
            const sortedSets = allSets.map(set => ({
                ...set,
                totalQuestions: questionCounts[set._id] || 0
            })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

            setSets(sortedSets)
        } catch (err) {
            console.error(err)
            Toast.fire({ icon: 'error', title: 'Failed to fetch data' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!inputName.trim()) return

        setFormLoading(true)

        try {
            if (editingId) {
                await setsAPI.update(editingId, { name: inputName })
                Toast.fire({ icon: 'success', title: 'Set updated successfully!' })
                setEditingId(null)
            } else {
                await setsAPI.create({ name: inputName })
                Toast.fire({ icon: 'success', title: 'Set created successfully!' })
            }
            setInputName('')
            fetchSets()
        } catch (err) {
            Toast.fire({ icon: 'error', title: err.message })
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditClick = (set) => {
        setInputName(set.name)
        setEditingId(set._id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setInputName('')
        setEditingId(null)
    }

    const handleDeleteSet = async (setId) => {
        const result = await Modal.fire({
            title: 'Delete Set?',
            text: "This action cannot be undone. Questions in this set might be affected.",
            icon: 'warning',
            confirmButtonText: 'Yes, delete it'
        })

        if (!result.isConfirmed) return

        try {
            await setsAPI.delete(setId)
            Toast.fire({ icon: 'success', title: 'Set deleted successfully!' })
            if (editingId === setId) handleCancelEdit()
            setSelectedSets(prev => prev.filter(id => id !== setId))
            fetchSets()
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to delete set' })
        }
    }

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSets(sets.map(s => s._id))
        } else {
            setSelectedSets([])
        }
    }

    const handleSelectSet = (id) => {
        if (selectedSets.includes(id)) {
            setSelectedSets(prev => prev.filter(setId => setId !== id))
        } else {
            setSelectedSets(prev => [...prev, id])
        }
    }

    const handleBulkDelete = async () => {
        const result = await Modal.fire({
            title: 'Delete Selected Sets?',
            text: `You are about to delete ${selectedSets.length} sets. Questions in these sets might be affected.`,
            icon: 'warning',
            confirmButtonText: 'Yes, delete them'
        })

        if (!result.isConfirmed) return

        try {
            await setsAPI.bulkDelete(selectedSets)
            Toast.fire({ icon: 'success', title: 'Selected sets deleted successfully!' })
            setSelectedSets([])
            // Reset edit form if editing a set that was just deleted
            if (editingId && selectedSets.includes(editingId)) {
                handleCancelEdit()
            }
            fetchSets()
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to delete selected sets' })
        }
    }

    return (
        <CRow>
            {/* Left Column: Add / Edit Form */}
            <CCol md={4}>
                <CCard className="shadow-sm border-0 rounded-2">
                    <CCardHeader className="bg-transparent border-0 p-4">
                        <h5 className="mb-0 fw-bold">{editingId ? 'Edit Set' : 'Add New Set'}</h5>
                        <div className="small text-body-secondary mt-1">
                            {editingId ? 'Update the set details below' : 'Create a new question set'}
                        </div>
                    </CCardHeader>
                    <CCardBody className="p-4">
                        <CForm onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <CFormLabel htmlFor="setName" className="fw-semibold text-body-secondary">Set Name</CFormLabel>
                                <CFormInput
                                    type="text"
                                    id="setName"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    placeholder="e.g. Science Quiz Level 1"
                                    className="quiz-input-standard"
                                    required
                                />
                            </div>

                            <div className={editingId ? "d-flex gap-2" : "d-grid gap-2"}>
                                <CButton
                                    color="primary"
                                    type="submit"
                                    disabled={formLoading}
                                    className={`py-2 fw-semibold text-white shadow-sm ${editingId ? 'w-50' : ''}`}
                                >
                                    {formLoading ? (
                                        <CSpinner size="sm" />
                                    ) : (
                                        <>
                                            <CIcon icon={editingId ? cilSave : cilPlus} className="me-2" />
                                            {editingId ? 'Update Set' : 'Create Set'}
                                        </>
                                    )}
                                </CButton>

                                {editingId && (
                                    <CButton
                                        color="danger"
                                        variant="ghost"
                                        onClick={handleCancelEdit}
                                        className="py-2 fw-semibold w-50 bg-danger bg-opacity-10 text-danger border-0 hover-opacity-75"
                                    >
                                        Cancel
                                    </CButton>
                                )}
                            </div>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>

            {/* Right Column: Sets List */}
            <CCol md={8}>
                <CCard className="shadow-sm border-0 rounded-2" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0 fw-bold">All Sets</h5>
                            <div className="small text-body-secondary mt-1">Manage your existing question sets</div>
                        </div>
                        <div className="d-flex gap-2">
                            {selectedSets.length > 0 && (
                                <CButton
                                    className="btn-delete-selected-standard"
                                    onClick={handleBulkDelete}
                                >
                                    <Trash2 size={16} />
                                    Delete Selected ({selectedSets.length})
                                </CButton>
                            )}
                            <CButton
                                onClick={fetchSets}
                                disabled={loading}
                                className="btn-refresh-standard"
                            >
                                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                                Refresh
                            </CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody className="p-4" style={{ overflowY: 'auto', flex: 1 }}>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
                                <div className="text-center">
                                    <CSpinner color="primary" className="mb-2" />
                                    <p className="text-body-secondary small mb-0">Loading data...</p>
                                </div>
                            </div>
                        ) : sets.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="bg-body-secondary rounded-circle d-inline-flex p-3 mb-3">
                                    <CIcon icon={cilPlus} size="xl" className="text-body-secondary" />
                                </div>
                                <h6 className="text-body-secondary fw-bold">No sets found</h6>
                                <p className="text-body-secondary small text-muted">Create your first set using the form on the left.</p>
                            </div>
                        ) : (
                            <Table
                                columns={[
                                    {
                                        label: (
                                            <div className="d-flex align-items-center gap-1 ps-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                                                    checked={sets.length > 0 && selectedSets.length === sets.length}
                                                    onChange={handleSelectAll}
                                                />
                                                <span className="ms-1">#</span>
                                            </div>
                                        ),
                                        style: { width: '90px' }
                                    },
                                    { label: 'Set Name', style: { width: '37%' } },
                                    { label: 'Questions', style: { width: '18%' } },
                                    { label: 'Created At', style: { width: '22%' } },
                                    { label: 'Actions', className: 'text-end pe-4', style: { width: '120px' } }
                                ]}
                            >
                                {sets.map((set, index) => (
                                    <CTableRow key={set._id}>
                                        <CTableDataCell style={{ width: '90px' }}>
                                            <div className="d-flex align-items-center ps-3" style={{ gap: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                                                    checked={selectedSets.includes(set._id)}
                                                    onChange={() => handleSelectSet(set._id)}
                                                />
                                                <span className="text-body-secondary small fw-bold ms-1">{index + 1}</span>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell style={{ width: '37%' }}>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-2 me-3 flex-shrink-0">
                                                    <Folder size={16} />
                                                </div>
                                                <div className="fw-bold text-body-emphasis text-truncate">{set.name}</div>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell style={{ width: '18%' }}>
                                            <div className="text-body-secondary fw-medium small">
                                                {set.totalQuestions || 0} Questions
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell style={{ width: '22%' }}>
                                            <div className="d-flex align-items-center text-body-secondary small">
                                                <Calendar size={14} className="me-2 opacity-75 flex-shrink-0" />
                                                <div>
                                                    <div className="fw-medium text-body-emphasis">{new Date(set.createdAt).toLocaleDateString()}</div>
                                                    <div className="opacity-75">{new Date(set.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end pe-4" style={{ width: '120px' }}>
                                            <div className="d-flex justify-content-end gap-1">
                                                <CTooltip content="Edit Set">
                                                    <CButton
                                                        className="action-icon-btn"
                                                        style={{ color: '#ffc107' }}
                                                        size="sm"
                                                        onClick={() => handleEditClick(set)}
                                                    >
                                                        <Pencil size={18} />
                                                    </CButton>
                                                </CTooltip>
                                                <CTooltip content="Delete Set">
                                                    <CButton
                                                        onClick={() => handleDeleteSet(set._id)}
                                                        className="action-icon-btn text-danger"
                                                        size="sm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </CButton>
                                                </CTooltip>
                                            </div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </Table>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default ManageSets
