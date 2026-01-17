import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTableRow,
  CTableDataCell,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import {
  Trash2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Folder,
  Calendar
} from 'lucide-react'
import apiService from '../../services/api'
import { Toast, Modal } from '../../utils/sweetalert'
import Table from '../../components/Table'

const SetsManagement = () => {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form State
  const [inputName, setInputName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchSets()
  }, [])

  const fetchSets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiService.getSets()
      setSets(data)
    } catch (err) {
      setError('Failed to fetch sets: ' + err.message)
      Toast.fire({ icon: 'error', title: 'Failed to fetch sets' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputName.trim()) return

    setFormLoading(true)
    setError('')

    try {
      if (editingId) {
        // Update existing set
        await apiService.updateSet(editingId, { name: inputName })
        Toast.fire({ icon: 'success', title: 'Set updated successfully!' })
        setEditingId(null)
      } else {
        // Create new set
        await apiService.createSet({ name: inputName })
        Toast.fire({ icon: 'success', title: 'Set created successfully!' })
      }
      setInputName('')
      fetchSets()
    } catch (err) {
      setError(err.message)
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
      await apiService.deleteSet(setId)
      Toast.fire({ icon: 'success', title: 'Set deleted successfully!' })
      if (editingId === setId) handleCancelEdit()
      fetchSets()
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Failed to delete set' })
    }
  }

  return (
    <CRow>
      {/* Left Column: Add / Edit Form */}
      <CCol md={4} className="mb-4">
        <CCard className="shadow-sm border-0 rounded-2 h-100">
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
                  className="py-2 bg-body-tertiary border-0 focus-ring shadow-sm"
                  required
                />
              </div>

              <div className="d-grid gap-2">
                <CButton
                  color="primary"
                  type="submit"
                  disabled={formLoading}
                  className="py-2 fw-semibold text-white shadow-sm"
                >
                  {formLoading ? (
                    <CSpinner size="sm" />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      {editingId ? <Save size={18} /> : <Plus size={18} />}
                      <span>{editingId ? 'Update Set' : 'Create Set'}</span>
                    </div>
                  )}
                </CButton>

                {editingId && (
                  <CButton
                    color="light"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-body-secondary fw-medium"
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
      <CCol md={8} className="mb-4">
        <CCard className="shadow-sm border-0 rounded-2 h-100">
          <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold">All Sets</h5>
              <div className="small text-body-secondary mt-1">Manage your existing question sets</div>
            </div>
            <CButton
              color="light"
              size="sm"
              className="d-flex align-items-center gap-2 rounded-2 border-primary-subtle text-body-secondary bg-body-tertiary border-0 shadow-sm"
              onClick={fetchSets}
            >
              <RefreshCw size={14} className={loading && sets.length > 0 ? 'spin' : ''} />
              Refresh
            </CButton>
          </CCardHeader>
          <CCardBody className="p-4">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
                <CSpinner color="primary" />
              </div>
            ) : sets.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-body-secondary rounded-circle d-inline-flex p-3 mb-3">
                  <Plus size={24} className="text-body-secondary" />
                </div>
                <h6 className="text-body-secondary fw-bold">No sets found</h6>
                <p className="text-body-secondary small text-muted">Create your first set using the form on the left.</p>
              </div>
            ) : (
              <Table
                columns={[
                  { label: <CFormCheck id="selectAll" />, style: { width: '40px' } },
                  { label: '#' },
                  { label: 'Set Name', className: 'w-50' },
                  { label: 'Questions' },
                  { label: 'Created At', className: 'text-center' },
                  { label: 'Actions', className: 'text-end pe-3' }
                ]}
              >
                {sets.map((set, index) => (
                  <CTableRow key={set._id}>
                    <CTableDataCell className="ps-3">
                      <CFormCheck id={`check-${set._id}`} />
                    </CTableDataCell>
                    <CTableDataCell className="py-3 text-body-secondary fw-semibold">
                      {index + 1}
                    </CTableDataCell>
                    <CTableDataCell className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary d-none d-md-flex">
                          <Folder size={18} />
                        </div>
                        <div className="fw-bold text-body-emphasis">{set.name}</div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="py-3">
                      <div className="fw-medium text-body-secondary">
                        {set.questionCount || 0} Questions
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="py-3 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <Calendar size={14} className="text-body-secondary opacity-75" />
                        <div className="text-start">
                          <div className="small fw-bold text-body-emphasis">
                            {set.createdAt ? new Date(set.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                          </div>
                          <div className="x-small text-body-secondary opacity-50">
                            {set.createdAt ? new Date(set.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end pe-3">
                      <div className="d-flex justify-content-end gap-1">
                        <CTooltip content="Edit Set">
                          <CButton
                            className="action-icon-btn"
                            style={{ color: '#ffc107' }}
                            onClick={() => handleEditClick(set)}
                          >
                            <Pencil size={18} />
                          </CButton>
                        </CTooltip>
                        <CTooltip content="Delete Set">
                          <CButton
                            className="action-icon-btn text-danger"
                            onClick={() => handleDeleteSet(set._id)}
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
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </CRow >
  )
}

export default SetsManagement
