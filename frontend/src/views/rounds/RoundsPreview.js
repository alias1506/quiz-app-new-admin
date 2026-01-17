import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CButton,
    CTooltip,
    CTableRow,
    CTableDataCell,
    CCardFooter,
    CFormInput,
} from '@coreui/react'
import { quizzesAPI, roundsAPI } from '../../services/api'
import { Toast, Modal } from '../../utils/sweetalert'
import {
    Gamepad2,
    Calendar,
    RefreshCw,
    Layers,
    PlusCircle,
    MinusCircle,
    Eye,
    Target,
    Trash2,
    Folder,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
    Filter,
    AlertTriangle,
    Clock,
} from 'lucide-react'
import Table from '../../components/Table'
import { format } from 'date-fns'

const RoundsPreview = () => {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewModalVisible, setViewModalVisible] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState(null)
    const [selectedQuizzes, setSelectedQuizzes] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [entriesPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchQuizzes()
    }, [])

    const fetchQuizzes = async () => {
        setLoading(true)
        try {
            const quizzesResponse = await quizzesAPI.getAll()
            const quizzesData = quizzesResponse.data || []

            // Fetch rounds for each quiz
            const quizzesWithRounds = await Promise.all(
                quizzesData.map(async (quiz) => {
                    try {
                        const roundsResponse = await roundsAPI.getByQuiz(quiz._id)
                        return {
                            ...quiz,
                            rounds: roundsResponse.data || []
                        }
                    } catch {
                        return {
                            ...quiz,
                            rounds: []
                        }
                    }
                })
            )

            setQuizzes(quizzesWithRounds)
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Failed to load quizzes' })
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = (quiz) => {
        setSelectedQuiz(quiz)
        setViewModalVisible(true)
    }

    const handleDelete = async (quizId) => {
        const result = await Modal.fire({
            title: 'Delete Quiz?',
            text: "This quiz and all its rounds will be removed permanently.",
            icon: 'warning',
            confirmButtonText: 'Yes, Delete',
        })

        if (!result.isConfirmed) return

        try {
            await quizzesAPI.delete(quizId)
            setQuizzes(quizzes.filter(q => q._id !== quizId))
            setSelectedQuizzes(selectedQuizzes.filter(id => id !== quizId))
            Toast.fire({
                icon: 'success',
                title: 'Quiz deleted',
            })
        } catch (err) {
            Toast.fire({
                icon: 'error',
                title: 'Delete failed',
            })
        }
    }

    const handleBulkDelete = async () => {
        if (selectedQuizzes.length === 0) return

        const result = await Modal.fire({
            title: 'Delete Selected?',
            text: `Remove ${selectedQuizzes.length} selected quiz(zes)?`,
            icon: 'warning',
            confirmButtonText: 'Delete All',
        })

        if (!result.isConfirmed) return

        try {
            await Promise.all(selectedQuizzes.map(id => quizzesAPI.delete(id)))
            setQuizzes(quizzes.filter(q => !selectedQuizzes.includes(q._id)))
            setSelectedQuizzes([])
            Toast.fire({
                icon: 'success',
                title: 'Quizzes deleted',
            })
        } catch (err) {
            Toast.fire({
                icon: 'error',
                title: 'Bulk delete failed',
            })
        }
    }

    const toggleQuizSelection = (quizId) => {
        if (selectedQuizzes.includes(quizId)) {
            setSelectedQuizzes(selectedQuizzes.filter(id => id !== quizId))
        } else {
            setSelectedQuizzes([...selectedQuizzes, quizId])
        }
    }

    const toggleSelectAll = () => {
        if (selectedQuizzes.length === quizzes.length) {
            setSelectedQuizzes([])
        } else {
            setSelectedQuizzes(quizzes.map(q => q._id))
        }
    }

    const filteredQuizzes = quizzes.filter(q => {
        const matchesSearch = q.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.rounds.some(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesSearch
    })

    const renderRoundItem = (round, index) => (
        <div
            key={round._id}
            className="p-3 bg-body-tertiary rounded-3 border-start border-4 border-primary shadow-sm mb-2"
        >
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary text-white fw-bold px-2 py-1" style={{ fontSize: '0.65rem' }}>
                        Round {index !== undefined ? index + 1 : ''}
                    </span>
                    <h6 className="fw-bold mb-0 small text-body-emphasis">{round.name || 'Untitled Round'}</h6>
                </div>
                <div className="d-flex gap-2">
                    <div className="d-flex align-items-center gap-1 bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        <PlusCircle size={10} />
                        <span className="fw-bold">{round.positivePoints || 0}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1 bg-danger bg-opacity-10 text-danger px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        <MinusCircle size={10} />
                        <span className="fw-bold">{round.negativePoints || 0}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1 bg-info bg-opacity-10 text-info px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        <Clock size={10} />
                        <span className="fw-bold">
                            {round.timer && (round.timer.hours > 0 || round.timer.minutes > 0 || round.timer.seconds > 0) ? (
                                `${round.timer.hours.toString().padStart(2, '0')}:${round.timer.minutes.toString().padStart(2, '0')}:${round.timer.seconds.toString().padStart(2, '0')}`
                            ) : (
                                "Unlimited"
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {round.description && (
                <div className="text-body-secondary x-small mb-2 text-truncate-2" dangerouslySetInnerHTML={{ __html: round.description }} />
            )}

            {/* Sets - Inline */}
            {round.selectedSets && round.selectedSets.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mt-2">
                    {round.selectedSets.map((set) => (
                        <div
                            key={set._id}
                            className="d-flex align-items-center gap-1 bg-info bg-opacity-10 text-info px-2 py-1 rounded-2 border border-info border-opacity-25"
                            style={{ fontSize: '0.65rem' }}
                        >
                            <Folder size={10} />
                            <span>{set.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <CRow className="gx-0">
            <CCol xs={12}>
                <CCard className="shadow-sm border-0 rounded-2" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                                <Gamepad2 size={24} />
                            </div>
                            <div>
                                <h4 className="mb-0 fw-bold">All Quizzes</h4>
                                <div className="small text-body-secondary mt-1">Manage your existing quiz containers</div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            {selectedQuizzes.length > 0 && (
                                <CButton
                                    onClick={handleBulkDelete}
                                    className="btn-delete-selected-standard"
                                >
                                    <Trash2 size={16} />
                                    Delete Selected ({selectedQuizzes.length})
                                </CButton>
                            )}

                            {/* Search */}
                            <div className="position-relative search-container-standard" style={{ width: '240px' }}>
                                <Search className="position-absolute top-50 translate-middle-y search-icon text-body-secondary" size={14} />
                                <CFormInput
                                    placeholder="Search quizzes..."
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
                                onClick={fetchQuizzes}
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
                        ) : filteredQuizzes.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="bg-body-secondary rounded-circle d-inline-flex p-4 mb-3">
                                    <Layers size={40} className="text-body-secondary opacity-50" />
                                </div>
                                <h5 className="text-body-secondary fw-bold">No Quizzes Found</h5>
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
                                                    checked={filteredQuizzes.length > 0 && selectedQuizzes.length === filteredQuizzes.length}
                                                    onChange={toggleSelectAll}
                                                    className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                                                />
                                                <span className="ms-1">#</span>
                                            </div>
                                        ),
                                        style: { width: '100px' }
                                    },
                                    { label: 'QUIZ NAME' },
                                    { label: 'STRUCTURE', style: { width: '160px' } },
                                    { label: 'STATUS', style: { width: '110px' } },
                                    { label: 'CREATED AT', style: { width: '180px' } },
                                    { label: 'ACTIONS', className: 'text-end pe-4', style: { width: '140px' } }
                                ]}
                            >
                                {filteredQuizzes.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((quiz, index) => (
                                    <CTableRow key={quiz._id}>
                                        <CTableDataCell style={{ width: '100px' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuizzes.includes(quiz._id)}
                                                    onChange={() => toggleQuizSelection(quiz._id)}
                                                    className="form-check-input rounded-1 border-2 shadow-none cursor-pointer"
                                                />
                                                <span className="text-body-emphasis fw-bold">{(currentPage - 1) * entriesPerPage + index + 1}</span>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div className="d-flex align-items-center gap-2">
                                                <Folder size={16} className="text-primary opacity-75" />
                                                <span className="fw-bold text-body-emphasis">{quiz.name}</span>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-body-secondary py-3">
                                            <div className="d-flex flex-column gap-1">
                                                {/* Rounds Count (Unique Names only) */}
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fw-bold text-body-emphasis small">
                                                        {(() => {
                                                            const uniqueRoundNames = new Set(quiz.rounds?.map(r => {
                                                                // Strip suffixes starting with : or - to count base rounds
                                                                const baseName = (r.name || '').split(/[:\-]/)[0].trim()
                                                                return baseName.toLowerCase()
                                                            }).filter(Boolean))
                                                            const count = uniqueRoundNames.size
                                                            return `${count} ${count === 1 ? 'Round' : 'Rounds'}`
                                                        })()}
                                                    </span>
                                                    {((quiz.rounds?.length || 0) === 0 || quiz.rounds?.some(r => !r.sets || r.sets.length === 0)) && (
                                                        <CTooltip content={(quiz.rounds?.length || 0) === 0 ? "No rounds created for this quiz" : "Some rounds have no sets"}>
                                                            <AlertTriangle size={14} className="text-danger" />
                                                        </CTooltip>
                                                    )}
                                                </div>

                                                {/* Parts Count (Unique Parts only) */}
                                                <div className="d-flex align-items-center gap-2">
                                                    {(() => {
                                                        const uniqueParts = new Set()
                                                        if (quiz.rounds) {
                                                            quiz.rounds.forEach(round => {
                                                                if (round.assignedParts && round.assignedParts.length > 0) {
                                                                    round.assignedParts.forEach(part => uniqueParts.add(part))
                                                                }
                                                            })
                                                        }
                                                        return uniqueParts.size > 0 ? (
                                                            <span className="x-small text-primary fw-semibold bg-primary bg-opacity-10 px-2 py-0.5 rounded-pill border border-primary border-opacity-10">
                                                                {uniqueParts.size} {uniqueParts.size === 1 ? 'PART' : 'PARTS'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-body-tertiary x-small fst-italic">No Parts</span>
                                                        )
                                                    })()}
                                                </div>

                                                {/* Total Sets Count (Unique across rounds) */}
                                                <div className="d-flex align-items-center gap-2">
                                                    {(() => {
                                                        const uniqueSets = new Set()
                                                        if (quiz.rounds) {
                                                            quiz.rounds.forEach(round => {
                                                                const sets = round.selectedSets || round.sets || []
                                                                sets.forEach(s => {
                                                                    const id = typeof s === 'object' ? s._id : s
                                                                    if (id) uniqueSets.add(id)
                                                                })
                                                            })
                                                        }
                                                        return uniqueSets.size > 0 ? (
                                                            <span className="x-small text-secondary fw-semibold bg-secondary bg-opacity-10 px-2 py-0.5 rounded-pill border border-secondary border-opacity-10">
                                                                {uniqueSets.size} {uniqueSets.size === 1 ? 'SET' : 'SETS'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-body-tertiary x-small fst-italic">No Sets</span>
                                                        )
                                                    })()}
                                                </div>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            {quiz.isPublished ? (
                                                <span className="badge rounded-pill x-small fw-bold bg-success bg-opacity-10 text-success border border-success" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                                    LIVE
                                                </span>
                                            ) : (
                                                <span className="badge rounded-pill x-small fw-bold bg-warning bg-opacity-10 text-warning border border-warning" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                                    DRAFT
                                                </span>
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell style={{ width: '180px' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <Calendar size={13} className="text-body-secondary opacity-50" />
                                                <div>
                                                    <div className="small fw-semibold text-body-emphasis">
                                                        {quiz.createdAt ? format(new Date(quiz.createdAt), 'dd/MM/yyyy') : 'N/A'}
                                                    </div>
                                                    <div className="x-small text-body-secondary opacity-75">
                                                        {quiz.createdAt ? format(new Date(quiz.createdAt), 'HH:mm') : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end pe-4" style={{ width: '140px' }}>
                                            <div className="d-flex justify-content-end gap-1">
                                                <CTooltip content="View Quiz Details">
                                                    <CButton
                                                        className="action-icon-btn text-info"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(quiz)}
                                                    >
                                                        <Eye size={18} />
                                                    </CButton>
                                                </CTooltip>
                                                <CTooltip content="Delete Quiz">
                                                    <CButton
                                                        onClick={() => handleDelete(quiz._id)}
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

                    {!loading && filteredQuizzes.length > 0 && (
                        <CCardFooter className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                            <small className="text-body-secondary x-small">
                                Showing <span className="fw-bold text-body-emphasis">{(currentPage - 1) * entriesPerPage + (filteredQuizzes.length > 0 ? 1 : 0)}</span> to <span className="fw-bold text-body-emphasis">{Math.min(currentPage * entriesPerPage, filteredQuizzes.length)}</span> of <span className="fw-bold text-body-emphasis">{filteredQuizzes.length}</span> quizzes
                            </small>

                            {filteredQuizzes.length > entriesPerPage && (
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
                                            const totalPages = Math.ceil(filteredQuizzes.length / entriesPerPage)
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
                                        disabled={currentPage === Math.ceil(filteredQuizzes.length / entriesPerPage)}
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredQuizzes.length / entriesPerPage), p + 1))}
                                        className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none ms-1"
                                    >
                                        <ChevronRight size={14} />
                                    </CButton>
                                    <CButton
                                        variant="ghost"
                                        size="sm"
                                        disabled={currentPage === Math.ceil(filteredQuizzes.length / entriesPerPage)}
                                        onClick={() => setCurrentPage(Math.ceil(filteredQuizzes.length / entriesPerPage))}
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

            {/* View Quiz Details Modal - Minimal & Modern */}
            <CModal
                visible={viewModalVisible}
                onClose={() => setViewModalVisible(false)}
                size="lg"
                alignment="center"
                backdrop="static"
                className="modal-custom"
            >
                <CModalHeader className="border-0 pb-2">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-2 text-primary">
                        <Gamepad2 size={16} />
                    </div>
                    <CModalTitle className="fw-bold h6 mb-0">Quiz Details</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {selectedQuiz && (
                        <div>
                            {/* Quiz Info - Compact */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-bold mb-0">{selectedQuiz.name}</h6>
                                    <span className={`badge ${selectedQuiz.isPublished ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${selectedQuiz.isPublished ? 'text-success' : 'text-warning'} fw-semibold px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                                        {selectedQuiz.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="d-flex gap-3 text-body-secondary small">
                                    <div className="d-flex align-items-center gap-1">
                                        <Layers size={14} />
                                        <span>{selectedQuiz.rounds?.length || 0} Round{selectedQuiz.rounds?.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{selectedQuiz.createdAt ? format(new Date(selectedQuiz.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rounds List - Grouped by Parts or Linear */}
                            <div>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <small className="text-body-secondary fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        <Layers size={14} className="text-primary" />
                                        Rounds Structure ({selectedQuiz.rounds?.length || 0})
                                    </small>
                                </div>

                                {selectedQuiz.rounds && selectedQuiz.rounds.length > 0 ? (
                                    <div className="d-flex flex-column gap-4">
                                        {/* Group by Parts if quiz has parts */}
                                        {selectedQuiz.parts && selectedQuiz.parts.length > 0 ? (
                                            <>
                                                {selectedQuiz.parts.map((pName, pIdx) => {
                                                    const partRounds = selectedQuiz.rounds.filter(r => r.assignedParts?.includes(pName))
                                                    return (
                                                        <div key={pIdx} className="quiz-part-group">
                                                            <div className="d-flex align-items-center gap-2 mb-2 py-1 px-3 bg-primary bg-opacity-10 rounded-2 border border-primary border-opacity-25">
                                                                <Layers size={14} className="text-primary" />
                                                                <span className="fw-bold text-primary small">{pName}</span>
                                                                <span className="badge bg-primary text-white rounded-pill ms-auto x-small">
                                                                    {partRounds.length} Rounds
                                                                </span>
                                                            </div>
                                                            <div className="d-flex flex-column gap-2 ps-2">
                                                                {partRounds.length > 0 ? (
                                                                    partRounds.map((round, idx) => renderRoundItem(round, idx))
                                                                ) : (
                                                                    <div className="text-body-tertiary small fst-italic ps-3 py-2 border-start border-dash ms-2">No rounds in this part</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                                {/* Show Unassigned Rounds if parts exist */}
                                                {selectedQuiz.rounds.some(r => !r.assignedParts || r.assignedParts.length === 0) && (
                                                    <div className="quiz-part-group mt-2">
                                                        <div className="d-flex align-items-center gap-2 mb-2 py-1 px-3 bg-light rounded-2 border">
                                                            <Layers size={14} className="text-body-secondary" />
                                                            <span className="fw-bold text-body-secondary small">Unassigned Rounds</span>
                                                        </div>
                                                        <div className="d-flex flex-column gap-2 ps-2">
                                                            {selectedQuiz.rounds
                                                                .filter(r => !r.assignedParts || r.assignedParts.length === 0)
                                                                .map((round, idx) => renderRoundItem(round, idx))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="d-flex flex-column gap-2">
                                                {selectedQuiz.rounds.map((round, index) => renderRoundItem(round, index))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 bg-body-tertiary rounded-3 border border-dashed">
                                        <Layers size={32} className="text-body-secondary opacity-50 mb-2" />
                                        <p className="text-body-secondary mb-0 fw-medium">No rounds created for this quiz yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CModalBody>
            </CModal>
            <style>{`
                .x-small { font-size: 0.75rem; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .action-icon-btn { transition: all 0.2s ease; }
                .action-icon-btn:hover { background-color: rgba(var(--cui-primary-rgb), 0.1); transform: scale(1.1); }
            `}</style>
        </CRow>
    )
}

export default RoundsPreview
