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
    CInputGroup,
    CSpinner,
    CButton,
    CFormCheck,
    CTooltip,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
} from '@coreui/react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { setsAPI, roundsAPI, quizzesAPI } from '../../services/api'
import { Toast, Confirm } from '../../utils/sweetalert'
import {
    Plus,
    Save,
    Trophy,
    FileText,
    Target,
    Send,
    Layout,
    Type,
    Folder,
    Info,
    ArrowLeft,
    Gamepad2,
    ChevronDown,
    PlusCircle,
    MinusCircle,
    CheckCircle,
    X,
    Layers,
    Trash2,
    Sparkles,
    Clock,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../../components/ActionButton'

const CreateRounds = () => {
    const navigate = useNavigate()
    const [sets, setSets] = useState([])
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Modal State for New Quiz
    const [showQuizModal, setShowQuizModal] = useState(false)
    const [newQuizName, setNewQuizName] = useState('')

    // Rounds state for dropdown
    const [allRounds, setAllRounds] = useState([])
    const [roundMode, setRoundMode] = useState(() => {
        return localStorage.getItem('quiz_round_mode') || 'new'
    })
    const [selectedExistingRound, setSelectedExistingRound] = useState(() => {
        const saved = localStorage.getItem('quiz_selected_round')
        return saved ? JSON.parse(saved) : null
    })
    const [activePartIndex, setActivePartIndex] = useState(() => {
        return parseInt(localStorage.getItem('quiz_active_part_index')) || 0
    })
    // Create Part Modal State
    const [showCreatePartModal, setShowCreatePartModal] = useState(false)
    const [newPartName, setNewPartName] = useState('')
    const [partsDropdownVisible, setPartsDropdownVisible] = useState(false)
    const [partsDropdownKey, setPartsDropdownKey] = useState(0)
    const [generatingDescription, setGeneratingDescription] = useState(false)

    // Form State
    // Form State with Persistence
    const [roundData, setRoundData] = useState(() => {
        const saved = localStorage.getItem('quiz_create_round_data')
        return saved ? JSON.parse(saved) : {
            name: '',
            description: '',
            quizId: '',
            selectedSets: [],
            isPublished: true, // Default to true as quiz controls visibility
            positivePoints: '',
            negativePoints: '',
            hasParts: false,
            parts: [], // Keep for backward compat or internal split if needed
            assignedParts: [], // New: assignment to Quiz level parts
            enableParts: false, // New: toggle for parts assignment
            timer_hours: '',
            timer_minutes: '',
            timer_seconds: ''
        }
    })

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('quiz_create_round_data', JSON.stringify(roundData))
    }, [roundData])

    useEffect(() => {
        localStorage.setItem('quiz_round_mode', roundMode)
    }, [roundMode])

    useEffect(() => {
        if (selectedExistingRound) {
            localStorage.setItem('quiz_selected_round', JSON.stringify(selectedExistingRound))
        } else {
            localStorage.removeItem('quiz_selected_round')
        }
    }, [selectedExistingRound])

    useEffect(() => {
        localStorage.setItem('quiz_active_part_index', activePartIndex.toString())
    }, [activePartIndex])

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const [setsRes, quizzesRes, roundsRes] = await Promise.all([
                setsAPI.getAll(),
                quizzesAPI.getAll(),
                roundsAPI.getAll()
            ])
            setSets(setsRes.data || [])
            setQuizzes(quizzesRes.data || [])

            // Process rounds, deduplicate sets, and include quiz information
            const roundsWithQuiz = (roundsRes.data || []).map(round => {
                const quiz = (quizzesRes.data || []).find(q =>
                    q.rounds && q.rounds.some(r => r._id === round._id || r === round._id)
                )

                // Sanitize sets: Deduplicate and normalize to IDs
                const rawSets = round.selectedSets || round.sets || []
                const uniqueSets = [...new Set(rawSets.map(s => typeof s === 'object' ? s._id : s))]

                return {
                    ...round,
                    selectedSets: uniqueSets, // Standardize to this key
                    sets: uniqueSets,         // Keep for compatibility
                    quizName: quiz ? quiz.name : 'Unknown Quiz',
                    quizId: quiz ? quiz._id : null
                }
            })
            setAllRounds(roundsWithQuiz)
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Failed to load data' })
        } finally {
            setInitialLoading(false)
        }
    }

    const handleGenerateDescription = async () => {
        if (!roundData.name.trim()) {
            Toast.fire({
                icon: 'warning',
                title: 'Please enter a round name first'
            })
            return
        }

        setGeneratingDescription(true)
        // Add visual indicator to the toolbar button
        const aiButton = document.querySelector('.ql-ai')
        if (aiButton) aiButton.classList.add('generating')

        try {
            const response = await roundsAPI.generateDescription(roundData.name)
            if (response.data.success) {
                setRoundData(prev => ({
                    ...prev,
                    description: response.data.description
                }))
                Toast.fire({
                    icon: 'success',
                    title: 'Description generated!'
                })
            }
        } catch (error) {
            console.error('Error generating description:', error)
            Toast.fire({
                icon: 'error',
                title: 'Failed to generate',
                text: error.message
            })
        } finally {
            setGeneratingDescription(false)
            if (aiButton) aiButton.classList.remove('generating')
        }
    }

    const handleClearDescription = () => {
        setRoundData(prev => ({ ...prev, description: '' }))
    }

    const handleCreateQuiz = async () => {
        if (!newQuizName.trim()) return
        try {
            const response = await quizzesAPI.create({ name: newQuizName })
            await fetchInitialData() // Refresh list
            setRoundData(prev => ({ ...prev, quizId: response.data._id }))
            setShowQuizModal(false)
            setNewQuizName('')
            Toast.fire({ icon: 'success', title: 'Quiz created and selected!' })
        } catch (error) {
            Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Failed to create quiz' })
        }
    }

    const handleToggleQuizPublish = async () => {
        if (!selectedQuiz) return
        try {
            const newStatus = !selectedQuiz.isPublished
            await quizzesAPI.update(selectedQuiz._id, { isPublished: newStatus })
            await fetchInitialData() // Refresh state
            Toast.fire({
                icon: 'success',
                title: `Quiz ${newStatus ? 'Published' : 'set to Draft'}`
            })
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: error.response?.data?.message || 'Failed to update quiz status'
            })
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Real-time validation for negative points
        if (name === 'negativePoints' && roundData.positivePoints !== '') {
            const negValue = Math.abs(Number(value))
            const posValue = Number(roundData.positivePoints)
            if (negValue > posValue) {
                Toast.fire({
                    icon: 'warning',
                    title: 'Invalid Points',
                    text: 'Wrong answer points cannot exceed correct answer points'
                })
                return
            }
        }

        setRoundData((prev) => ({ ...prev, [name]: value }))
    }

    const toggleAssignedPart = (partName) => {
        setRoundData(prev => {
            const currentParts = prev.assignedParts || []
            const isAssigned = currentParts.includes(partName)
            return {
                ...prev,
                assignedParts: isAssigned
                    ? currentParts.filter(p => p !== partName)
                    : [...currentParts, partName]
            }
        })
    }

    const handleCreatePart = async () => {
        const selectedQuiz = quizzes.find(q => q._id === roundData.quizId)
        if (!selectedQuiz) {
            Toast.fire({ icon: 'warning', title: 'Please select a quiz first' })
            return
        }

        if (!newPartName.trim()) {
            Toast.fire({ icon: 'warning', title: 'Part name is required' })
            return
        }

        // Check for duplicate part name
        if (selectedQuiz.parts && selectedQuiz.parts.includes(newPartName.trim())) {
            Toast.fire({ icon: 'warning', title: 'Part name already exists' })
            return
        }

        try {
            const updatedParts = [...(selectedQuiz.parts || []), newPartName.trim()]
            await quizzesAPI.update(selectedQuiz._id, {
                name: selectedQuiz.name,
                parts: updatedParts
            })

            // Update quizzes list
            setQuizzes(prev => prev.map(q =>
                q._id === selectedQuiz._id
                    ? { ...q, parts: updatedParts }
                    : q
            ))

            // Automatically select the new part
            const createdPartName = newPartName.trim()
            setRoundData(prev => ({
                ...prev,
                assignedParts: [...(prev.assignedParts || []), createdPartName]
            }))

            Toast.fire({ icon: 'success', title: 'Part created and selected successfully' })
            setShowCreatePartModal(false)
            setNewPartName('')
        } catch (error) {
            console.error('Error creating part:', error)
            Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Failed to create part' })
        }
    }

    const handleDescriptionChange = (content) => {
        setRoundData((prev) => ({ ...prev, description: content }))
    }

    const handlePartNameChange = (index, value) => {
        const newParts = [...roundData.parts]
        newParts[index].name = value
        setRoundData(prev => ({ ...prev, parts: newParts }))
    }

    const addPart = () => {
        setRoundData(prev => ({
            ...prev,
            parts: [...prev.parts, { id: Date.now(), name: `Part ${prev.parts.length + 1}`, sets: [] }]
        }))
        setActivePartIndex(roundData.parts.length) // Switch to new part
    }

    const removePart = (index) => {
        if (roundData.parts.length <= 1) return // Prevent deleting last part if mandatory
        const newParts = roundData.parts.filter((_, i) => i !== index)
        setRoundData(prev => ({ ...prev, parts: newParts }))
        if (activePartIndex >= index && activePartIndex > 0) {
            setActivePartIndex(activePartIndex - 1)
        }
    }

    const toggleSetSelection = (setId) => {
        if (roundData.hasParts) {
            // Multi-part logic
            setRoundData((prev) => {
                const newParts = [...prev.parts]
                const activePart = newParts[activePartIndex]
                if (!activePart) return prev

                // Ensure sets array exists
                if (!activePart.sets) activePart.sets = []

                const isSelected = activePart.sets.includes(setId)
                if (isSelected) {
                    activePart.sets = activePart.sets.filter(id => id !== setId)
                } else {
                    activePart.sets = [...activePart.sets, setId]
                }

                // Update the main selectedSets for backward compatibility/union view
                const allSelected = newParts.flatMap(p => p.sets || [])
                return { ...prev, parts: newParts, selectedSets: [...new Set(allSelected)] }
            })
        } else {
            // Original logic
            setRoundData((prev) => {
                const currentSets = prev.selectedSets || []
                const isSelected = currentSets.includes(setId)
                return {
                    ...prev,
                    selectedSets: isSelected
                        ? currentSets.filter((id) => id !== setId)
                        : [...new Set([...currentSets, setId])]
                }
            })
        }
    }

    const togglePartsMode = (enable) => {
        setRoundData(prev => {
            if (enable) {
                // Determine initial parts
                let initialParts = []
                if (prev.selectedSets.length > 0) {
                    // Move existing sets to Part 1
                    initialParts = [{ id: Date.now(), name: 'Part 1', sets: [...prev.selectedSets] }]
                } else {
                    // Create empty Part 1
                    initialParts = [{ id: Date.now(), name: 'Part 1', sets: [] }]
                }
                return { ...prev, hasParts: true, parts: initialParts }
            } else {
                // Flatten sets from parts back to main list
                const allSets = [...new Set(prev.parts.flatMap(p => p.sets || []))]
                return { ...prev, hasParts: false, parts: [], selectedSets: allSets }
            }
        })
        setActivePartIndex(0)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!roundData.quizId) {
            Toast.fire({ icon: 'warning', title: 'Please select or create a Quiz' })
            return
        }
        if (!roundData.name.trim()) {
            Toast.fire({ icon: 'warning', title: 'Round name is required' })
            return
        }
        if (roundData.enableParts && (!roundData.assignedParts || roundData.assignedParts.length === 0)) {
            Toast.fire({ icon: 'warning', title: 'Please select at least one part for this round' })
            return
        }
        if (roundData.hasParts) {
            if (roundData.parts.length === 0) {
                Toast.fire({ icon: 'warning', title: 'Please add at least one part' })
                return
            }
            // Optional: Check if at least one set is selected across all parts?
            const totalSets = roundData.parts.flatMap(p => p.sets).length
            if (totalSets === 0) {
                Toast.fire({ icon: 'warning', title: 'Please assign sets to your parts' })
                return
            }
        } else {
            if (roundData.selectedSets.length === 0) {
                Toast.fire({ icon: 'warning', title: 'Please select at least one set' })
                return
            }
        }
        if (roundData.positivePoints === '' || roundData.negativePoints === '') {
            Toast.fire({ icon: 'warning', title: 'Please define scoring rules (points)' })
            return
        }
        if (Number(roundData.negativePoints) > Number(roundData.positivePoints)) {
            Toast.fire({
                icon: 'warning',
                title: 'Invalid scoring rules',
                text: 'Negative points cannot exceed positive points'
            })
            return
        }

        setLoading(true)
        try {
            const payload = {
                ...roundData,
                quiz: roundData.quizId,
                timer: {
                    hours: parseInt(roundData.timer_hours) || 0,
                    minutes: parseInt(roundData.timer_minutes) || 0,
                    seconds: parseInt(roundData.timer_seconds) || 0
                }
            }

            if (roundMode === 'existing' && selectedExistingRound) {
                // Update existing round - strictly use the user's current selection
                await roundsAPI.update(selectedExistingRound._id, payload)

                Toast.fire({
                    icon: 'success',
                    title: `Round "${roundData.name}" updated successfully!`,
                })
            } else {
                // Create new round
                await roundsAPI.create(payload)
                Toast.fire({
                    icon: 'success',
                    title: 'Round created successfully!',
                })
            }

            // Refresh data to update 'used sets' list
            await fetchInitialData()

            // Reset form but keep quizId for faster entry
            setRoundMode('new')
            setSelectedExistingRound(null)
            setRoundData(prev => ({
                name: '',
                description: '',
                quizId: prev.quizId, // Keep quizId for convenience
                selectedSets: [],
                isPublished: false,
                positivePoints: '',
                negativePoints: '',
                hasParts: false,
                parts: [],
                assignedParts: [],
                enableParts: false,
                timer_hours: '',
                timer_minutes: '',
                timer_seconds: ''
            }))

            // Clear specific persistence
            localStorage.removeItem('quiz_create_round_data')
            localStorage.removeItem('quiz_selected_round')
            localStorage.removeItem('quiz_active_part_index')
            localStorage.setItem('quiz_round_mode', 'new')

            Toast.fire({
                icon: 'success',
                title: 'Round created successfully!',
            })
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: error.response?.data?.message || `Failed to ${roundMode === 'existing' ? 'update' : 'create'} round`,
            })
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 215px)' }}>
                <CSpinner color="primary" />
            </div>
        )
    }

    const selectedQuiz = quizzes.find(q => q._id === roundData.quizId)
    const filteredRounds = allRounds.filter(r => r.quizId === roundData.quizId)

    // Improved usedSetIds calculation: uses the actual rounds data which is populated
    const usedSetIds = filteredRounds
        .filter(r => r._id !== selectedExistingRound?._id)
        .flatMap(r => {
            const rSets = r.selectedSets || r.sets || []
            return rSets.map(s => typeof s === 'object' ? s._id : s)
        })

    return (
        <div className="d-flex flex-column overflow-hidden" style={{ height: 'calc(100vh - 215px)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold">Design Quiz Rounds</h4>
                    <div className="small text-body-secondary mt-1">Group your rounds under a specific Quiz</div>
                </div>
                <div className="d-flex gap-2">
                    <div
                        className="d-flex align-items-center text-body-secondary hover-bold-effect"
                        onClick={() => navigate('/rounds')}
                        style={{ cursor: 'pointer' }}
                    >
                        <ArrowLeft size={18} className="me-2" />
                        <span>View All Rounds</span>
                    </div>
                </div>
            </div>

            <CCard className="shadow-sm border-0 rounded-3 flex-grow-1 overflow-hidden">
                <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                    <div className="d-flex align-items-center text-primary">
                        <Gamepad2 size={20} className="me-2" />
                        <h6 className="fw-bold mb-0">Build System</h6>
                    </div>
                </CCardHeader>

                <CCardBody className="p-4 h-100 d-flex flex-column overflow-hidden">
                    <CRow className="h-100 g-4">
                        {/* Left Column: Quiz & Round Details */}
                        <CCol lg={7} className="h-100 d-flex flex-column overflow-hidden">
                            <div className="h-100 d-flex flex-column pe-2">
                                {/* Static Top Section */}
                                <div className="flex-shrink-0">
                                    {/* Quiz Selection */}
                                    <div className="mb-4">
                                        <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                            <Target size={14} className="text-primary" />
                                            Target Quiz
                                        </CFormLabel>
                                        <div className="d-flex align-items-stretch gap-2">
                                            <div className="d-flex align-items-center bg-body-tertiary rounded-2 border flex-grow-1" style={{ height: '38px' }}>
                                                <CDropdown className="flex-grow-1 h-100">
                                                    <CDropdownToggle
                                                        variant="ghost"
                                                        className="w-100 h-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer text-start rounded-2"
                                                        caret={false}
                                                    >
                                                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                                                            <span className={`fw-bold text-truncate ${!roundData.quizId ? 'text-body-secondary' : 'text-body-emphasis'}`}>
                                                                {selectedQuiz ? selectedQuiz.name : 'Select or Create a Quiz...'}
                                                            </span>
                                                            {selectedQuiz && (
                                                                <span className={`badge rounded-pill x-small ${selectedQuiz.isPublished ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                    {selectedQuiz.isPublished ? 'Live' : 'Draft'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <ChevronDown size={14} className="text-body-secondary dropdown-chevron ms-2" />
                                                    </CDropdownToggle>
                                                    <CDropdownMenu className="dropdown-menu-custom dropdown-menu-strict-anim w-100 shadow-lg p-1" placement="bottom-start">
                                                        <CDropdownItem
                                                            onClick={() => setShowQuizModal(true)}
                                                            className="px-3 py-2 rounded-1 cursor-pointer fw-bold text-primary d-flex align-items-center border-bottom mb-1 bg-primary bg-opacity-10"
                                                        >
                                                            <Plus size={16} className="me-2" />
                                                            Create New Quiz
                                                        </CDropdownItem>
                                                        {quizzes.map((q) => (
                                                            <CDropdownItem
                                                                key={q._id}
                                                                onClick={() => {
                                                                    setRoundData({
                                                                        quizId: q._id,
                                                                        name: '',
                                                                        description: '',
                                                                        selectedSets: [],
                                                                        isPublished: false,
                                                                        positivePoints: '',
                                                                        negativePoints: '',
                                                                        hasParts: false,
                                                                        parts: [],
                                                                        assignedParts: [],
                                                                        enableParts: false,
                                                                        timer_hours: '',
                                                                        timer_minutes: '',
                                                                        timer_seconds: ''
                                                                    })
                                                                    setRoundMode('new')
                                                                    setSelectedExistingRound(null)
                                                                }}
                                                                className="px-3 py-2 rounded-1 cursor-pointer fw-medium d-flex align-items-center justify-content-between"
                                                                style={roundData.quizId === q._id ? { backgroundColor: '#5856d6', color: 'white' } : {}}
                                                            >
                                                                <span>{q.name}</span>
                                                                <span className={`badge rounded-pill x-small ${q.isPublished ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {q.isPublished ? 'Live' : 'Draft'}
                                                                </span>
                                                            </CDropdownItem>
                                                        ))}
                                                    </CDropdownMenu>
                                                </CDropdown>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                            <Type size={14} />
                                            ROUND CONFIGURATION
                                        </CFormLabel>
                                        <CRow className="g-3">
                                            {/* Round Parts Column */}
                                            <CCol sm={4}>
                                                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                                    <Layers size={14} className="text-primary" />
                                                    Round Parts
                                                </CFormLabel>
                                                <div className="d-flex align-items-center gap-2">
                                                    <CFormCheck
                                                        id="enableParts"
                                                        checked={roundData.enableParts}
                                                        onChange={(e) => {
                                                            setRoundData(prev => ({
                                                                ...prev,
                                                                enableParts: e.target.checked,
                                                                assignedParts: e.target.checked ? prev.assignedParts : []
                                                            }))
                                                        }}
                                                        className="me-0"
                                                        label=""
                                                        style={{ transform: 'scale(1.1)' }}
                                                    />
                                                    <div
                                                        className="d-flex align-items-center bg-body-tertiary rounded-2 border shadow-sm flex-grow-1"
                                                        style={{
                                                            height: '38px',
                                                            opacity: roundData.enableParts ? 1 : 0.5,
                                                            pointerEvents: roundData.enableParts ? 'auto' : 'none'
                                                        }}
                                                    >
                                                        <CDropdown
                                                            key={partsDropdownKey}
                                                            className="flex-grow-1 h-100"
                                                            autoClose="outside"
                                                        >
                                                            <CDropdownToggle
                                                                variant="ghost"
                                                                className="w-100 h-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer text-start rounded-2"
                                                                caret={false}
                                                                disabled={!roundData.enableParts || !selectedQuiz}
                                                                style={{
                                                                    fontSize: '13px',
                                                                    cursor: (!roundData.enableParts || !selectedQuiz) ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                <span className={`fw-bold text-truncate ${(!roundData.assignedParts || roundData.assignedParts.length === 0) ? 'text-body-secondary' : 'text-body-emphasis'}`}>
                                                                    {!roundData.enableParts
                                                                        ? 'Disabled'
                                                                        : !selectedQuiz
                                                                            ? 'Select quiz first'
                                                                            : roundData.assignedParts && roundData.assignedParts.length > 0
                                                                                ? roundData.assignedParts.length <= 2
                                                                                    ? roundData.assignedParts.join(', ')
                                                                                    : `${roundData.assignedParts.length} Parts Selected`
                                                                                : 'Select Parts...'}
                                                                </span>
                                                                <ChevronDown size={16} className="text-body-secondary opacity-50 dropdown-chevron ms-2" />
                                                            </CDropdownToggle>
                                                            <CDropdownMenu
                                                                className="dropdown-menu-custom dropdown-menu-strict-anim w-100 shadow-lg p-1"
                                                                placement="bottom-start"
                                                            >
                                                                <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                                                                    <CDropdownItem
                                                                        onClick={() => {
                                                                            setShowCreatePartModal(true)
                                                                            setPartsDropdownKey(k => k + 1)
                                                                        }}
                                                                        className="px-3 py-2 rounded-1 cursor-pointer fw-bold text-primary d-flex align-items-center"
                                                                    >
                                                                        <Plus size={16} className="me-2" />
                                                                        Create New Part
                                                                    </CDropdownItem>
                                                                    <div className="border-bottom my-1 mx-2"></div>
                                                                    <CDropdownItem
                                                                        disabled
                                                                        className="small text-body-secondary fw-bold text-uppercase px-3 py-2"
                                                                        style={{ fontSize: '0.75rem' }}
                                                                    >
                                                                        SELECT PARTS...
                                                                    </CDropdownItem>

                                                                    {selectedQuiz && selectedQuiz.parts && selectedQuiz.parts.length > 0 ? (
                                                                        selectedQuiz.parts.map((partName, index) => {
                                                                            const isAssigned = (roundData.assignedParts || []).includes(partName)
                                                                            return (
                                                                                <CDropdownItem
                                                                                    key={index}
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault()
                                                                                        e.stopPropagation()
                                                                                        toggleAssignedPart(partName)
                                                                                    }}
                                                                                    className={`px-3 py-2 rounded-2 cursor-pointer fw-medium d-flex align-items-center gap-3 mb-1 mx-1 transition-all ${isAssigned ? 'bg-primary bg-opacity-10 text-primary' : 'hover-bg-light-opacity'}`}
                                                                                >
                                                                                    <CFormCheck
                                                                                        id={`part-check-${index}`}
                                                                                        readOnly
                                                                                        checked={isAssigned}
                                                                                        className="m-0"
                                                                                        style={{ pointerEvents: 'none', transform: 'scale(1.1)' }}
                                                                                    />
                                                                                    <span className={isAssigned ? 'fw-bold' : ''}>{partName}</span>
                                                                                </CDropdownItem>
                                                                            )
                                                                        })
                                                                    ) : (
                                                                        <div className="text-center text-body-tertiary small py-4">
                                                                            {!selectedQuiz ? 'Select quiz first' : 'No parts available'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="p-2 border-top mt-1">
                                                                    <CButton
                                                                        color="primary"
                                                                        className="w-100 fw-bold py-2 rounded-2 text-white"
                                                                        style={{ fontSize: '12px' }}
                                                                        onClick={() => setPartsDropdownKey(k => k + 1)}
                                                                    >
                                                                        Done
                                                                    </CButton>
                                                                </div>
                                                            </CDropdownMenu>
                                                        </CDropdown>
                                                    </div>
                                                </div>

                                            </CCol>

                                            {/* Round Name Column */}
                                            <CCol sm={4}>
                                                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                                    <Type size={14} className="text-primary" />
                                                    Round Name
                                                </CFormLabel>
                                                <div className="d-flex align-items-center bg-body-tertiary rounded-2 border shadow-sm w-100" style={{ height: '38px' }}>
                                                    <CFormInput
                                                        placeholder="e.g. Round 1: Mental Math"
                                                        name="name"
                                                        value={roundData.name}
                                                        onChange={handleInputChange}
                                                        className="w-100 h-100 border-0 focus-ring shadow-none px-3 bg-transparent fw-bold"
                                                        style={{ fontSize: '13px' }}
                                                        required
                                                    />
                                                </div>
                                            </CCol>

                                            {/* Edit Round Column */}
                                            <CCol sm={4}>
                                                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                                    <Folder size={14} className="text-primary" />
                                                    Edit Round
                                                </CFormLabel>
                                                <div className="d-flex align-items-center bg-body-tertiary rounded-2 border shadow-sm w-100" style={{ height: '38px' }}>
                                                    <CDropdown className="flex-grow-1 h-100">
                                                        <CDropdownToggle
                                                            variant="ghost"
                                                            className="w-100 h-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer text-start rounded-2"
                                                            caret={false}
                                                            disabled={!roundData.quizId || filteredRounds.length === 0}
                                                            style={{
                                                                fontSize: '13px',
                                                                cursor: (!roundData.quizId || filteredRounds.length === 0) ? 'not-allowed' : 'pointer',
                                                                opacity: (!roundData.quizId || filteredRounds.length === 0) ? 0.65 : 1
                                                            }}
                                                        >
                                                            <span className={`fw-bold text-truncate ${!selectedExistingRound ? 'text-body-secondary' : 'text-body-emphasis'}`}>
                                                                {!roundData.quizId
                                                                    ? 'Select quiz first'
                                                                    : filteredRounds.length === 0
                                                                        ? 'No rounds'
                                                                        : selectedExistingRound
                                                                            ? (selectedExistingRound.hasParts && selectedExistingRound.parts?.[activePartIndex])
                                                                                ? `${selectedExistingRound.name} (${selectedExistingRound.parts[activePartIndex].name})`
                                                                                : selectedExistingRound.name
                                                                            : 'Select to edit...'}
                                                            </span>
                                                            <ChevronDown size={16} className="text-body-secondary opacity-50 dropdown-chevron ms-2" />
                                                        </CDropdownToggle>
                                                        <CDropdownMenu
                                                            className="dropdown-menu-custom dropdown-menu-strict-anim w-100 shadow-lg p-1"
                                                            placement="bottom-start"
                                                            style={{ maxHeight: '300px', overflowY: 'auto' }}
                                                        >
                                                            <CDropdownItem
                                                                disabled
                                                                className="small text-body-secondary fw-bold text-uppercase px-3 py-2"
                                                                style={{ fontSize: '0.75rem' }}
                                                            >
                                                                SELECT A ROUND...
                                                            </CDropdownItem>
                                                            <div className="border-bottom my-1"></div>
                                                            {filteredRounds.length === 0 ? (
                                                                <CDropdownItem disabled className="text-center text-body-tertiary small py-2">
                                                                    No rounds available
                                                                </CDropdownItem>
                                                            ) : (
                                                                filteredRounds.flatMap(round => {
                                                                    // If round has parts, show each part separately for direct access
                                                                    if (round.hasParts && round.parts && round.parts.length > 0) {
                                                                        return round.parts.map((part, partIndex) => (
                                                                            <CDropdownItem
                                                                                key={`${round._id}-part-${partIndex}`}
                                                                                onClick={async () => {
                                                                                    if (selectedExistingRound?._id === round._id && activePartIndex === partIndex) {
                                                                                        setRoundMode('new')
                                                                                        setSelectedExistingRound(null)
                                                                                        setRoundData(prev => ({
                                                                                            ...prev,
                                                                                            name: '',
                                                                                            description: '',
                                                                                            selectedSets: [],
                                                                                            positivePoints: '',
                                                                                            negativePoints: '',
                                                                                            enableParts: false,
                                                                                            assignedParts: []
                                                                                        }))
                                                                                        return
                                                                                    }

                                                                                    if (selectedQuiz?.isPublished) {
                                                                                        const result = await Confirm.fire({
                                                                                            title: 'Quiz is Live!',
                                                                                            text: 'This round belongs to a published quiz. Any changes will be visible immediately.',
                                                                                            icon: 'warning',
                                                                                            showCancelButton: true,
                                                                                            confirmButtonText: 'Yes, edit',
                                                                                            cancelButtonText: 'Cancel'
                                                                                        })
                                                                                        if (!result.isConfirmed) return
                                                                                    }

                                                                                    setRoundMode('existing')
                                                                                    setSelectedExistingRound(round)
                                                                                    const rawSets = round.selectedSets || round.sets || []
                                                                                    const normalizedSets = [...new Set(rawSets.map(s => typeof s === 'object' ? s._id : s))]

                                                                                    setRoundData(prev => ({
                                                                                        ...prev,
                                                                                        name: round.name,
                                                                                        quizId: round.quizId,
                                                                                        description: round.description || '',
                                                                                        positivePoints: round.positivePoints || '',
                                                                                        negativePoints: round.negativePoints || '',
                                                                                        selectedSets: normalizedSets,
                                                                                        hasParts: round.hasParts || false,
                                                                                        parts: round.parts || [],
                                                                                        assignedParts: round.assignedParts || [],
                                                                                        enableParts: (round.assignedParts && round.assignedParts.length > 0) || false,
                                                                                        timer_hours: (round.timer?.hours || 0).toString().padStart(2, '0'),
                                                                                        timer_minutes: (round.timer?.minutes || 0).toString().padStart(2, '0'),
                                                                                        timer_seconds: (round.timer?.seconds || 0).toString().padStart(2, '0')
                                                                                    }))
                                                                                    setActivePartIndex(partIndex)
                                                                                    Toast.fire({
                                                                                        icon: 'info',
                                                                                        title: `Editing: ${round.name} (${part.name})`
                                                                                    })
                                                                                }}
                                                                                className="px-3 py-2 rounded-1 cursor-pointer fw-bold mb-1"
                                                                                style={{
                                                                                    fontSize: '13px',
                                                                                    ...(selectedExistingRound?._id === round._id && activePartIndex === partIndex ? { backgroundColor: '#5856d6', color: 'white' } : {})
                                                                                }}
                                                                            >
                                                                                <div className="d-flex align-items-center justify-content-between w-100">
                                                                                    <div className="d-flex flex-column">
                                                                                        <div className="d-flex align-items-center gap-2">
                                                                                            <span>{round.name}</span>
                                                                                            <span className={`badge ${selectedExistingRound?._id === round._id && activePartIndex === partIndex ? 'bg-white text-primary' : 'bg-primary bg-opacity-10 text-primary'}`} style={{ fontSize: '9px' }}>
                                                                                                {part.name.toUpperCase()}
                                                                                            </span>
                                                                                        </div>
                                                                                        <small
                                                                                            className={`text-truncate d-block ${selectedExistingRound?._id === round._id && activePartIndex === partIndex ? 'text-white-50' : 'text-body-tertiary'}`}
                                                                                            style={{ fontSize: '11px', maxWidth: '180px' }}
                                                                                        >
                                                                                            {round.quizName}
                                                                                        </small>
                                                                                    </div>
                                                                                    <span className={`badge rounded-pill ${selectedExistingRound?._id === round._id && activePartIndex === partIndex ? 'bg-white text-primary' : 'bg-secondary bg-opacity-10 text-body-secondary'}`} style={{ fontSize: '10px' }}>
                                                                                        {(() => {
                                                                                            const count = (part.sets || []).length
                                                                                            return `${count} ${count === 1 ? 'Set' : 'Sets'}`
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                            </CDropdownItem>
                                                                        ))
                                                                    }

                                                                    // Single part/Standard Round
                                                                    return (
                                                                        <CDropdownItem
                                                                            key={round._id}
                                                                            onClick={async () => {
                                                                                if (selectedExistingRound?._id === round._id) {
                                                                                    setRoundMode('new')
                                                                                    setSelectedExistingRound(null)
                                                                                    setRoundData(prev => ({
                                                                                        ...prev,
                                                                                        name: '',
                                                                                        description: '',
                                                                                        selectedSets: [],
                                                                                        positivePoints: '',
                                                                                        negativePoints: '',
                                                                                        enableParts: false,
                                                                                        assignedParts: [],
                                                                                        timer_hours: '',
                                                                                        timer_minutes: '',
                                                                                        timer_seconds: ''
                                                                                    }))
                                                                                    return
                                                                                }

                                                                                if (selectedQuiz?.isPublished) {
                                                                                    const result = await Confirm.fire({
                                                                                        title: 'Quiz is Live!',
                                                                                        text: 'This round belongs to a published quiz. Any changes will be visible immediately.',
                                                                                        icon: 'warning',
                                                                                        showCancelButton: true,
                                                                                        confirmButtonText: 'Yes, edit',
                                                                                        cancelButtonText: 'Cancel'
                                                                                    })
                                                                                    if (!result.isConfirmed) return
                                                                                }

                                                                                setRoundMode('existing')
                                                                                setSelectedExistingRound(round)
                                                                                const rawSets = round.selectedSets || round.sets || []
                                                                                const normalizedSets = [...new Set(rawSets.map(s => typeof s === 'object' ? s._id : s))]

                                                                                setRoundData(prev => ({
                                                                                    ...prev,
                                                                                    name: round.name,
                                                                                    quizId: round.quizId,
                                                                                    description: round.description || '',
                                                                                    positivePoints: round.positivePoints || '',
                                                                                    negativePoints: round.negativePoints || '',
                                                                                    selectedSets: normalizedSets,
                                                                                    hasParts: round.hasParts || false,
                                                                                    parts: round.parts || [],
                                                                                    assignedParts: round.assignedParts || [],
                                                                                    enableParts: (round.assignedParts && round.assignedParts.length > 0) || false,
                                                                                    timer_hours: (round.timer?.hours || 0).toString().padStart(2, '0'),
                                                                                    timer_minutes: (round.timer?.minutes || 0).toString().padStart(2, '0'),
                                                                                    timer_seconds: (round.timer?.seconds || 0).toString().padStart(2, '0')
                                                                                }))
                                                                                setActivePartIndex(0)
                                                                                Toast.fire({
                                                                                    icon: 'info',
                                                                                    title: `Editing: ${round.name}`
                                                                                })
                                                                            }}
                                                                            className="px-3 py-2 rounded-1 cursor-pointer fw-bold mb-1"
                                                                            style={{
                                                                                fontSize: '13px',
                                                                                ...(selectedExistingRound?._id === round._id ? { backgroundColor: '#5856d6', color: 'white' } : {})
                                                                            }}
                                                                        >
                                                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                                                <div className="d-flex flex-column">
                                                                                    <span>{round.name}</span>
                                                                                    <small
                                                                                        className={`text-truncate d-block ${selectedExistingRound?._id === round._id ? 'text-white-50' : 'text-body-tertiary'}`}
                                                                                        style={{ fontSize: '11px', maxWidth: '180px' }}
                                                                                    >
                                                                                        {round.quizName}
                                                                                    </small>
                                                                                </div>
                                                                                <span className={`badge rounded-pill ${selectedExistingRound?._id === round._id ? 'bg-white text-primary' : 'bg-secondary bg-opacity-10 text-body-secondary'}`} style={{ fontSize: '10px' }}>
                                                                                    {(() => {
                                                                                        const targetData = (round.selectedSets && round.selectedSets.length > 0) ? round.selectedSets : (round.sets || [])
                                                                                        const count = [...new Set(targetData.map(s => typeof s === 'object' ? s._id : s))].length
                                                                                        return `${count} ${count === 1 ? 'Set' : 'Sets'}`
                                                                                    })()}
                                                                                </span>
                                                                            </div>
                                                                        </CDropdownItem>
                                                                    )
                                                                })
                                                            )}
                                                        </CDropdownMenu>
                                                    </CDropdown>
                                                </div>
                                            </CCol>
                                        </CRow>
                                    </div>

                                    {/* Points & Timer Configuration */}
                                    <div className="mb-4 flex-shrink-0">
                                        <CRow className="g-3">
                                            <CCol sm={4}>
                                                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                                    <PlusCircle size={14} className="text-success" />
                                                    Correct (+ Points)
                                                </CFormLabel>
                                                <CFormInput
                                                    type="text"
                                                    placeholder="5"
                                                    name="positivePoints"
                                                    value={roundData.positivePoints}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '')
                                                        handleInputChange({ target: { name: 'positivePoints', value: val } })
                                                    }}
                                                    className="answer-input-correct fw-bold"
                                                    required
                                                />
                                            </CCol>
                                            <CCol sm={4}>
                                                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                                    <MinusCircle size={14} className="text-danger" />
                                                    Wrong (- Points)
                                                </CFormLabel>
                                                <CFormInput
                                                    type="text"
                                                    placeholder="2"
                                                    name="negativePoints"
                                                    value={roundData.negativePoints}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '')
                                                        handleInputChange({ target: { name: 'negativePoints', value: val } })
                                                    }}
                                                    className="answer-input-wrong fw-bold"
                                                    required
                                                />
                                            </CCol>
                                            <CCol sm={4}>
                                                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2">
                                                    <Clock size={14} className="text-info" />
                                                    Round Timer
                                                </CFormLabel>
                                                <div className="d-flex align-items-center gap-1">
                                                    <div className="flex-grow-1">
                                                        <CFormInput
                                                            type="text"
                                                            name="timer_hours"
                                                            value={roundData.timer_hours}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(-2)
                                                                handleInputChange({ target: { name: 'timer_hours', value: val } })
                                                            }}
                                                            className="text-center fw-bold bg-body-secondary border-0"
                                                            placeholder="HH"
                                                        />
                                                    </div>
                                                    <span className="fw-bold">:</span>
                                                    <div className="flex-grow-1">
                                                        <CFormInput
                                                            type="text"
                                                            name="timer_minutes"
                                                            value={roundData.timer_minutes}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(-2)
                                                                handleInputChange({ target: { name: 'timer_minutes', value: val } })
                                                            }}
                                                            className="text-center fw-bold bg-body-secondary border-0"
                                                            placeholder="MM"
                                                        />
                                                    </div>
                                                    <span className="fw-bold">:</span>
                                                    <div className="flex-grow-1">
                                                        <CFormInput
                                                            type="text"
                                                            name="timer_seconds"
                                                            value={roundData.timer_seconds}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(-2)
                                                                handleInputChange({ target: { name: 'timer_seconds', value: val } })
                                                            }}
                                                            className="text-center fw-bold bg-body-secondary border-0"
                                                            placeholder="SS"
                                                        />
                                                    </div>
                                                </div>
                                            </CCol>
                                        </CRow>
                                    </div>
                                </div>
                                <div className="flex-grow-1" style={{ height: '250px', maxHeight: '250px', overflow: 'hidden' }}>
                                    <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-2 w-100">
                                        <FileText size={14} />
                                        Round Instructions
                                    </CFormLabel>
                                    <div className="round-instructions-editor-wrapper quill-minimal-container position-relative" style={{ height: 'calc(100% - 30px)' }}>
                                        {generatingDescription && (
                                            <div className="ai-generating-overlay">
                                                <div className="d-flex flex-column align-items-center gap-2">
                                                    <div className="ai-spin-sparkle">
                                                        <Sparkles size={32} className="text-primary" />
                                                    </div>
                                                    <span className="fw-bold text-primary">Crafting instructions...</span>
                                                    <span className="x-small text-body-secondary">Consulting AI for the best structure</span>
                                                </div>
                                            </div>
                                        )}
                                        <ReactQuill
                                            theme="snow"
                                            value={roundData.description}
                                            onChange={handleDescriptionChange}
                                            placeholder="Write round special rules here..."
                                            modules={{
                                                toolbar: {
                                                    container: [
                                                        [{ 'header': [1, 2, false] }],
                                                        ['bold', 'italic', 'underline'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['clean', 'ai', 'clear']
                                                    ],
                                                    handlers: {
                                                        'ai': handleGenerateDescription,
                                                        'clear': handleClearDescription
                                                    }
                                                },
                                            }}
                                            className="h-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CCol>

                        {/* Right Column: Sets & Save */}
                        <CCol lg={5} className="h-100 d-flex flex-column overflow-hidden">
                            <div className="h-100 d-flex flex-column bg-body-tertiary rounded-3 border p-3">
                                <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-3">
                                    <Layout size={14} />
                                    Assign Sets to Round
                                    <span className="badge bg-primary rounded-pill ms-auto">
                                        {roundData.selectedSets.length} selected
                                    </span>
                                </CFormLabel>

                                <div className="flex-grow-1 overflow-auto pe-1 mb-3">
                                    <div className="d-flex flex-column gap-2">
                                        {sets.map((set) => {
                                            const isUsed = usedSetIds.includes(set._id)

                                            // Determine selection based on mode
                                            let isSelected = roundData.selectedSets.includes(set._id)

                                            const isInsufficient = (set.questionCount || 0) < 5

                                            // A set is ONLY disabled for CLICK if:
                                            // 1. It is used in another round AND it's NOT selected in THIS round (can't select it)
                                            // 2. It has insufficient questions
                                            // We allow clicking if it IS selected, so the user can UNSELECT it even if it's "used" elsewhere
                                            const isDisabled = (isUsed && !isSelected) || isInsufficient

                                            const title = isUsed
                                                ? isSelected
                                                    ? "This set is also in another round. Click to remove from this round."
                                                    : "This set is already assigned to another round in this quiz"
                                                : isInsufficient
                                                    ? "Set must have at least 5 questions"
                                                    : isSelected ? "Click to unselect" : "Click to select"

                                            return (
                                                <div
                                                    key={set._id}
                                                    onClick={() => !isDisabled && toggleSetSelection(set._id)}
                                                    title={title}
                                                    className={`p-2 rounded-2 border transition-all d-flex align-items-center justify-content-between ${isDisabled
                                                        ? 'border-transparent bg-body-tertiary opacity-50 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'border-primary bg-primary bg-opacity-10 cursor-pointer'
                                                            : 'border-transparent bg-body hover-bg-opacity cursor-pointer'
                                                        }`}
                                                >
                                                    <div className="d-flex align-items-center overflow-hidden">
                                                        <div className={`p-2 rounded-2 me-2 ${isSelected ? 'bg-primary text-white' : 'bg-body-secondary text-body-secondary'}`}>
                                                            <Folder size={14} />
                                                        </div>
                                                        <div className="text-truncate">
                                                            <div className={`fw-bold small ${isSelected ? 'text-primary' : ''}`}>
                                                                {set.name}
                                                            </div>
                                                            <div className={`x-small ${isInsufficient ? 'text-danger fw-semibold' : 'text-body-secondary'}`}>
                                                                {set.questionCount || 0} Questions {isInsufficient ? '(Min 5)' : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CFormCheck
                                                        readOnly
                                                        checked={isSelected}
                                                        className="ms-2"
                                                        disabled={isDisabled}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="mt-auto border-top pt-3 d-flex gap-2">
                                    <CButton
                                        color="primary"
                                        className="text-white fw-bold py-2 w-50 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleSubmit}
                                        disabled={
                                            loading ||
                                            !roundData.quizId ||
                                            !roundData.name.trim() ||
                                            roundData.selectedSets.length === 0 ||
                                            roundData.positivePoints === '' ||
                                            roundData.negativePoints === ''
                                        }
                                        style={{ height: '42px' }}
                                    >
                                        {loading ? <CSpinner size="sm" variant="grow" aria-hidden="true" /> : <Save size={18} />}
                                        Save Round
                                    </CButton>

                                    <CButton
                                        color={selectedQuiz?.isPublished ? "danger" : "success"}
                                        className={`fw-bold py-2 w-50 d-flex align-items-center justify-content-center gap-2 ${selectedQuiz?.isPublished ? 'bg-danger text-white' : 'bg-success text-white'}`}
                                        onClick={handleToggleQuizPublish}
                                        disabled={!selectedQuiz || !selectedQuiz?.rounds?.length || loading}
                                        style={{ height: '42px' }}
                                    >
                                        <Send size={18} />
                                        {selectedQuiz?.isPublished ? 'Unpublish Quiz' : 'Publish Quiz'}
                                    </CButton>
                                </div>
                            </div>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* Create Quiz Modal */}
            <CModal
                visible={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                alignment="center"
                backdrop="static"
            >
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="fw-bold fs-5">Create New Quiz</CModalTitle>
                </CModalHeader>
                <CModalBody className="py-3">
                    <div className="mb-2">
                        <CFormLabel className="fw-semibold small text-body-secondary text-uppercase mb-2">Quiz Name</CFormLabel>
                        <CFormInput
                            value={newQuizName}
                            onChange={(e) => setNewQuizName(e.target.value)}
                            placeholder="e.g. Annual Tech Symposium 2026"
                            className="bg-body-secondary border-0 focus-ring shadow-sm py-2 px-3"
                            autoFocus
                        />
                    </div>
                </CModalBody>
                <CModalFooter className="border-0 pt-0 pb-3 d-flex justify-content-end gap-2">
                    <ActionButton
                        variant="secondary"
                        onClick={() => setShowQuizModal(false)}
                        fullWidth={false}
                        className="px-4"
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={handleCreateQuiz}
                        disabled={!newQuizName.trim()}
                        fullWidth={false}
                        className="px-4"
                    >
                        Create & Select
                    </ActionButton>
                </CModalFooter>
            </CModal>

            <style>{`
                .quill-minimal-container .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid var(--cui-border-color) !important;
                    background: var(--cui-body-tertiary-bg);
                    flex-shrink: 0;
                }
                .quill-minimal-container .ql-container {
                    border: none !important;
                    font-size: 0.9rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    height: 100% !important;
                }
                .quill-minimal-container .ql-editor {
                    flex: 1;
                    overflow-y: auto !important;
                    color: var(--cui-body-color);
                    min-height: 0;
                    height: 100% !important;
                }
                
                /* Grid layout for Round Instructions and Parts */
                .round-instructions-parts-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    height: 285px;
                    max-height: 285px;
                }
                
                .round-instructions-column,
                .round-parts-column {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 0;
                    overflow: hidden;
                }
                
                .round-instructions-editor-wrapper {
                    flex: 1;
                    border: 1px solid var(--cui-border-color);
                    border-radius: 0.375rem;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .round-instructions-editor-wrapper .quill {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .round-instructions-editor-wrapper .ql-container {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .round-instructions-editor-wrapper .ql-editor {
                    flex: 1;
                    overflow-y: auto !important;
                    min-height: 0;
                    height: 100%;
                }
                
                .round-instructions-editor-wrapper .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid var(--cui-border-color) !important;
                    background: var(--cui-body-tertiary-bg);
                }
                
                /* Fixed height for Round Instructions editor */
                .round-instructions-editor-fixed {
                    max-height: 100% !important;
                    height: 100% !important;
                    overflow: hidden !important;
                }
                .round-instructions-editor-fixed .ql-container {
                    max-height: 100% !important;
                    height: 100% !important;
                    overflow: hidden !important;
                    flex: 1 !important;
                }
                .round-instructions-editor-fixed .ql-editor {
                    max-height: 100% !important;
                    height: auto !important;
                    overflow-y: auto !important;
                    flex: 1 !important;
                }
                .round-instructions-editor-fixed .quill {
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                .quill-minimal-container .ql-editor.ql-blank::before {
                    color: var(--cui-body-secondary-color);
                    font-style: normal;
                    opacity: 0.5;
                }
                .quill-minimal-container .ql-snow .ql-stroke { stroke: var(--cui-body-color); }
                .quill-minimal-container .ql-snow .ql-fill { fill: var(--cui-body-color); }
                .quill-minimal-container .ql-snow .ql-picker { color: var(--cui-body-color); }
                .quill-minimal-container .ql-snow .ql-picker-options {
                    background-color: var(--cui-body-bg);
                    border-color: var(--cui-border-color);
                }
                .quill-minimal-container .ql-snow .ql-picker-item { color: var(--cui-body-color); }
                
                .x-small { font-size: 0.75rem; }
                .hover-bg-opacity:hover { background-color: var(--cui-body-secondary-bg) !important; }
                .transition-all { transition: all 0.2s ease-in-out; }
                
                .publish-switch-small .form-check-input {
                    width: 2.5rem;
                    height: 1.25rem;
                    cursor: pointer;
                }
                .publish-switch-small .form-check-input:checked {
                    background-color: #2eb85c;
                    border-color: #2eb85c;
                }
                .hover-bold-effect:hover {
                    font-weight: bold;
                    color: var(--cui-primary) !important;
                }
                .dropdown-menu-custom {
                    border: 1px solid var(--cui-border-color);
                    background-color: var(--cui-body-bg);
                    border-radius: 8px;
                }
                .hover-bg-light-opacity:hover {
                    background-color: rgba(0,0,0,0.05);
                }
                
                /* Answer Input Styling */
                .answer-input-correct {
                    background-color: rgba(46, 184, 92, 0.15) !important;
                    color: #2eb85c !important;
                    border: 1px solid rgba(46, 184, 92, 0.4) !important;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                }
                
                .answer-input-correct:focus {
                    background-color: rgba(46, 184, 92, 0.2) !important;
                    border-color: #2eb85c !important;
                    box-shadow: 0 0 0 0.25rem rgba(46, 184, 92, 0.25) !important;
                }
                
                .answer-input-correct::placeholder {
                    color: rgba(46, 184, 92, 0.6) !important;
                }
                
                .answer-input-wrong {
                    background-color: rgba(231, 76, 60, 0.15) !important;
                    color: #e74c3c !important;
                    border: 1px solid rgba(231, 76, 60, 0.4) !important;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                }
                
                .answer-input-wrong:focus {
                    background-color: rgba(231, 76, 60, 0.2) !important;
                    border-color: #e74c3c !important;
                    box-shadow: 0 0 0 0.25rem rgba(231, 76, 60, 0.25) !important;
                }
                
                .answer-input-wrong::placeholder {
                    color: rgba(231, 76, 60, 0.6) !important;
                }

                /* Custom Quill Buttons (AI & Clear) */
                .ql-ai, .ql-clear {
                    width: 28px !important;
                    height: 24px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 0 !important;
                    transition: all 0.2s ease !important;
                    background: none !important;
                    border: none !important;
                    cursor: pointer !important;
                }

                .ql-ai::before, .ql-clear::before {
                    content: '' !important;
                    display: block !important;
                    width: 18px !important;
                    height: 18px !important;
                    background-color: rgba(255, 255, 255, 0.85) !important;
                    mask-size: contain !important;
                    mask-repeat: no-repeat !important;
                    mask-position: center !important;
                    -webkit-mask-size: contain !important;
                    -webkit-mask-repeat: no-repeat !important;
                    -webkit-mask-position: center !important;
                    transition: background-color 0.2s ease !important;
                }

                /* AI Icon SVG */
                .ql-ai::before {
                    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>');
                    -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>');
                }

                /* Clear Icon SVG */
                .ql-clear::before {
                    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>');
                    -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>');
                }

                .ql-ai:hover::before, .ql-clear:hover::before {
                    background-color: #0d6efd !important;
                }

                .ql-ai.generating::before {
                    animation: ql-ai-spin 1s linear infinite;
                }
            `}</style>

            {/* Create Part Modal */}
            <CModal
                visible={showCreatePartModal}
                onClose={() => {
                    setShowCreatePartModal(false)
                    setNewPartName('')
                }}
                alignment="center"
                backdrop="static"
            >
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="fw-bold fs-5">Create New Part</CModalTitle>
                </CModalHeader>
                <CModalBody className="py-3">
                    <div className="mb-2">
                        <CFormLabel className="fw-semibold small text-body-secondary text-uppercase mb-2">Part Name</CFormLabel>
                        <CFormInput
                            value={newPartName}
                            onChange={(e) => setNewPartName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleCreatePart()
                                }
                            }}
                            placeholder="e.g. Part 1, Section A, Round 1..."
                            className="bg-body-secondary border-0 focus-ring shadow-sm py-2 px-3"
                            autoFocus
                        />
                    </div>
                    {(() => {
                        const selectedQuiz = quizzes.find(q => q._id === roundData.quizId)
                        return selectedQuiz && selectedQuiz.parts && selectedQuiz.parts.length > 0 && (
                            <div>
                                <small className="text-body-secondary fw-semibold d-block mb-2">Existing Parts:</small>
                                <div className="d-flex flex-wrap gap-2">
                                    {selectedQuiz.parts.map((part, idx) => (
                                        <span key={idx} className="badge bg-body-secondary text-body-emphasis border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                            {part}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    })()}
                </CModalBody>
                <CModalFooter className="border-0 pt-0 pb-3 d-flex justify-content-end gap-2">
                    <ActionButton
                        variant="secondary"
                        onClick={() => {
                            setShowCreatePartModal(false)
                            setNewPartName('')
                        }}
                        fullWidth={false}
                        className="px-4"
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={handleCreatePart}
                        disabled={!newPartName.trim()}
                        fullWidth={false}
                        className="px-4"
                    >
                        Create & Select
                    </ActionButton>
                </CModalFooter>
            </CModal>
        </div >
    )
}

export default CreateRounds
