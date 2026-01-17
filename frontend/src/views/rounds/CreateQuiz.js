import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormInput,
    CSpinner,
    CTableRow,
    CTableDataCell,
    CButton,
    CFormCheck,
    CTooltip,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import { quizzesAPI, roundsAPI } from '../../services/api'
import { Toast, Confirm } from '../../utils/sweetalert'
import {
    Plus,
    Save,
    Gamepad2,
    RefreshCw,
    Pencil,
    Trash2,
    Calendar,
    Folder,
    Type,
    PlusCircle,
    MinusCircle,
    Check,
    X,
    AlertTriangle,
    Layers,
    Clock
} from 'lucide-react'
import ActionButton from '../../components/ActionButton'
import Table from '../../components/Table'
import { format } from 'date-fns'

const CreateQuizCount = () => {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [quizName, setQuizName] = useState('')
    const [selectedQuizzes, setSelectedQuizzes] = useState([])
    const [viewModalVisible, setViewModalVisible] = useState(false)
    const [viewData, setViewData] = useState(null)
    const [editingRoundId, setEditingRoundId] = useState(null)
    const [editPoints, setEditPoints] = useState({
        positivePoints: '',
        negativePoints: '',
        timer_hours: '',
        timer_minutes: '',
        timer_seconds: ''
    })
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editingQuiz, setEditingQuiz] = useState(null)
    const [editQuizName, setEditQuizName] = useState('')
    const [quizParts, setQuizParts] = useState([])
    const [newPartName, setNewPartName] = useState('')

    const handleAddPart = () => {
        if (!newPartName.trim()) return
        if (quizParts.includes(newPartName.trim())) {
            Toast.fire({ icon: 'warning', title: 'Part already exists' })
            return
        }
        setQuizParts([...quizParts, newPartName.trim()])
        setNewPartName('')
    }

    const handleRemovePart = (index) => {
        setQuizParts(quizParts.filter((_, i) => i !== index))
    }

    useEffect(() => {
        fetchQuizzes()
    }, [])

    const fetchQuizzes = async (showLoading = true) => {
        if (showLoading) setFetching(true)
        try {
            const response = await quizzesAPI.getAll()
            setQuizzes(response.data || [])
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Failed to load quizzes' })
        } finally {
            if (showLoading) setFetching(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!quizName.trim()) {
            Toast.fire({ icon: 'warning', title: 'Quiz name is required' })
            return
        }

        // Check for duplicate quiz name (case-insensitive)
        const duplicate = quizzes.some(
            quiz => quiz.name.trim().toLowerCase() === quizName.trim().toLowerCase()
        )
        if (duplicate) {
            Toast.fire({
                icon: 'warning',
                title: 'Quiz name already exists',
                text: 'Please choose a different name for your quiz.'
            })
            return
        }

        setLoading(true)
        try {
            await quizzesAPI.create({ name: quizName })
            Toast.fire({ icon: 'success', title: 'Quiz created successfully!' })
            setQuizName('')
            fetchQuizzes()
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: error.response?.data?.message || 'Failed to create quiz',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedQuizzes(quizzes.map(q => q._id))
        } else {
            setSelectedQuizzes([])
        }
    }

    const handleSelectQuiz = (quizId) => {
        setSelectedQuizzes(prev =>
            prev.includes(quizId)
                ? prev.filter(id => id !== quizId)
                : [...prev, quizId]
        )
    }

    const handleBulkDelete = async () => {
        if (selectedQuizzes.length === 0) {
            Toast.fire({ icon: 'warning', title: 'No quizzes selected' })
            return
        }

        const result = await Confirm.fire({
            title: 'Delete Selected Quizzes?',
            text: `Are you sure you want to delete ${selectedQuizzes.length} quiz(zes)? This action cannot be undone.`,
            icon: 'warning',
        })

        if (result.isConfirmed) {
            try {
                await Promise.all(selectedQuizzes.map(id => quizzesAPI.delete(id)))
                Toast.fire({ icon: 'success', title: 'Quizzes deleted successfully!' })
                setSelectedQuizzes([])
                fetchQuizzes(false)
            } catch (error) {
                Toast.fire({ icon: 'error', title: 'Failed to delete some quizzes' })
            }
        }
    }

    const handleEdit = async (quiz) => {
        if (quiz.isPublished) {
            const result = await Confirm.fire({
                title: 'Quiz is Live!',
                text: 'This quiz is currently published. Any changes you make will be immediately visible to users. Are you sure you want to edit it?',
                icon: 'warning',
                confirmButtonText: 'Yes, proceed',
                cancelButtonText: 'No, cancel'
            })
            if (!result.isConfirmed) return
        }
        setEditingQuiz(quiz)
        setEditQuizName(quiz.name)
        setQuizParts(quiz.parts || [])
        setViewData(quiz)
        setEditModalVisible(true)
    }

    const handleUpdateQuiz = async () => {
        if (!editQuizName.trim()) {
            Toast.fire({ icon: 'warning', title: 'Quiz name is required' })
            return
        }

        // Check for duplicate quiz name (case-insensitive), excluding the current quiz
        const duplicate = quizzes.some(
            quiz => quiz._id !== editingQuiz._id &&
                quiz.name.trim().toLowerCase() === editQuizName.trim().toLowerCase()
        )
        if (duplicate) {
            Toast.fire({
                icon: 'warning',
                title: 'Quiz name already exists',
                text: 'Please choose a different name for your quiz.'
            })
            return
        }

        try {
            await quizzesAPI.update(editingQuiz._id, {
                name: editQuizName,
                parts: quizParts
            })
            Toast.fire({ icon: 'success', title: 'Quiz updated successfully!' })
            setEditModalVisible(false)
            setEditingQuiz(null)
            setEditQuizName('')
            setQuizParts([])
            fetchQuizzes(false)
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: error.response?.data?.message || 'Failed to update quiz',
            })
        }
    }

    const handleEditPoints = (round) => {
        setEditingRoundId(round._id)
        setEditPoints({
            positivePoints: round.positivePoints ?? 0,
            negativePoints: round.negativePoints ?? 0,
            timer_hours: (round.timer?.hours || 0).toString().padStart(2, '0'),
            timer_minutes: (round.timer?.minutes || 0).toString().padStart(2, '0'),
            timer_seconds: (round.timer?.seconds || 0).toString().padStart(2, '0')
        })
    }

    const handleSavePoints = async (roundId) => {
        // Validate points
        if (Number(editPoints.negativePoints) > Number(editPoints.positivePoints)) {
            Toast.fire({
                icon: 'warning',
                title: 'Invalid scoring rules',
                text: 'Negative points cannot exceed positive points'
            })
            return
        }

        try {
            const timer = {
                hours: parseInt(editPoints.timer_hours) || 0,
                minutes: parseInt(editPoints.timer_minutes) || 0,
                seconds: parseInt(editPoints.timer_seconds) || 0
            }

            await roundsAPI.update(roundId, {
                positivePoints: Number(editPoints.positivePoints),
                negativePoints: Number(editPoints.negativePoints),
                timer: timer
            })
            Toast.fire({ icon: 'success', title: 'Round updated successfully!' })
            setEditingRoundId(null)

            // Update viewData locally
            const updatedRounds = viewData.rounds.map(r =>
                r._id === roundId
                    ? {
                        ...r,
                        positivePoints: Number(editPoints.positivePoints),
                        negativePoints: Number(editPoints.negativePoints),
                        timer: timer
                    }
                    : r
            )
            setViewData({ ...viewData, rounds: updatedRounds })
            fetchQuizzes(false)
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Failed to update round' })
        }
    }

    const handleCancelEdit = () => {
        setEditingRoundId(null)
        setEditPoints({
            positivePoints: '',
            negativePoints: '',
            timer_hours: '',
            timer_minutes: '',
            timer_seconds: ''
        })
    }

    const handleRemoveSet = async (roundId, setId) => {
        const result = await Confirm.fire({
            title: 'Remove Set?',
            text: "Remove this set from the round?",
            icon: 'warning'
        })
        if (result.isConfirmed) {
            try {
                const round = viewData.rounds.find(r => r._id === roundId)
                if (!round) return

                const currentSetIds = round.sets.map(s => typeof s === 'object' ? s._id : s)
                const newSetIds = currentSetIds.filter(id => id !== setId)

                // Use selectedSets to match backend schema
                await roundsAPI.update(roundId, { selectedSets: newSetIds })

                Toast.fire({ icon: 'success', title: 'Set removed' })

                const updatedRounds = viewData.rounds.map(r => {
                    if (r._id === roundId) {
                        return { ...r, sets: r.sets.filter(s => (typeof s === 'object' ? s._id : s) !== setId) }
                    }
                    return r
                })
                setViewData({ ...viewData, rounds: updatedRounds })
                fetchQuizzes(false)
            } catch (e) {
                Toast.fire({ icon: 'error', title: 'Failed to remove set' })
            }
        }
    }

    const handleDeleteRound = async (roundId) => {
        const result = await Confirm.fire({
            title: 'Delete Round?',
            text: "This round will be removed permanently from this quiz.",
            icon: 'warning',
            confirmButtonText: 'Yes, Delete',
        })

        if (!result.isConfirmed) return

        try {
            await roundsAPI.delete(roundId)

            // Update viewData to remove the deleted round
            const updatedRounds = viewData.rounds.filter(r => r._id !== roundId)
            setViewData({ ...viewData, rounds: updatedRounds })

            Toast.fire({ icon: 'success', title: 'Round deleted successfully' })
            fetchQuizzes(false)
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Failed to delete round' })
        }
    }

    const handleDelete = async (id) => {
        const result = await Confirm.fire({
            title: 'Delete Quiz?',
            text: "This will also delete ALL rounds inside this quiz!",
            icon: 'warning',
        })

        if (result.isConfirmed) {
            try {
                await quizzesAPI.delete(id)
                Toast.fire({ icon: 'success', title: 'Quiz deleted' })
                fetchQuizzes(false)
            } catch (error) {
                Toast.fire({ icon: 'error', title: 'Delete failed' })
            }
        }
    }

    const renderRoundItem = (round) => {
        const isEditing = editingRoundId === round._id;

        return (
            <div key={round._id} className="p-3 bg-body-tertiary rounded-3 border-start border-primary border-4 shadow-sm mb-3 transition-all hover-shadow-sm">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2">
                            <div className="p-1 bg-primary bg-opacity-10 text-primary rounded">
                                <Type size={12} />
                            </div>
                            <span className="fw-bold text-body-emphasis small">{round.name}</span>
                        </div>
                        {/* Assigned Parts Display */}
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            {round.assignedParts && round.assignedParts.length > 0 ? (
                                round.assignedParts.map((p, idx) => (
                                    <span key={idx} className="x-small text-primary fw-bold d-flex align-items-center gap-1 bg-primary bg-opacity-10 px-2 py-0.5 rounded-pill">
                                        <Layers size={10} />
                                        {p.toUpperCase()}
                                    </span>
                                ))
                            ) : (
                                <span className="x-small text-body-tertiary fst-italic">No parts assigned</span>
                            )}
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-body-secondary text-body-secondary rounded-pill fw-bold x-small border">
                            {round.sets?.length || 0} SETS
                        </span>
                        {!isEditing ? (
                            <>
                                <Pencil
                                    size={14}
                                    className="text-primary cursor-pointer icon-hover-bold opacity-50"
                                    onClick={() => handleEditPoints(round)}
                                />
                                <Trash2
                                    size={14}
                                    className="text-danger cursor-pointer icon-hover-bold opacity-50"
                                    onClick={() => handleDeleteRound(round._id)}
                                />
                            </>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <Check
                                    size={16}
                                    className="text-success cursor-pointer"
                                    onClick={() => handleSavePoints(round._id)}
                                />
                                <X
                                    size={16}
                                    className="text-danger cursor-pointer"
                                    onClick={handleCancelEdit}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 overflow-hidden">
                    {isEditing ? (
                        <div className="d-flex flex-wrap align-items-end gap-3 p-2 bg-body rounded border border-primary border-opacity-10">
                            <div className="d-flex flex-column gap-1">
                                <label className="x-small fw-bold text-success text-uppercase">Correct</label>
                                <CFormInput
                                    size="sm"
                                    type="text"
                                    style={{ width: '60px' }}
                                    className="bg-success bg-opacity-10 border-0 fw-bold text-success text-center"
                                    value={editPoints.positivePoints}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '')
                                        setEditPoints({ ...editPoints, positivePoints: val })
                                    }}
                                />
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <label className="x-small fw-bold text-danger text-uppercase">Wrong</label>
                                <CFormInput
                                    size="sm"
                                    type="text"
                                    style={{ width: '60px' }}
                                    className="bg-danger bg-opacity-10 border-0 fw-bold text-danger text-center"
                                    value={editPoints.negativePoints}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '')
                                        setEditPoints({ ...editPoints, negativePoints: val })
                                    }}
                                />
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <label className="x-small fw-bold text-info text-uppercase">Timer (HH:MM:SS)</label>
                                <div className="d-flex align-items-center gap-1">
                                    <CFormInput
                                        size="sm"
                                        type="text"
                                        placeholder="HH"
                                        style={{ width: '45px' }}
                                        className="bg-info bg-opacity-10 border-0 fw-bold text-info text-center px-1"
                                        value={editPoints.timer_hours}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(-2)
                                            setEditPoints({ ...editPoints, timer_hours: val })
                                        }}
                                    />
                                    <span className="fw-bold text-info">:</span>
                                    <CFormInput
                                        size="sm"
                                        type="text"
                                        placeholder="MM"
                                        style={{ width: '45px' }}
                                        className="bg-info bg-opacity-10 border-0 fw-bold text-info text-center px-1"
                                        value={editPoints.timer_minutes}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(-2)
                                            setEditPoints({ ...editPoints, timer_minutes: val })
                                        }}
                                    />
                                    <span className="fw-bold text-info">:</span>
                                    <CFormInput
                                        size="sm"
                                        type="text"
                                        placeholder="SS"
                                        style={{ width: '45px' }}
                                        className="bg-info bg-opacity-10 border-0 fw-bold text-info text-center px-1"
                                        value={editPoints.timer_seconds}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(-2)
                                            setEditPoints({ ...editPoints, timer_seconds: val })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-1 text-success fw-bold x-small">
                                    <PlusCircle size={12} /> {round.positivePoints ?? 0}
                                </div>
                                <div className="d-flex align-items-center gap-1 text-danger fw-bold x-small">
                                    <MinusCircle size={12} /> {round.negativePoints ?? 0}
                                </div>
                                <div className="d-flex align-items-center gap-1 text-info fw-bold x-small border-start ps-2">
                                    <Clock size={12} />
                                    {round.timer && (round.timer.hours > 0 || round.timer.minutes > 0 || round.timer.seconds > 0) ? (
                                        `${round.timer.hours.toString().padStart(2, '0')}:${round.timer.minutes.toString().padStart(2, '0')}:${round.timer.seconds.toString().padStart(2, '0')}`
                                    ) : (
                                        "Unlimited"
                                    )}
                                </div>
                            </div>
                            <div className="d-flex flex-wrap gap-1 justify-content-end overflow-hidden" style={{ maxWidth: '60%' }}>
                                {round.sets?.slice(0, 3).map((set, sIdx) => (
                                    <span key={sIdx} className="badge bg-body-secondary text-body-secondary fw-medium x-small text-truncate" style={{ maxWidth: '80px' }}>
                                        {typeof set === 'object' ? set.name : 'Set'}
                                    </span>
                                ))}
                                {round.sets?.length > 3 && (
                                    <span className="badge bg-body-secondary text-body-secondary fw-medium x-small">+{round.sets.length - 3}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <>
            <CRow className="g-4">
                {/* Left Side: Creation Form */}
                <CCol lg={4}>
                    <CCard className="shadow-sm border-0 rounded-2">
                        <CCardHeader className="bg-transparent border-0 p-4">
                            <h5 className="fw-bold mb-1">Add New Quiz</h5>
                            <div className="text-body-secondary small">Create a new quiz container</div>
                        </CCardHeader>
                        <CCardBody className="p-4">
                            <CForm onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <CFormLabel className="fw-semibold text-body-secondary small text-uppercase mb-2">
                                        Quiz Name
                                    </CFormLabel>
                                    <CFormInput
                                        placeholder="e.g. Science Bowl Level 1"
                                        value={quizName}
                                        onChange={(e) => setQuizName(e.target.value)}
                                        className="py-2 bg-body-tertiary border-0 focus-ring shadow-sm fw-medium"
                                        required
                                    />
                                </div>

                                <ActionButton
                                    onClick={handleSubmit}
                                    loading={loading}
                                    disabled={!quizName.trim()}
                                    icon={Plus}
                                    className="py-2 fw-bold"
                                    style={{ borderRadius: '10px' }}
                                >
                                    Create Quiz
                                </ActionButton>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol >

                {/* Right Side: List of Quizzes */}
                < CCol lg={8} >
                    <CCard className="shadow-sm border-0 rounded-2" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold mb-1">All Quizzes</h5>
                                <div className="text-body-secondary small">Manage your existing quiz containers</div>
                            </div>
                            <div className="d-flex gap-2">
                                {selectedQuizzes.length > 0 && (
                                    <CButton
                                        color="danger"
                                        variant="ghost"
                                        size="sm"
                                        className="d-flex align-items-center gap-2 px-3 fw-bold border-0 bg-danger bg-opacity-10 text-danger hover-bg-danger-opacity"
                                        style={{ height: '38px', borderRadius: '8px' }}
                                        onClick={handleBulkDelete}
                                    >
                                        <Trash2 size={16} />
                                        Delete Selected ({selectedQuizzes.length})
                                    </CButton>
                                )}
                                <CButton
                                    color="primary"
                                    size="sm"
                                    className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 border-0 shadow-sm"
                                    onClick={fetchQuizzes}
                                    disabled={fetching}
                                >
                                    <RefreshCw size={16} className={fetching ? 'spin' : ''} />
                                    Refresh
                                </CButton>
                            </div>
                        </CCardHeader>
                        <CCardBody className="p-4 flex-grow-1 overflow-hidden d-flex flex-column">
                            <Table
                                columns={[
                                    {
                                        label: (
                                            <div className="d-flex align-items-center" style={{ gap: '5px' }}>
                                                <CFormCheck
                                                    id="selectAll"
                                                    onChange={handleSelectAll}
                                                    checked={selectedQuizzes.length === quizzes.length && quizzes.length > 0}
                                                    className="mb-0"
                                                />
                                                <span className="mb-0">#</span>
                                            </div>
                                        ),
                                        style: { width: '80px' }
                                    },
                                    { label: 'QUIZ NAME' },
                                    { label: 'STRUCTURE', style: { width: '160px' } },
                                    { label: 'STATUS', style: { width: '110px' } },
                                    { label: 'CREATED AT', style: { width: '180px' } },
                                    { label: 'ACTIONS', className: 'text-end', style: { width: '140px' } }
                                ]}
                            >
                                {fetching && quizzes.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan="6" className="text-center py-5 allow-wrap">
                                            <CSpinner color="primary" size="sm" className="me-2" />
                                            <span className="text-body-secondary">Fetching data...</span>
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : quizzes.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan="6" className="text-center py-5 allow-wrap">
                                            <div className="text-body-secondary opacity-50 mb-2">
                                                <Gamepad2 size={48} strokeWidth={1} />
                                            </div>
                                            <div className="fw-bold text-body-secondary">No quizzes found</div>
                                            <div className="small text-body-secondary">Start by creating your first quiz container</div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    quizzes.map((quiz, index) => (
                                        <CTableRow key={quiz._id}>
                                            <CTableDataCell>
                                                <div className="d-flex align-items-center" style={{ gap: '5px' }}>
                                                    <CFormCheck
                                                        id={`check-${quiz._id}`}
                                                        checked={selectedQuizzes.includes(quiz._id)}
                                                        onChange={() => handleSelectQuiz(quiz._id)}
                                                        className="mb-0"
                                                    />
                                                    <span className="text-body-secondary fw-semibold mb-0">
                                                        {index + 1}
                                                    </span>
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
                                            <CTableDataCell>
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
                                            <CTableDataCell className="text-end">
                                                <div className="d-flex justify-content-end gap-1">
                                                    <CButton
                                                        className="action-icon-btn"
                                                        style={{ color: '#ffc107' }}
                                                        onClick={() => handleEdit(quiz)}
                                                        title="Edit Quiz"
                                                    >
                                                        <Pencil size={17} />
                                                    </CButton>
                                                    <CTooltip content="Delete Quiz">
                                                        <CButton
                                                            className="action-icon-btn text-danger"
                                                            onClick={() => handleDelete(quiz._id)}
                                                        >
                                                            <Trash2 size={17} />
                                                        </CButton>
                                                    </CTooltip>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                )}
                            </Table>
                        </CCardBody>
                    </CCard>
                </CCol >
            </CRow >

            <CModal
                visible={editModalVisible}
                onClose={() => {
                    setEditModalVisible(false)
                    setEditingQuiz(null)
                    setEditQuizName('')
                    handleCancelEdit()
                }}
                alignment="center"
                size="lg"
                backdrop="static"
                portal={true}
            >
                <CModalHeader className="border-0 pb-0 bg-transparent">
                    <CModalTitle className="fw-bold fs-5 d-flex align-items-center gap-2">
                        Edit Quiz
                        {viewData && (
                            <span className={`badge rounded-pill x-small fw-bold ${viewData.isPublished ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning bg-opacity-10 text-warning border border-warning'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                {viewData.isPublished ? 'LIVE' : 'DRAFT'}
                            </span>
                        )}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4 bg-transparent">
                    <div className="mb-4">
                        <CFormLabel className="fw-bold text-body-secondary x-small text-uppercase mb-2">Quiz Name</CFormLabel>
                        <CFormInput
                            placeholder="Enter quiz name"
                            value={editQuizName}
                            onChange={(e) => setEditQuizName(e.target.value)}
                            className="py-2 bg-body-secondary border-0 focus-ring shadow-sm fw-bold"
                            style={{ fontSize: '13px' }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <CFormLabel className="fw-bold text-body-secondary x-small text-uppercase mb-2 d-flex justify-content-between align-items-center">
                            <span>Quiz Parts</span>
                            <span className="x-small text-body-tertiary fw-light">Optional groupings for rounds</span>
                        </CFormLabel>
                        <div className="d-flex gap-2 mb-2">
                            <CFormInput
                                placeholder="e.g. Part 1, Part 2..."
                                value={newPartName}
                                onChange={(e) => setNewPartName(e.target.value)}
                                className="py-2 bg-body-secondary border-0 focus-ring shadow-sm"
                                style={{ fontSize: '13px' }}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPart())}
                            />
                            <CButton
                                color="primary"
                                className="px-3 rounded-2 text-white border-0 shadow-sm"
                                onClick={handleAddPart}
                                disabled={!newPartName.trim()}
                            >
                                <Plus size={18} />
                            </CButton>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {quizParts.map((part, index) => (
                                <div key={index} className="badge bg-body-secondary text-body-emphasis border p-2 d-flex align-items-center gap-2 rounded-2">
                                    <Layers size={14} className="text-primary opacity-75" />
                                    <span>{part}</span>
                                    <X
                                        size={14}
                                        className="text-danger cursor-pointer hover-opacity"
                                        onClick={() => handleRemovePart(index)}
                                    />
                                </div>
                            ))}
                            {quizParts.length === 0 && (
                                <div className="small text-body-tertiary fst-italic py-1">No parts defined. All rounds will be global.</div>
                            )}
                        </div>
                    </div>

                    <div className="border-top pt-3">
                        <h6 className="fw-bold mb-3 text-body-emphasis d-flex align-items-center justify-content-between">
                            <span>Rounds in this Quiz</span>
                            <span className="badge bg-secondary bg-opacity-10 text-body-secondary rounded-pill fw-medium" style={{ fontSize: '0.75rem' }}>
                                {viewData?.rounds?.length || 0} Total
                            </span>
                        </h6>
                        <div className="custom-scrollbar" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            {viewData?.rounds?.length > 0 ? (
                                <div className="d-flex flex-column gap-1">
                                    {viewData.rounds.map((round) => renderRoundItem(round))}
                                </div>
                            ) : (
                                <div className="text-center py-5 border rounded-2 bg-body-tertiary bg-opacity-25">
                                    <div className="bg-body-tertiary rounded-circle p-3 d-inline-flex mb-2">
                                        <Gamepad2 size={24} className="text-body-secondary opacity-50" />
                                    </div>
                                    <h6 className="text-body-secondary small fw-bold">NO ROUNDS FOUND</h6>
                                    <div className="x-small text-body-tertiary">Create rounds in the Round Manager to see them here</div>
                                </div>
                            )}
                        </div>
                    </div>
                </CModalBody>
                <CModalFooter className="border-0 pt-0 pb-4 bg-transparent d-flex justify-content-end gap-2">
                    <ActionButton
                        variant="secondary"
                        onClick={() => {
                            setEditModalVisible(false)
                            setEditingQuiz(null)
                            setEditQuizName('')
                            handleCancelEdit()
                        }}
                        fullWidth={false}
                        className="px-4"
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={handleUpdateQuiz}
                        disabled={!editQuizName.trim()}
                        fullWidth={false}
                        className="px-4"
                        icon={Save}
                    >
                        Save Changes
                    </ActionButton>
                </CModalFooter>
            </CModal>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .icon-bold-hover { transition: stroke-width 0.2s ease; }
                .icon-bold-hover:hover { stroke-width: 3px; }

                .hover-bg-subtle:hover { background-color: var(--cui-tertiary-bg); }
                .group-item:hover .text-danger { opacity: 1 !important; }

                /* Custom Modal Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--cui-secondary-bg); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--cui-secondary-text); }
                
                .hover-bg-primary-opacity:hover { background-color: rgba(94, 114, 228, 0.2) !important; }
                .hover-opacity:hover { opacity: 0.7; transition: opacity 0.2s ease; }
                
                .cursor-pointer { cursor: pointer; }
                .icon-hover-bold { transition: all 0.2s ease; }
                .icon-hover-bold:hover { stroke-width: 2.5px; opacity: 0.8; }
            `}</style>
        </>
    )
}

export default CreateQuizCount
