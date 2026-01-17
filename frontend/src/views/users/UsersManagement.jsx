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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CFormCheck,
  CFormSelect,
  CBadge,
} from '@coreui/react'
import apiService from '../../services/api'
import Table from '../../components/Table'
import { Trash2, User, Mail, Calendar, UserPlus, RefreshCw } from 'lucide-react'

const UsersManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiService.getUsers()
      setUsers(data)
    } catch (err) {
      setError('Failed to fetch users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await apiService.createUser(newUser)
      setSuccess('User added successfully!')
      setNewUser({ name: '', email: '' })
      setShowAddModal(false)
      fetchUsers()
    } catch (err) {
      setError('Failed to add user: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await apiService.deleteUser(userId)
      setSuccess('User deleted successfully!')
      fetchUsers()
    } catch (err) {
      setError('Failed to delete user: ' + err.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select users to delete')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await Promise.all(selectedUsers.map((userId) => apiService.deleteUser(userId)))
      setSuccess(`${selectedUsers.length} user(s) deleted successfully!`)
      setSelectedUsers([])
      setSelectAll(false)
      fetchUsers()
    } catch (err) {
      setError('Failed to delete users: ' + err.message)
    }
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    setSelectAll(checked)
    if (checked) {
      const currentPageUsers = paginatedUsers.map((user) => user._id)
      setSelectedUsers(currentPageUsers)
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  // Pagination logic
  const totalPages = Math.ceil(users.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUsers = users.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setSelectAll(false)
    setSelectedUsers([])
  }

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
    setSelectAll(false)
    setSelectedUsers([])
  }

  // Update selectAll state when selections change
  useEffect(() => {
    if (paginatedUsers.length > 0) {
      const allSelected = paginatedUsers.every((user) => selectedUsers.includes(user._id))
      setSelectAll(allSelected)
    }
  }, [selectedUsers, paginatedUsers])

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Users Management</strong>
              <div className="float-end">
                <CButton color="primary" size="sm" className="me-2 d-inline-flex align-items-center" onClick={() => setShowAddModal(true)}>
                  <UserPlus size={15} className="me-1" />
                  Add User
                </CButton>
                <CButton color="secondary" size="sm" className="d-inline-flex align-items-center" onClick={fetchUsers}>
                  <RefreshCw size={15} className="me-1" />
                  Refresh
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody className="px-5 pb-5">
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError('')}>
                  {error}
                </CAlert>
              )}
              {success && (
                <CAlert color="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </CAlert>
              )}

              {/* Bulk actions */}
              {selectedUsers.length > 0 && (
                <CAlert color="info" className="d-flex justify-content-between align-items-center">
                  <span>{selectedUsers.length} user(s) selected</span>
                  <CButton color="danger" size="sm" onClick={handleBulkDelete}>
                    <CIcon icon={cilTrash} className="me-1" />
                    Delete Selected
                  </CButton>
                </CAlert>
              )}

              {/* Page size selector */}
              <div className="mb-3">
                <CFormLabel htmlFor="pageSize">Show</CFormLabel>
                <CFormSelect
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  style={{ width: '100px', display: 'inline-block', marginLeft: '10px' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </CFormSelect>
                <span className="ms-2">entries</span>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <>
                  <Table
                    columns={[
                      {
                        label: (
                          <div className="form-check mb-0">
                            <input
                              type="checkbox"
                              id="selectAll"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                            />
                          </div>
                        ),
                        style: { width: '40px' }
                      },
                      { label: '#', style: { width: '60px' } },
                      { label: 'USER' },
                      { label: 'PERFORMANCE', style: { width: '150px' } },
                      { label: 'JOINED DETAILS', style: { width: '180px' } },
                      { label: 'ATTEMPTS', style: { width: '120px' } },
                      { label: 'STATUS', style: { width: '120px' } },
                      { label: 'ACTIONS', className: 'text-end', style: { width: '100px' } }
                    ]}
                  >
                    {paginatedUsers.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={8} className="text-center py-5 text-body-secondary">
                          No users found
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      paginatedUsers.map((user, index) => (
                        <CTableRow key={user._id}>
                          <CTableDataCell>
                            <div className="form-check mb-0">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleSelectUser(user._id)}
                                className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                              />
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <span className="text-body-secondary small fw-bold">{startIndex + index + 1}</span>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <User size={18} />
                              </div>
                              <div className="d-flex flex-column">
                                <div className="fw-bold text-body-emphasis">{user.name}</div>
                                <div className="small text-body-secondary d-flex align-items-center gap-1">
                                  <Mail size={12} className="opacity-75" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-1 px-2 py-1">
                              Score: {user.score || 0}/10
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-2">
                              <Calendar size={14} className="text-body-secondary opacity-50" />
                              <div className="d-flex flex-column">
                                <div className="small fw-semibold text-body-emphasis">
                                  {user.joinedOn ? new Date(user.joinedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </div>
                                <div className="x-small text-body-secondary opacity-75">
                                  {user.joinedOn ? new Date(user.joinedOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="small text-body-secondary fw-medium">
                              {user.attempts || 0}/3 attempts
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-1 px-3 py-1">
                              Ready
                            </span>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            <div className="d-flex justify-content-end">
                              <CButton
                                color="danger"
                                onClick={() => handleDeleteUser(user._id)}
                                className="action-icon-btn text-danger"
                                size="sm"
                              >
                                <Trash2 size={17} />
                              </CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </Table>

                  {/* Pagination */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of{' '}
                      {users.length} participants
                    </div>
                    <CPagination>
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      {[...Array(totalPages)].map((_, index) => (
                        <CPaginationItem
                          key={index + 1}
                          active={currentPage === index + 1}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add User Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader onClose={() => setShowAddModal(false)}>
          <CModalTitle>Add New User</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleAddUser}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel htmlFor="userName">Name</CFormLabel>
              <CFormInput
                type="text"
                id="userName"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="userEmail">Email</CFormLabel>
              <CFormInput
                type="email"
                id="userEmail"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={formLoading}>
              {formLoading ? <CSpinner size="sm" /> : 'Add User'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default UsersManagement
