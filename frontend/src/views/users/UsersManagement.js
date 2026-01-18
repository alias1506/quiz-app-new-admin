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
  CSpinner,
  CFormInput,
  CFormSelect,
  CBadge,
  CTooltip,
  CCardFooter,
} from '@coreui/react'
import { usersAPI, questionsAPI, setsAPI } from '../../services/api'
import { Toast, Modal } from '../../utils/sweetalert'
import { formatText } from '../../utils/formatText'
import Table from '../../components/Table'
import { Trash2, RefreshCw, User, Mail, Calendar, Activity, ChevronDown, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Clock, Search, X, Filter, BookOpen } from 'lucide-react'
import { io } from 'socket.io-client'

const UsersManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [entriesPerPage] = useState(10) // Changed to 10 for pagination demo visibility
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    fetchUsers()

    // Initialize WebSocket connection
    const socketURL = import.meta.env.VITE_ADMIN_SOCKET_URL || 'http://localhost:8000'
    const newSocket = io(socketURL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket"], // Skip polling to avoid 'xhr poll error' on Render
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server')
    })

    // Listen for real-time user updates
    newSocket.on('user:update', (data) => {
      console.log('📢 Real-time update received:', data)
      // Silently refresh users data without showing loading spinner
      fetchUsers(true)
    })

    newSocket.on('user:joined', (data) => {
      console.log('👤 New user joined:', data)
      fetchUsers(true)
    })

    newSocket.on('user:attemptStarted', (data) => {
      console.log('▶️ User started attempt:', data)
      fetchUsers(true)
    })

    newSocket.on('user:scoreUpdated', (data) => {
      console.log('📊 User score updated:', data)
      fetchUsers(true)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [])

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [usersRes] = await Promise.all([
        usersAPI.getAll()
      ])

      const usersData = usersRes.data || []
      setUsers(usersData)
    } catch (err) {
      console.error('Error fetching users:', err)
      if (!silent) {
        Toast.fire({
          icon: 'error',
          title: 'Failed to fetch users',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    const result = await Modal.fire({
      title: 'Delete User?',
      text: "This action cannot be undone.",
      icon: 'warning',
      confirmButtonText: 'Yes, Delete',
    })

    if (!result.isConfirmed) return

    try {
      await usersAPI.delete(userId)
      setUsers(users.filter(u => u._id !== userId))
      Toast.fire({
        icon: 'success',
        title: 'User deleted successfully',
      })
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete user',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Select users first',
      })
      return
    }

    const result = await Modal.fire({
      title: 'Delete Selected?',
      text: `Remove ${selectedUsers.length} user(s)?`,
      icon: 'warning',
      confirmButtonText: 'Delete All',
      confirmButtonClass: 'btn btn-danger px-4 mx-2',
    })

    if (!result.isConfirmed) return

    try {
      await usersAPI.bulkDelete(selectedUsers)
      setUsers(users.filter(u => !selectedUsers.includes(u._id)))
      setSelectedUsers([])
      Toast.fire({
        icon: 'success',
        title: 'Users deleted',
      })
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete',
      })
    }
  }

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const toggleSelectAll = () => {
    const currentUsers = users.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
    const allSelected = currentUsers.every(u => selectedUsers.includes(u._id))

    if (allSelected) {
      const currentIds = currentUsers.map(u => u._id)
      setSelectedUsers(selectedUsers.filter(id => !currentIds.includes(id)))
    } else {
      const newSelections = currentUsers
        .map(u => u._id)
        .filter(id => !selectedUsers.includes(id))
      setSelectedUsers([...selectedUsers, ...newSelections])
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }



  return (
    <CRow className="gx-0">
      <CCol xs={12}>
        <CCard className="shadow-sm border-0 rounded-2" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                <User size={20} />
              </div>
              <h5 className="mb-0 fw-bold">Users Management</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
              {selectedUsers.length > 0 && (
                <CButton
                  onClick={handleBulkDelete}
                  className="btn-delete-selected-standard"
                >
                  <Trash2 size={16} />
                  Delete Selected ({selectedUsers.length})
                </CButton>
              )}

              {/* Search */}
              <div className="position-relative search-container-standard" style={{ width: '240px' }}>
                <Search className="position-absolute top-50 translate-middle-y search-icon text-body-secondary" size={14} />
                <CFormInput
                  placeholder="Search users..."
                  className="quiz-input-standard"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <CButton
                    variant="ghost"
                    className="position-absolute top-50 translate-middle-y clear-btn border-0 shadow-none p-1"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={14} />
                  </CButton>
                )}
              </div>

              <CButton
                onClick={() => fetchUsers()}
                disabled={loading}
                className="btn-refresh-standard"
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                Refresh
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody className="p-4 flex-grow-1 overflow-auto">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <CSpinner color="primary" className="mb-2" />
                  <p className="text-body-secondary small mb-0">Loading data...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-body-secondary rounded-circle d-inline-flex p-4 mb-3">
                  <User size={40} className="text-body-secondary opacity-50" />
                </div>
                <h5 className="text-body-secondary fw-bold">No Users Found</h5>
                <p className="text-body-secondary small">Try adjusting your search or filters</p>
              </div>
            ) : (
              <Table
                columns={[
                  {
                    label: (
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="checkbox"
                          checked={filteredUsers.length > 0 && filteredUsers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).every(u => selectedUsers.includes(u._id))}
                          onChange={toggleSelectAll}
                          className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                        />
                        <span className="ms-1">#</span>
                      </div>
                    ),
                    style: { width: '80px' }
                  },
                  { label: 'User', style: { width: '25%' } },
                  { label: 'Quiz Info', style: { width: '15%' } },
                  { label: 'Performance', style: { width: '15%' } },
                  { label: 'Joined Details', style: { width: '16%' } },
                  { label: 'Attempts', style: { width: '14%' } },
                  { label: 'Status', style: { width: '12%' } },
                  { label: 'Actions', className: 'text-end pe-4', style: { width: '80px' } }
                ]}
              >
                {filteredUsers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((user, index) => (
                  <CTableRow key={user._id}>
                    <CTableDataCell style={{ width: '80px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                          className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                        />
                        <span className="text-body-emphasis fw-bold">{(currentPage - 1) * entriesPerPage + index + 1}</span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell style={{ width: '25%' }}>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-2 me-3">
                          <User size={16} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div className="fw-bold mb-0 text-body-emphasis text-truncate" dangerouslySetInnerHTML={{ __html: formatText(user.name || "N/A") }}></div>
                          <div className="small text-body-secondary d-flex align-items-center text-truncate">
                            <Mail size={12} className="me-1 flex-shrink-0" />
                            <span className="text-truncate">{user.email || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell style={{ width: '15%' }}>
                      <div className="d-flex flex-column">
                        <div className="fw-bold text-body-emphasis small text-truncate" title={user.quizName} dangerouslySetInnerHTML={{ __html: formatText(user.quizName || 'N/A') }}>
                        </div>
                        <div className="x-small text-primary fw-medium" dangerouslySetInnerHTML={{ __html: formatText(user.quizPart || 'N/A') }}>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell style={{ width: '15%' }}>
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2">
                          <div className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-1 px-2 py-1 fw-bold">
                            {user.score || 0} / {user.total || 0}
                          </div>
                        </div>
                        {user.attemptNumber && (
                          <small className="text-body-secondary d-flex align-items-center x-small">
                            <RotateCcw size={10} className="me-1 opacity-75" />
                            Attempt #{user.attemptNumber}
                          </small>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell style={{ width: '16%' }}>
                      <div className="d-flex align-items-center text-body-secondary small">
                        <Calendar size={14} className="me-2 opacity-75 flex-shrink-0" />
                        <div>
                          <div className="fw-medium text-body-emphasis">{formatDate(user.joinedOn)}</div>
                          <div className="opacity-75">{new Date(user.joinedOn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell style={{ width: '14%' }}>
                      <div className="d-flex flex-column align-items-start gap-1">
                        <div className="progress" style={{ height: '4px', width: '80px', background: 'var(--cui-body-secondary-bg)', borderRadius: '0px' }}>
                          <div
                            className={`progress-bar ${user.dailyAttempts >= 3 ? 'bg-danger' : 'bg-primary'}`}
                            role="progressbar"
                            style={{ width: `${Math.min((user.dailyAttempts / 3) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="small fw-bold text-body-secondary" style={{ fontSize: '11px' }}>{user.dailyAttempts || 0}/3 attempts</span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell style={{ width: '12%' }}>
                      <span className={`badge rounded-1 px-3 py-2 border ${user.status === 'Ready' || user.status === 'Available' || user.status === 'Active'
                        ? 'bg-success-subtle text-success border-success-subtle'
                        : 'bg-danger-subtle text-danger border-danger-subtle'
                        }`}>
                        {user.status || 'Active'}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell className="text-end pe-4" style={{ width: '80px' }}>
                      <div className="d-flex justify-content-end">
                        <CTooltip content="Delete User">
                          <CButton
                            onClick={() => handleDelete(user._id)}
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

          {!loading && filteredUsers.length > 0 && (
            <CCardFooter className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
              <small className="text-body-secondary x-small">
                Showing <span className="fw-bold text-body-emphasis">{(currentPage - 1) * entriesPerPage + (filteredUsers.length > 0 ? 1 : 0)}</span> to <span className="fw-bold text-body-emphasis">{Math.min(currentPage * entriesPerPage, filteredUsers.length)}</span> of <span className="fw-bold text-body-emphasis">{filteredUsers.length}</span> entries
              </small>

              {filteredUsers.length > entriesPerPage && (
                <nav className="d-flex align-items-center gap-1">
                  <CButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none"
                  >
                    <ChevronsLeft size={14} />
                  </CButton>
                  <CButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none me-1"
                  >
                    <ChevronLeft size={14} />
                  </CButton>

                  <div className="d-flex align-items-center gap-1">
                    {(() => {
                      const totalPages = Math.ceil(filteredUsers.length / entriesPerPage)
                      const pages = []
                      const maxVisible = 1

                      pages.push(
                        <CButton
                          key={1}
                          variant="ghost"
                          onClick={() => setCurrentPage(1)}
                          className={`px-2 py-1 rounded-2 border-0 fw-bold shadow-none ${currentPage === 1 ? 'bg-primary bg-opacity-10 text-primary' : 'text-body-secondary'}`}
                          style={{ fontSize: '12px', minWidth: '28px' }}
                        >
                          1
                        </CButton>
                      )

                      if (currentPage > 3) {
                        pages.push(<span key="dots-1" className="text-body-secondary opacity-50 mx-1 small">...</span>)
                      }

                      for (let i = Math.max(2, currentPage - maxVisible); i <= Math.min(totalPages - 1, currentPage + maxVisible); i++) {
                        pages.push(
                          <CButton
                            key={i}
                            variant="ghost"
                            onClick={() => setCurrentPage(i)}
                            className={`px-2 py-1 rounded-2 border-0 fw-bold shadow-none ${currentPage === i ? 'bg-primary bg-opacity-10 text-primary' : 'text-body-secondary'}`}
                            style={{ fontSize: '12px', minWidth: '28px' }}
                          >
                            {i}
                          </CButton>
                        )
                      }

                      if (currentPage < totalPages - 2) {
                        pages.push(<span key="dots-2" className="text-body-secondary opacity-50 mx-1 small">...</span>)
                      }

                      if (totalPages > 1) {
                        pages.push(
                          <CButton
                            key={totalPages}
                            variant="ghost"
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-2 py-1 rounded-2 border-0 fw-bold shadow-none ${currentPage === totalPages ? 'bg-primary bg-opacity-10 text-primary' : 'text-body-secondary'}`}
                            style={{ fontSize: '12px', minWidth: '28px' }}
                          >
                            {totalPages}
                          </CButton>
                        )
                      }

                      return pages
                    })()}
                  </div>

                  <CButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === Math.ceil(filteredUsers.length / entriesPerPage)}
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / entriesPerPage), p + 1))}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none ms-1"
                  >
                    <ChevronRight size={14} />
                  </CButton>
                  <CButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === Math.ceil(filteredUsers.length / entriesPerPage)}
                    onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / entriesPerPage))}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none"
                  >
                    <ChevronsRight size={14} />
                  </CButton>
                </nav>
              )}
            </CCardFooter>
          )}
        </CCard>
      </CCol>

      <style>{`
                .x-small { font-size: 0.75rem; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </CRow>
  )
}

export default UsersManagement
