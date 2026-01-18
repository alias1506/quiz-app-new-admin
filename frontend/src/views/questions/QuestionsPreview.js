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
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CTooltip,
    CCardFooter,
    CForm,
    CFormLabel,
    CFormTextarea,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CInputGroup
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChevronBottom } from '@coreui/icons'
import { questionsAPI, setsAPI } from '../../services/api'
import { Toast, Modal } from '../../utils/sweetalert'
import { formatText } from '../../utils/formatText'
import Table from '../../components/Table'
import { Trash2, Pencil, HelpCircle, Filter, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, X, List, CheckCircle, Type, Folder, Save, Search, RefreshCw } from 'lucide-react'
import ActionButton from '../../components/ActionButton'
import TargetSetDropdown from '../../components/TargetSetDropdown'

const QuestionsPreview = () => {
    const [questions, setQuestions] = useState([])
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSet, setSelectedSet] = useState(localStorage.getItem('admin_selectedSet') || 'all')
    const [selectedQuestions, setSelectedQuestions] = useState([])
    const [entriesPerPage] = useState(10) // Changed to 10 for pagination demo visibility
    const [currentPage, setCurrentPage] = useState(1)


    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [editFormData, setEditFormData] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        set: ''
    })

    // Save selected set to local storage and refresh data when it changes
    useEffect(() => {
        localStorage.setItem('admin_selectedSet', selectedSet)
        setCurrentPage(1)
        refreshData()
    }, [selectedSet])

    const refreshData = async () => {
        setLoading(true)
        try {
            // Always fetch sets to keep dropdown up to date
            const setsRes = await setsAPI.getAll()
            const sortedSets = (setsRes.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            setSets(sortedSets)

            // Fetch questions based on selection
            let sortedQuestions = []
            if (selectedSet === 'all') {
                const questionsRes = await questionsAPI.getAll()
                sortedQuestions = (questionsRes.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            } else {
                const questionsRes = await questionsAPI.getBySet(selectedSet, true)
                sortedQuestions = (questionsRes.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            }

            setQuestions(sortedQuestions)
        } catch (err) {
            console.error('Error fetching data:', err)
            Toast.fire({
                icon: 'error',
                title: 'Data fetch failed',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (questionId) => {
        const result = await Modal.fire({
            title: 'Delete Question?',
            text: "This question will be removed permanently.",
            icon: 'warning',
            confirmButtonText: 'Yes, Delete',
        })

        if (!result.isConfirmed) return

        try {
            await questionsAPI.delete(questionId)
            setQuestions(questions.filter(q => q._id !== questionId))
            setSelectedQuestions(selectedQuestions.filter(id => id !== questionId))
            Toast.fire({
                icon: 'success',
                title: 'Question deleted',
            })
        } catch (err) {
            Toast.fire({
                icon: 'error',
                title: 'Delete failed',
            })
        }
    }

    const openEditModal = (question) => {
        setEditingQuestion(question)
        setEditFormData({
            question: question.question,
            options: [...question.options],
            correctAnswer: question.correctAnswer,
            set: question.set?._id || question.set || ''
        })
        setEditModalVisible(true)
    }

    const handleUpdateQuestion = async () => {
        if (!editFormData.question.trim() || !editFormData.set || !editFormData.correctAnswer) {
            Toast.fire({ icon: 'warning', title: 'Please fill all required fields' })
            return
        }

        // Prepare trimmed data to avoid whitespace issues
        const trimmedData = {
            ...editFormData,
            question: editFormData.question.trim(),
            options: editFormData.options.map(opt => String(opt).trim()),
            correctAnswer: String(editFormData.correctAnswer).trim()
        }

        // Verification check before sending
        if (!trimmedData.options.includes(trimmedData.correctAnswer)) {
            Toast.fire({
                icon: 'error',
                title: 'Invalid Correct Answer',
                text: 'The correct answer must exactly match one of the options.'
            })
            return
        }

        setUpdateLoading(true)
        try {
            const res = await questionsAPI.update(editingQuestion._id, trimmedData)
            if (res.data.question) {
                setQuestions(questions.map(q => q._id === editingQuestion._id ? res.data.question : q))
                setEditModalVisible(false)
                Toast.fire({
                    icon: 'success',
                    title: 'Question updated successfully'
                })
            }
        } catch (err) {
            console.error('Error updating question:', err)
            Toast.fire({
                icon: 'error',
                title: 'Update failed',
                text: err.response?.data?.message || 'Something went wrong'
            })
        } finally {
            setUpdateLoading(false)
        }
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...editFormData.options]
        const oldOptionValue = newOptions[index]
        newOptions[index] = value

        const newFormData = { ...editFormData, options: newOptions }

        // If the correct answer was this option, update it to the new value
        if (editFormData.correctAnswer === oldOptionValue) {
            newFormData.correctAnswer = value
        }

        setEditFormData(newFormData)
    }

    const filteredQuestions = questions.filter(q => {
        const matchesSet = selectedSet === 'all' || q.set?._id === selectedSet || q.set === selectedSet
        return matchesSet
    })

    const handleBulkDelete = async () => {
        if (selectedQuestions.length === 0) return

        const result = await Modal.fire({
            title: 'Delete Selected?',
            text: `Remove ${selectedQuestions.length} selected question(s)?`,
            icon: 'warning',
            confirmButtonText: 'Delete All',
        })

        if (!result.isConfirmed) return

        try {
            await questionsAPI.bulkDelete(selectedQuestions)
            setQuestions(questions.filter(q => !selectedQuestions.includes(q._id)))
            setSelectedQuestions([])
            Toast.fire({
                icon: 'success',
                title: 'Questions deleted',
            })
        } catch (err) {
            Toast.fire({
                icon: 'error',
                title: 'Bulk delete failed',
            })
        }
    }

    const toggleQuestionSelection = (questionId) => {
        if (selectedQuestions.includes(questionId)) {
            setSelectedQuestions(selectedQuestions.filter(id => id !== questionId))
        } else {
            setSelectedQuestions([...selectedQuestions, questionId])
        }
    }

    const toggleSelectAll = () => {
        const currentQuestions = filteredQuestions.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
        const allSelected = currentQuestions.every(q => selectedQuestions.includes(q._id))

        if (allSelected) {
            const currentIds = currentQuestions.map(q => q._id)
            setSelectedQuestions(selectedQuestions.filter(id => !currentIds.includes(id)))
        } else {
            const newSelections = currentQuestions
                .map(q => q._id)
                .filter(id => !selectedQuestions.includes(id))
            setSelectedQuestions([...selectedQuestions, ...newSelections])
        }
    }



    return (
        <CRow className="gx-0">
            <CCol xs={12}>
                <CCard className="shadow-sm border-0 rounded-2" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                                <HelpCircle size={20} />
                            </div>
                            <h5 className="mb-0 fw-bold">Questions Management</h5>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            {selectedQuestions.length > 0 && (
                                <CButton
                                    onClick={handleBulkDelete}
                                    className="btn-delete-selected-standard"
                                >
                                    <Trash2 size={16} />
                                    Delete Selected ({selectedQuestions.length})
                                </CButton>
                            )}



                            {/* Action Group: Filter, Refresh */}
                            <div className="d-flex align-items-center gap-3">
                                {/* Set Filter Dropdown - Architectural Design */}
                                <div className="d-flex align-items-center bg-body-tertiary rounded-2 border" style={{ height: '38px', minWidth: '220px' }}>
                                    <div className="px-3 h-100 bg-body-tertiary d-flex align-items-center border-end rounded-start-2">
                                        <Folder size={12} className="text-body-secondary me-2" />
                                        <small className="text-body-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Set</small>
                                    </div>
                                    <CDropdown className="flex-grow-1 h-100">
                                        <CDropdownToggle
                                            variant="ghost"
                                            className="w-100 h-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer text-start rounded-0 rounded-end-2"
                                            caret={false}
                                        >
                                            <span className={`fw-bold text-truncate ${selectedSet === 'all' ? 'text-body-secondary' : 'text-body-emphasis'}`} style={{ fontSize: '13px' }}>
                                                {selectedSet === 'all' ? 'All Sets' : (sets.find(s => s._id === selectedSet)?.name || 'Select Set')}
                                            </span>
                                            <ChevronDown size={14} className="text-body-secondary opacity-50 dropdown-chevron ms-2" />
                                        </CDropdownToggle>
                                        <CDropdownMenu className="dropdown-menu-custom dropdown-menu-strict-anim shadow-lg p-1 border-0 min-w-150">
                                            <CDropdownItem
                                                onClick={() => setSelectedSet('all')}
                                                className="rounded-1 mb-1 fw-bold"
                                                style={selectedSet === 'all' ? { backgroundColor: 'var(--cui-primary)', color: 'white', fontSize: '13px' } : { fontSize: '13px' }}
                                            >
                                                All Sets
                                            </CDropdownItem>
                                            <div className="dropdown-divider opacity-10"></div>
                                            {sets.map(set => (
                                                <CDropdownItem
                                                    key={set._id}
                                                    onClick={() => setSelectedSet(set._id)}
                                                    className="rounded-1 mb-1 fw-medium"
                                                    style={selectedSet === set._id ? { backgroundColor: 'var(--cui-primary)', color: 'white', fontSize: '13px' } : { fontSize: '13px' }}
                                                >
                                                    {set.name}
                                                </CDropdownItem>
                                            ))}
                                        </CDropdownMenu>
                                    </CDropdown>
                                </div>


                                <CButton
                                    onClick={refreshData}
                                    disabled={loading}
                                    className="btn-refresh-standard"
                                >
                                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                                    Refresh
                                </CButton>
                            </div>
                        </div>
                    </CCardHeader>
                    <CCardBody className="p-4 flex-grow-1 overflow-auto">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                                <div className="text-center">
                                    <CSpinner color="primary" className="mb-2" />
                                    <p className="text-body-secondary small mb-0">Loading questions...</p>
                                </div>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="bg-body-secondary rounded-circle d-inline-flex p-4 mb-3">
                                    <HelpCircle size={40} className="text-body-secondary opacity-50" />
                                </div>
                                <h5 className="text-body-secondary fw-bold">No Questions Found</h5>
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
                                                    checked={filteredQuestions.length > 0 && filteredQuestions.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).every(q => selectedQuestions.includes(q._id))}
                                                    onChange={toggleSelectAll}
                                                    className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                                                />
                                                <span className="ms-1">#</span>
                                            </div>
                                        ),
                                        style: { width: '100px' }
                                    },
                                    { label: 'Question Content', style: { width: '38%' } },
                                    { label: 'Correct Answer', style: { width: '18%' } },
                                    { label: 'Set Information', style: { width: '15%' } },
                                    { label: 'Actions', className: 'text-end pe-4', style: { width: '120px' } }
                                ]}
                            >
                                {filteredQuestions.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((question, index) => (
                                    <CTableRow key={question._id}>
                                        <CTableDataCell style={{ width: '100px' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuestions.includes(question._id)}
                                                    onChange={() => toggleQuestionSelection(question._id)}
                                                    className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                                                />
                                                <span className="text-body-emphasis fw-bold">{(currentPage - 1) * entriesPerPage + index + 1}</span>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className="allow-wrap" style={{ width: '38%' }}>
                                            <div className="fw-bold mb-2 text-body-emphasis" style={{ whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: formatText(question.question) }}></div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {question.options.map((opt, i) => (
                                                    <span key={i} className="badge bg-body-secondary text-body-secondary border border-secondary-subtle rounded-1 fw-normal px-2 py-1" dangerouslySetInnerHTML={{ __html: formatText(opt) }}></span>
                                                ))}
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell style={{ width: '18%' }}>
                                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-1 fw-bold px-3 py-2" dangerouslySetInnerHTML={{ __html: formatText(question.correctAnswer) }}></span>
                                        </CTableDataCell>
                                        <CTableDataCell style={{ width: '15%' }}>
                                            <span className={`badge rounded-1 px-3 py-2 border ${question.set?.isActive ? 'bg-info-subtle text-info border-info-subtle' : 'bg-body-secondary text-body-secondary border-secondary-subtle'
                                                }`}>
                                                <Folder size={12} className="me-1" />
                                                {question.set?.name || (typeof question.set === 'string' ? question.set : "Default")}
                                            </span>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end pe-4" style={{ width: '120px' }}>
                                            <div className="d-flex justify-content-end gap-1">
                                                <CTooltip content="Edit Question">
                                                    <CButton
                                                        className="action-icon-btn"
                                                        style={{ color: '#ffc107' }}
                                                        size="sm"
                                                        onClick={() => openEditModal(question)}
                                                    >
                                                        <Pencil size={18} />
                                                    </CButton>
                                                </CTooltip>
                                                <CTooltip content="Delete Question">
                                                    <CButton
                                                        onClick={() => handleDelete(question._id)}
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

                    {!loading && filteredQuestions.length > 0 && (
                        <CCardFooter className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                            <small className="text-body-secondary x-small">
                                Showing <span className="fw-bold text-body-emphasis">{(currentPage - 1) * entriesPerPage + (filteredQuestions.length > 0 ? 1 : 0)}</span> to <span className="fw-bold text-body-emphasis">{Math.min(currentPage * entriesPerPage, filteredQuestions.length)}</span> of <span className="fw-bold text-body-emphasis">{filteredQuestions.length}</span> questions
                            </small>

                            {filteredQuestions.length > entriesPerPage && (
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
                                            const totalPages = Math.ceil(filteredQuestions.length / entriesPerPage)
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
                                        disabled={currentPage === Math.ceil(filteredQuestions.length / entriesPerPage)}
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredQuestions.length / entriesPerPage), p + 1))}
                                        className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none ms-1"
                                    >
                                        <ChevronRight size={14} />
                                    </CButton>
                                    <CButton
                                        variant="ghost"
                                        size="sm"
                                        disabled={currentPage === Math.ceil(filteredQuestions.length / entriesPerPage)}
                                        onClick={() => setCurrentPage(Math.ceil(filteredQuestions.length / entriesPerPage))}
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

            {/* Edit Question Modal */}
            < CModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                alignment="center"
                size="lg"
                backdrop="static"
                className="modal-custom"
            >
                <CModalHeader className="border-0 pb-0">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                        <Pencil size={18} />
                    </div>
                    <CModalTitle className="fw-bold h5 mb-0">Edit Question</CModalTitle>
                </CModalHeader>

                <CModalBody className="p-4">
                    <div className="row g-4">
                        {/* LHS: Question & Set */}
                        <div className="col-lg-6 border-end">
                            <div className="mb-4">
                                <CFormLabel className="fw-bold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                    <Type size={14} />
                                    Question Content
                                </CFormLabel>
                                <CFormTextarea
                                    rows={4}
                                    placeholder="Enter question text..."
                                    value={editFormData.question}
                                    onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                                    className="quiz-textarea-standard"
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            <div>
                                <TargetSetDropdown
                                    sets={sets}
                                    selectedSet={editFormData.set}
                                    onSetSelect={(setId) => setEditFormData({ ...editFormData, set: setId })}
                                    onCreateNew={() => {
                                        setEditModalVisible(false)
                                        // User would need to navigate to AddQuestions or we'd need a simpler modal here
                                        Toast.fire({ icon: 'info', title: 'Please create new sets from "Add Questions" page.' })
                                    }}
                                />
                            </div>
                        </div>

                        {/* RHS: Options & Answer */}
                        <div className="col-lg-6">
                            <div className="mb-4">
                                <CFormLabel className="fw-bold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                    <List size={14} />
                                    Answer Options
                                </CFormLabel>
                                <div className="d-flex flex-column gap-2">
                                    {editFormData.options.map((option, index) => (
                                        <CInputGroup key={index} className="rounded-2 overflow-hidden bg-body-tertiary border" style={{ height: '38px' }}>
                                            <div className="input-group-text bg-body-secondary border-0 text-body-secondary fw-bold px-3" style={{ fontSize: '12px' }}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <CFormInput
                                                value={option}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="border-0 bg-transparent focus-ring px-3 fw-medium"
                                                style={{ fontSize: '13px' }}
                                            />
                                        </CInputGroup>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <CFormLabel className="fw-bold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                    <CheckCircle size={14} />
                                    Correct Answer
                                </CFormLabel>
                                <CDropdown className="w-100 bg-body-tertiary rounded-2 border">
                                    <CDropdownToggle
                                        variant="ghost"
                                        className="w-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer"
                                        caret={false}
                                        disabled={editFormData.options.every(opt => !opt.trim())}
                                        style={{ height: '38px' }}
                                    >
                                        <span className={`fw-bold small ${!editFormData.correctAnswer ? 'text-body-secondary' : 'text-body-emphasis'}`}>
                                            {editFormData.correctAnswer ? <span dangerouslySetInnerHTML={{ __html: formatText(editFormData.correctAnswer) }} /> : 'Select correct answer...'}
                                        </span>
                                        <ChevronDown size={14} className="text-body-secondary dropdown-chevron" />
                                    </CDropdownToggle>
                                    <CDropdownMenu className="dropdown-menu-custom dropdown-menu-strict-anim shadow-lg p-1 border-0 w-100">
                                        {editFormData.options.map((option, index) => (
                                            option.trim() && (
                                                <CDropdownItem
                                                    key={index}
                                                    onClick={() => setEditFormData({ ...editFormData, correctAnswer: option })}
                                                    className="px-3 py-2 rounded-1 cursor-pointer fw-medium d-flex align-items-center mb-1"
                                                    style={editFormData.correctAnswer === option ? { backgroundColor: '#5856d6', color: 'white' } : {}}
                                                >
                                                    <span className={`badge me-2 ${editFormData.correctAnswer === option ? 'bg-white text-primary' : 'bg-body-secondary text-body-emphasis'}`}>
                                                        {String.fromCharCode(65 + index)}
                                                    </span>
                                                    <span style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: formatText(option) }} />
                                                </CDropdownItem>
                                            )
                                        ))}
                                    </CDropdownMenu>
                                </CDropdown>
                            </div>
                        </div>
                    </div>
                </CModalBody>

                <CModalFooter className="border-0 pt-0 pb-4 px-4 d-flex justify-content-end gap-2">
                    <ActionButton
                        variant="secondary"
                        onClick={() => setEditModalVisible(false)}
                        fullWidth={false}
                        className="px-4"
                        disabled={updateLoading}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={handleUpdateQuestion}
                        loading={updateLoading}
                        fullWidth={false}
                        className="px-4"
                        icon={Save}
                    >
                        Save Changes
                    </ActionButton>
                </CModalFooter>
            </CModal >

            <style>{`
                .x-small { font-size: 0.75rem; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </CRow >
    )
}

export default QuestionsPreview
