import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardFooter,
  CCol,
  CRow,
  CTableRow,
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
  CFormSelect,
  CFormTextarea,
  CPagination,
  CPaginationItem,
  CFormCheck,
} from '@coreui/react'
import apiService from '../../services/api'
import { formatText } from '../../utils/formatText'
import Table from '../../components/Table'
import { Trash2, Pencil, Plus, RefreshCw, Folder, CheckCircle, Gamepad2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const QuestionsManagement = () => {
  const [questions, setQuestions] = useState([])
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSetsModal, setShowSetsModal] = useState(false)
  const [showEditSetModal, setShowEditSetModal] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter
  const [filterSet, setFilterSet] = useState('all')

  // Form states
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    set: '',
  })

  const [editQuestion, setEditQuestion] = useState(null)
  const [newSet, setNewSet] = useState({ name: '' })
  const [editSet, setEditSet] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchQuestions()
    fetchSets()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterSet])

  const fetchQuestions = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiService.getQuestions()
      setQuestions(data)
    } catch (err) {
      setError('Failed to fetch questions: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSets = async () => {
    try {
      const data = await apiService.getSets()
      setSets(data)
    } catch (err) {
      console.error('Failed to fetch sets:', err)
    }
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiService.createQuestion(newQuestion)
      setSuccess('Question added successfully!')
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        set: '',
      })
      setShowAddModal(false)
      fetchQuestions()
    } catch (err) {
      setError('Failed to add question: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditQuestion = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiService.updateQuestion(editQuestion._id, {
        question: editQuestion.question,
        options: editQuestion.options,
        correctAnswer: editQuestion.correctAnswer,
        set: editQuestion.set?._id || editQuestion.set,
      })
      setSuccess('Question updated successfully!')
      setShowEditModal(false)
      setEditQuestion(null)
      fetchQuestions()
    } catch (err) {
      setError('Failed to update question: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await apiService.deleteQuestion(questionId)
      setSuccess('Question deleted successfully!')
      fetchQuestions()
    } catch (err) {
      setError('Failed to delete question: ' + err.message)
    }
  }

  const handleAddSet = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiService.createSet(newSet)
      setSuccess('Set added successfully!')
      setNewSet({ name: '' })
      fetchSets()
    } catch (err) {
      setError('Failed to add set: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSet = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiService.updateSet(editSet._id, { name: editSet.name })
      setSuccess('Set updated successfully!')
      setShowEditSetModal(false)
      setEditSet(null)
      fetchSets()
      fetchQuestions()
    } catch (err) {
      setError('Failed to update set: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleActivateSet = async (setId) => {
    setError('')
    setSuccess('')
    try {
      await apiService.activateSet(setId)
      setSuccess('Set activated successfully!')
      fetchSets()
    } catch (err) {
      setError('Failed to activate set: ' + err.message)
    }
  }

  const handleDeleteSet = async (setId) => {
    if (!window.confirm('Are you sure you want to delete this set? This will also affect related questions.')) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await apiService.deleteSet(setId)
      setSuccess('Set deleted successfully!')
      fetchSets()
      fetchQuestions()
    } catch (err) {
      setError('Failed to delete set: ' + err.message)
    }
  }

  const openEditModal = (question) => {
    setEditQuestion({
      ...question,
      set: question.set?._id || question.set,
    })
    setShowEditModal(true)
  }

  const openEditSetModal = (set) => {
    setEditSet({ ...set })
    setShowEditSetModal(true)
  }

  // Filter questions based on selected set
  const filteredQuestions = filterSet === 'all'
    ? questions
    : questions.filter(q => q.set?._id === filterSet)

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
  }

  const updateQuestionOption = (index, value) => {
    const newOptions = [...newQuestion.options]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  const updateEditQuestionOption = (index, value) => {
    const newOptions = [...editQuestion.options]
    newOptions[index] = value
    setEditQuestion({ ...editQuestion, options: newOptions })
  }

  return (
    <>
      <CRow className="gx-0">
        <CCol xs={12}>
          <CCard className="shadow-sm border-0 rounded-2" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                  <Gamepad2 size={20} />
                </div>
                <h5 className="mb-0 fw-bold">Questions Management</h5>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CButton color="info" size="sm" className="d-flex align-items-center gap-2 px-3 fw-semibold rounded-3 border-0 shadow-sm" style={{ color: 'white' }} onClick={() => setShowSetsModal(true)}>
                  <Plus size={16} />
                  Manage Sets
                </CButton>
                <CButton color="primary" size="sm" className="d-flex align-items-center gap-2 px-3 fw-semibold rounded-3 border-0 shadow-sm" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} />
                  Add Question
                </CButton>
                <CButton color="secondary" size="sm" className="d-flex align-items-center gap-2 px-3 fw-semibold rounded-3 border-0 btn-light shadow-sm" onClick={fetchQuestions}>
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                  Refresh
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody className="p-4 flex-grow-1 overflow-auto">
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

              {/* Filter and page size */}
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <CFormLabel htmlFor="filterSet" className="small fw-semibold text-body-secondary">Filter by Set:</CFormLabel>
                  <CFormSelect
                    id="filterSet"
                    size="sm"
                    value={filterSet}
                    onChange={(e) => setFilterSet(e.target.value)}
                    style={{ width: '180px', display: 'inline-block', marginLeft: '10px' }}
                    className="border-0 bg-body-tertiary focus-ring rounded-2 fw-medium"
                  >
                    <option value="all">All Sets</option>
                    {sets.map((set) => (
                      <option key={set._id} value={set._id}>
                        {set.name} {set.isActive ? '(Active)' : ''}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CFormLabel htmlFor="pageSize" className="small fw-semibold text-body-secondary mb-0">Show</CFormLabel>
                  <CFormSelect
                    id="pageSize"
                    size="sm"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    style={{ width: '70px' }}
                    className="border-0 bg-body-tertiary focus-ring rounded-2 fw-medium"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </CFormSelect>
                  <span className="small text-body-secondary">entries</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" className="mb-2" />
                  <p className="text-body-secondary small">Loading questions...</p>
                </div>
              ) : (
                <Table
                  columns={[
                    { label: '', style: { width: '50px' } },
                    { label: '#', style: { width: '60px' } },
                    { label: 'QUESTION' },
                    { label: 'OPTIONS' },
                    { label: 'CORRECT ANSWER', style: { width: '180px' } },
                    { label: 'SET', style: { width: '120px' } },
                    { label: 'ACTIONS', className: 'text-end pe-4', style: { width: '100px' } }
                  ]}
                >
                  {paginatedQuestions.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={7} className="text-center py-5 text-body-secondary">
                        No questions found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    paginatedQuestions.map((question, index) => (
                      <CTableRow key={question._id}>
                        <CTableDataCell>
                          <CFormCheck id={`check-${question._id}`} className="cursor-pointer" />
                        </CTableDataCell>
                        <CTableDataCell>
                          <span className="text-body-secondary small fw-bold">{startIndex + index + 1}</span>
                        </CTableDataCell>
                        <CTableDataCell style={{ maxWidth: '300px' }}>
                          <div className="fw-bold text-body-emphasis small" dangerouslySetInnerHTML={{ __html: formatText(question.question) }} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <ul className="mb-0 x-small text-body-secondary list-unstyled">
                            {question.options.map((opt, i) => (
                              <li key={i} className="d-flex align-items-center gap-2 mb-1">
                                <div className="bg-primary bg-opacity-25 rounded-circle" style={{ width: '4px', height: '4px' }}></div>
                                <span dangerouslySetInnerHTML={{ __html: formatText(opt) }} />
                              </li>
                            ))}
                          </ul>
                        </CTableDataCell>
                        <CTableDataCell className="py-2">
                          <span className="badge bg-success bg-opacity-10 text-success border-0 rounded-1 fw-bold px-2 py-1 small" dangerouslySetInnerHTML={{ __html: formatText(question.correctAnswer) }} />
                        </CTableDataCell>
                        <CTableDataCell className="py-2">
                          {question.set ? (
                            <span className={`badge rounded-1 px-2 py-1 border-0 small ${question.set.isActive ? 'bg-primary bg-opacity-10 text-primary' : 'bg-body-secondary text-body-secondary'}`}>
                              {question.set.name}
                            </span>
                          ) : (
                            <span className="badge bg-warning bg-opacity-10 text-warning border-0 rounded-1 px-2 py-1 small">No Set</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <CButton
                              color="info"
                              variant="ghost"
                              size="sm"
                              className="action-icon-btn p-1"
                              style={{ color: '#ffc107' }}
                              onClick={() => openEditModal(question)}
                            >
                              <Pencil size={16} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="sm"
                              className="action-icon-btn p-1 text-danger"
                              onClick={() => handleDeleteQuestion(question._id)}
                            >
                              <Trash2 size={16} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </Table>
              )}
            </CCardBody>

            <CCardFooter className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
              <div className="x-small text-body-secondary">
                Showing <span className="fw-bold text-body-emphasis">{startIndex + 1}</span> to <span className="fw-bold text-body-emphasis">{Math.min(endIndex, filteredQuestions.length)}</span> of{' '}
                <span className="fw-bold text-body-emphasis">{filteredQuestions.length}</span> questions
              </div>

              {!loading && filteredQuestions.length > pageSize && (
                <nav className="d-flex align-items-center gap-1">
                  <CButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none"
                  >
                    <ChevronsLeft size={14} />
                  </CButton>
                  <CButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none me-1"
                  >
                    <ChevronLeft size={14} />
                  </CButton>

                  <div className="d-flex align-items-center gap-1">
                    {(() => {
                      const pages = []
                      const maxVisible = 1

                      pages.push(
                        <CButton
                          key={1}
                          variant="ghost"
                          onClick={() => handlePageChange(1)}
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
                            onClick={() => handlePageChange(i)}
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
                            onClick={() => handlePageChange(totalPages)}
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
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none ms-1"
                  >
                    <ChevronRight size={14} />
                  </CButton>
                  <CButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none"
                  >
                    <ChevronsRight size={14} />
                  </CButton>
                </nav>
              )}
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>

      {/* Add Question Modal */}
      <CModal size="lg" visible={showAddModal} onClose={() => setShowAddModal(false)} alignment="center" className="modal-custom">
        <CModalHeader onClose={() => setShowAddModal(false)} className="border-0 pb-0">
          <CModalTitle className="fw-bold">Add New Question</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleAddQuestion}>
          <CModalBody className="p-4">
            <div className="mb-3">
              <CFormLabel htmlFor="question" className="small fw-bold text-body-secondary text-uppercase">Question</CFormLabel>
              <CFormTextarea
                id="question"
                rows={3}
                placeholder="Type your question here..."
                className="bg-body-tertiary border-0 focus-ring rounded-3"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <CFormLabel className="small fw-bold text-body-secondary text-uppercase mb-2">Options</CFormLabel>
              <CRow className="g-2">
                {[0, 1, 2, 3].map((index) => (
                  <CCol xs={6} key={index}>
                    <CFormInput
                      placeholder={`Option ${index + 1}`}
                      className="bg-body-tertiary border-0 focus-ring rounded-3 py-2"
                      value={newQuestion.options[index]}
                      onChange={(e) => updateQuestionOption(index, e.target.value)}
                      required
                    />
                  </CCol>
                ))}
              </CRow>
            </div>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel htmlFor="correctAnswer" className="small fw-bold text-body-secondary text-uppercase">Correct Answer</CFormLabel>
                  <CFormSelect
                    id="correctAnswer"
                    className="bg-body-tertiary border-0 focus-ring rounded-3 py-2"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    required
                  >
                    <option value="">Select the correct option</option>
                    {newQuestion.options.map((opt, i) => opt.trim() && (
                      <option key={i} value={opt}>{`Option ${i + 1}: ${opt}`}</option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel htmlFor="set" className="small fw-bold text-body-secondary text-uppercase">Assign to Set</CFormLabel>
                  <CFormSelect
                    id="set"
                    className="bg-body-tertiary border-0 focus-ring rounded-3 py-2"
                    value={newQuestion.set}
                    onChange={(e) => setNewQuestion({ ...newQuestion, set: e.target.value })}
                    required
                  >
                    <option value="">Select a set</option>
                    {sets.map((set) => (
                      <option key={set._id} value={set._id}>
                        {set.name} {set.isActive ? '(Active)' : ''}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className="border-0 pt-0 pb-4 px-4">
            <CButton color="secondary" variant="ghost" className="fw-bold px-4 rounded-3" onClick={() => setShowAddModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" className="fw-bold px-4 rounded-3 shadow-sm" disabled={formLoading}>
              {formLoading ? <CSpinner size="sm" /> : 'Create Question'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Edit Question Modal */}
      {editQuestion && (
        <CModal size="lg" visible={showEditModal} onClose={() => setShowEditModal(false)} alignment="center" className="modal-custom">
          <CModalHeader onClose={() => setShowEditModal(false)} className="border-0 pb-0">
            <CModalTitle className="fw-bold">Edit Question</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleEditQuestion}>
            <CModalBody className="p-4">
              <div className="mb-3">
                <CFormLabel htmlFor="editQuestion" className="small fw-bold text-body-secondary text-uppercase">Question</CFormLabel>
                <CFormTextarea
                  id="editQuestion"
                  rows={3}
                  className="bg-body-tertiary border-0 focus-ring rounded-3"
                  value={editQuestion.question}
                  onChange={(e) => setEditQuestion({ ...editQuestion, question: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <CFormLabel className="small fw-bold text-body-secondary text-uppercase mb-2">Options</CFormLabel>
                <CRow className="g-2">
                  {[0, 1, 2, 3].map((index) => (
                    <CCol xs={6} key={index}>
                      <CFormInput
                        placeholder={`Option ${index + 1}`}
                        className="bg-body-tertiary border-0 focus-ring rounded-3 py-2"
                        value={editQuestion.options[index] || ''}
                        onChange={(e) => updateEditQuestionOption(index, e.target.value)}
                        required
                      />
                    </CCol>
                  ))}
                </CRow>
              </div>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="editCorrectAnswer" className="small fw-bold text-body-secondary text-uppercase">Correct Answer</CFormLabel>
                    <CFormSelect
                      id="editCorrectAnswer"
                      className="bg-body-tertiary border-0 focus-ring rounded-3 py-2"
                      value={editQuestion.correctAnswer}
                      onChange={(e) =>
                        setEditQuestion({ ...editQuestion, correctAnswer: e.target.value })
                      }
                      required
                    >
                      {editQuestion.options.map((opt, i) => opt.trim() && (
                        <option key={i} value={opt}>{`Option ${i + 1}: ${opt}`}</option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="editSet" className="small fw-bold text-body-secondary text-uppercase">Assign to Set</CFormLabel>
                    <CFormSelect
                      id="editSet"
                      className="bg-body-tertiary border-0 focus-ring rounded-3 py-2"
                      value={editQuestion.set}
                      onChange={(e) => setEditQuestion({ ...editQuestion, set: e.target.value })}
                      required
                    >
                      <option value="">Select a set</option>
                      {sets.map((set) => (
                        <option key={set._id} value={set._id}>
                          {set.name} {set.isActive ? '(Active)' : ''}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter className="border-0 pt-0 pb-4 px-4">
              <CButton color="secondary" variant="ghost" className="fw-bold px-4 rounded-3" onClick={() => setShowEditModal(false)}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit" className="fw-bold px-4 rounded-3 shadow-sm" disabled={formLoading}>
                {formLoading ? <CSpinner size="sm" /> : 'Update Question'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      )}

      {/* Manage Sets Modal */}
      <CModal size="lg" visible={showSetsModal} onClose={() => setShowSetsModal(false)} alignment="center">
        <CModalHeader onClose={() => setShowSetsModal(false)} className="border-0">
          <CModalTitle className="fw-bold text-primary d-flex align-items-center gap-2">
            <Folder size={20} />
            Manage Sets
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4 pt-0">
          {/* Add new set form */}
          <CForm onSubmit={handleAddSet} className="mb-4 bg-body-tertiary p-3 rounded-3 shadow-sm border">
            <CRow className="align-items-end g-2">
              <CCol sm={9}>
                <CFormLabel className="small fw-bold text-body-secondary text-uppercase mb-2">Create New Set</CFormLabel>
                <CFormInput
                  placeholder="Enter set name (e.g. Science, History...)"
                  className="bg-white border-0 focus-ring rounded-3"
                  value={newSet.name}
                  onChange={(e) => setNewSet({ name: e.target.value })}
                  required
                />
              </CCol>
              <CCol sm={3}>
                <CButton color="primary" type="submit" className="w-100 fw-bold rounded-3 shadow-sm" style={{ height: '38px' }} disabled={formLoading}>
                  {formLoading ? <CSpinner size="sm" /> : 'Add Set'}
                </CButton>
              </CCol>
            </CRow>
          </CForm>

          {/* Sets table */}
          <Table
            columns={[
              { label: 'SET NAME' },
              { label: 'STATUS' },
              { label: 'ACTIONS', className: 'text-end pe-4' }
            ]}
          >
            {sets.map((set) => (
              <CTableRow key={set._id}>
                <CTableDataCell>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-2 me-3">
                      <Folder size={14} />
                    </div>
                    <div className="fw-bold text-body-emphasis small">{set.name}</div>
                  </div>
                </CTableDataCell>
                <CTableDataCell className="py-2">
                  <span className={`badge rounded-1 px-2 py-1 border-0 small ${set.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-body-secondary text-body-secondary'}`}>
                    {set.isActive ? 'Active' : 'Inactive'}
                  </span>
                </CTableDataCell>
                <CTableDataCell className="text-end pe-4">
                  <div className="d-flex justify-content-end gap-1">
                    {!set.isActive && (
                      <CButton
                        color="success"
                        variant="ghost"
                        size="sm"
                        className="action-icon-btn p-1 text-success"
                        onClick={() => handleActivateSet(set._id)}
                      >
                        <CheckCircle size={16} />
                      </CButton>
                    )}
                    <CButton
                      color="info"
                      variant="ghost"
                      size="sm"
                      className="action-icon-btn p-1"
                      style={{ color: '#ffc107' }}
                      onClick={() => openEditSetModal(set)}
                    >
                      <Pencil size={16} />
                    </CButton>
                    <CButton
                      color="danger"
                      variant="ghost"
                      size="sm"
                      className="action-icon-btn p-1 text-danger"
                      onClick={() => handleDeleteSet(set._id)}
                    >
                      <Trash2 size={16} />
                    </CButton>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </Table>
        </CModalBody>
        <CModalFooter className="border-0">
          <CButton color="secondary" variant="ghost" className="fw-bold" onClick={() => setShowSetsModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Set Modal */}
      {editSet && (
        <CModal visible={showEditSetModal} onClose={() => setShowEditSetModal(false)} alignment="center">
          <CModalHeader onClose={() => setShowEditSetModal(false)} className="border-0 pb-0">
            <CModalTitle className="fw-bold">Edit Set</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleEditSet}>
            <CModalBody className="p-4">
              <div className="mb-3">
                <CFormLabel htmlFor="editSetName" className="small fw-bold text-body-secondary text-uppercase">Set Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="editSetName"
                  className="bg-body-tertiary border-0 focus-ring rounded-3 py-2"
                  value={editSet.name}
                  onChange={(e) => setEditSet({ ...editSet, name: e.target.value })}
                  required
                />
              </div>
            </CModalBody>
            <CModalFooter className="border-0 pt-0 pb-4 px-4">
              <CButton color="secondary" variant="ghost" className="fw-bold px-4 rounded-3" onClick={() => setShowEditSetModal(false)}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit" className="fw-bold px-4 rounded-3 shadow-sm" disabled={formLoading}>
                {formLoading ? <CSpinner size="sm" /> : 'Update Set'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      )}

      <style>{`
        /* Rounded checkbox styling */
        .form-check-input {
          border-radius: 0.375rem;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .x-small { font-size: 0.75rem; }
        .action-icon-btn { transition: all 0.2s ease; }
        .action-icon-btn:hover { background-color: rgba(var(--cui-primary-rgb), 0.1); transform: scale(1.1); }
      `}</style>
    </>
  )
}

export default QuestionsManagement
