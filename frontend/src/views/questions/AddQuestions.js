import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormTextarea,
    CInputGroup,
    CFormInput,
    CFormSelect,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CButton,
    CSpinner,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import { setsAPI, questionsAPI } from '../../services/api'
import { Toast } from '../../utils/sweetalert'
import { formatText } from '../../utils/formatText'
import { X, Plus, Save, Wand2, ArrowLeft, CheckCircle2, Layout, Type, ChevronDown, Folder, List, CheckCircle, Hash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TargetSetDropdown from '../../components/TargetSetDropdown'
import QuestionCountInput from '../../components/QuestionCountInput'
import ActionButton from '../../components/ActionButton'


const AddQuestions = () => {
    const navigate = useNavigate()
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Modal State
    const [showCreateSetModal, setShowCreateSetModal] = useState(false)
    const [newSetName, setNewSetName] = useState('')

    // Form State
    const [questionText, setQuestionText] = useState('')
    const [selectedSet, setSelectedSet] = useState('')
    const [options, setOptions] = useState(['', '', '', '']) // Start with 4 empty options
    const [correctAnswer, setCorrectAnswer] = useState('')

    // AI Mode State
    const [showAiMode, setShowAiMode] = useState(() => localStorage.getItem('quiz_app_ai_mode') === 'true')
    const [aiPrompt, setAiPrompt] = useState('')
    const [aiQuestionsCount, setAiQuestionsCount] = useState(1)
    const [generatedQuestions, setGeneratedQuestions] = useState([])
    const [originalAiCount, setOriginalAiCount] = useState(0)

    // Persist AI Mode
    useEffect(() => {
        localStorage.setItem('quiz_app_ai_mode', showAiMode)
    }, [showAiMode])

    // Fetch sets on mount
    useEffect(() => {
        fetchSets()
    }, [])

    const fetchSets = async () => {
        try {
            const response = await setsAPI.getAll()
            const sortedSets = (response.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            setSets(sortedSets)
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Failed to load sets',
            })
        } finally {
            setInitialLoading(false)
        }
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const clearOption = (index) => {
        const newOptions = [...options]
        newOptions[index] = ''
        setOptions(newOptions)
    }

    const handleCreateSet = async () => {
        if (!newSetName.trim()) return

        // Check for duplicate name (case-insensitive)
        const duplicate = sets.some(s => s.name.trim().toLowerCase() === newSetName.trim().toLowerCase())
        if (duplicate) {
            Toast.fire({
                icon: 'warning',
                title: 'Set name already exists',
                text: 'Please choose a different name.'
            })
            return
        }

        try {
            await setsAPI.create({ name: newSetName, description: 'Created via Add Question' })

            // Refresh sets from server to ensure we have valid data
            const setsRes = await setsAPI.getAll()
            const allSets = setsRes.data || []
            const sortedSets = allSets.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

            setSets(sortedSets)

            // Find and select the newly created set by name
            const newSet = allSets.find(s => s.name === newSetName)
            if (newSet) {
                setSelectedSet(newSet._id)
            }

            // Reset and Close
            setNewSetName('')
            setShowCreateSetModal(false)

            Toast.fire({
                icon: 'success',
                title: 'Set created and selected!'
            })
        } catch (error) {
            console.error('Error creating set:', error)
            Toast.fire({
                icon: 'error',
                title: 'Failed to create set'
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedSet) {
            Toast.fire({ icon: 'warning', title: 'Please select a set' })
            return
        }
        if (!questionText.trim()) {
            Toast.fire({ icon: 'warning', title: 'Please enter a question' })
            return
        }
        const validOptions = options.filter(opt => opt.trim() !== '')
        if (validOptions.length < 2) {
            Toast.fire({ icon: 'warning', title: 'Please provide at least 2 valid options' })
            return
        }
        if (!correctAnswer) {
            Toast.fire({ icon: 'warning', title: 'Please select a correct answer' })
            return
        }

        setLoading(true)
        try {
            await questionsAPI.create({
                question: questionText,
                options: validOptions,
                correctAnswer,
                set: selectedSet
            })

            Toast.fire({
                icon: 'success',
                title: 'Question added successfully!',
            })

            // Reset form but keep set selected for faster entry
            setQuestionText('')
            setOptions(['', '', '', ''])
            setCorrectAnswer('')

        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: error.response?.data?.message || 'Failed to add question',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim() || !selectedSet) {
            Toast.fire({ icon: 'warning', title: 'Please select a set and enter a topic' })
            return
        }

        if (aiQuestionsCount > 10) {
            Toast.fire({
                icon: 'warning',
                title: 'Limit Exceeded',
                text: 'You can generate up to 10 questions at a time.'
            })
            setAiQuestionsCount(10)
            return
        }

        setLoading(true)
        setGeneratedQuestions([])
        try {
            const response = await questionsAPI.generateAI({
                keywords: aiPrompt,
                setId: selectedSet,
                numQuestions: aiQuestionsCount
            })

            if (response.data.success && response.data.questions.length > 0) {
                const questionsWithId = response.data.questions.map((q, i) => ({
                    ...q,
                    originalIndex: i + 1
                }))
                setGeneratedQuestions(questionsWithId)
                setOriginalAiCount(questionsWithId.length)
                Toast.fire({
                    icon: 'success',
                    title: `Generated ${response.data.questions.length} question(s)!`,
                    text: 'Review and save them below.'
                })
            } else {
                Toast.fire({
                    icon: 'warning',
                    title: 'No questions generated',
                    text: 'Try different keywords or increase the count.'
                })
            }
        } catch (error) {
            console.error('AI Generation Error:', error)
            Toast.fire({
                icon: 'error',
                title: 'Generation failed',
                text: error.response?.data?.message || 'Please check your API configuration.'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSaveGenerated = async () => {
        if (generatedQuestions.length === 0) return

        setLoading(true)
        try {
            // Remove tracking index before saving
            const sanitizedQuestions = generatedQuestions.map(({ originalIndex, ...q }) => q)
            await questionsAPI.saveGenerated(sanitizedQuestions)
            Toast.fire({
                icon: 'success',
                title: `Saved ${generatedQuestions.length} question(s)!`
            })
            // Reset AI form
            setGeneratedQuestions([])
            setAiPrompt('')
            setAiQuestionsCount(1)
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Failed to save questions',
                text: error.response?.data?.message || 'Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    const removeGeneratedQuestion = (index) => {
        const newQuestions = generatedQuestions.filter((_, i) => i !== index)
        setGeneratedQuestions(newQuestions)
    }

    if (initialLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 120px)' }}>
                <CSpinner color="primary" />
            </div>
        )
    }

    return (
        <div className="d-flex flex-column overflow-hidden" style={{ height: 'calc(100vh - 215px)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold">Add New Question</h4>
                    <div className="small text-body-secondary">Create a new question for your quizzes</div>
                </div>
                <div className="d-flex gap-2">
                    <div
                        className="d-flex align-items-center text-body-secondary hover-bold-effect"
                        onClick={() => navigate('/questions')}
                    >
                        <ArrowLeft size={18} className="me-2" />
                        <span>Back to List</span>
                    </div>
                </div>
            </div>

            <CCard className="shadow-sm border-0 rounded-3 flex-grow-1 overflow-hidden">
                <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                    <div className="d-flex align-items-center text-primary">
                        <Layout size={20} className="me-2" />
                        <h6 className="fw-bold mb-0">Question Editor</h6>
                    </div>
                    <div
                        className="d-flex align-items-center text-info hover-bold-effect"
                        onClick={() => setShowAiMode(!showAiMode)}
                    >
                        <Wand2 size={16} className="me-2" />
                        <span>{showAiMode ? 'Manual Mode' : 'Switch to AI Mode'}</span>
                    </div>
                </CCardHeader>

                <CCardBody className="p-4 h-100 d-flex flex-column" style={{ minHeight: 0, overflow: 'visible' }}>
                    {showAiMode ? (
                        <>
                            <div className="text-center pb-3 flex-shrink-0">
                                <h5 className="mb-1">AI Question Generator</h5>
                                <p className="text-body-secondary small mb-0">Enter a topic and specific instructions. AI will handle the rest.</p>
                            </div>
                            <div className="flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
                                <CRow className="h-100 g-4">
                                    {/* Left Column: Inputs */}
                                    <CCol lg={6} className="h-100" style={{ minHeight: 0, overflow: 'visible' }}>
                                        <div className="h-100 d-flex flex-column bg-body rounded-3 border">
                                            <div className="p-3 border-bottom bg-body-tertiary flex-shrink-0">
                                                <h6 className="fw-bold mb-0 d-flex align-items-center">
                                                    <Hash size={18} className="me-2 text-primary" />
                                                    Generation Settings
                                                </h6>
                                            </div>
                                            <div className="flex-grow-1 p-3 d-flex flex-column" style={{ minHeight: 0, overflow: 'visible' }}>
                                                <div className="flex-shrink-0">
                                                    <CRow className="mb-3 g-3">
                                                        <CCol xs={7}>
                                                            <TargetSetDropdown
                                                                selectedSet={selectedSet}
                                                                sets={sets}
                                                                onSetSelect={setSelectedSet}
                                                                onCreateNew={() => setShowCreateSetModal(true)}
                                                            />
                                                        </CCol>

                                                        <CCol xs={5}>
                                                            <QuestionCountInput
                                                                value={aiQuestionsCount}
                                                                onChange={(val) => {
                                                                    if (val > 10) {
                                                                        Toast.fire({
                                                                            icon: 'warning',
                                                                            title: 'Limit reached',
                                                                            text: 'Maximum 10 questions allowed'
                                                                        })
                                                                        setAiQuestionsCount(10)
                                                                    } else {
                                                                        setAiQuestionsCount(val)
                                                                    }
                                                                }}
                                                                max={50} // Allow higher input to trigger toast
                                                            />
                                                        </CCol>
                                                    </CRow>
                                                </div>

                                                <div className="flex-grow-1 d-flex flex-column overflow-hidden mt-2" style={{ minHeight: 0 }}>
                                                    <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-1 mb-2">
                                                        <Type size={14} />
                                                        Topic / Prompt Instructions
                                                    </CFormLabel>
                                                    <CFormTextarea
                                                        placeholder="e.g. Generate 5 hard Java questions about multi-threading..."
                                                        className="border bg-body-tertiary focus-ring p-3 flex-grow-1"
                                                        value={aiPrompt}
                                                        onChange={(e) => setAiPrompt(e.target.value)}
                                                        style={{ resize: 'none', overflowY: 'auto' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-3 border-top flex-shrink-0">
                                                <ActionButton
                                                    onClick={handleAiGenerate}
                                                    disabled={!aiPrompt.trim() || !selectedSet || !aiQuestionsCount || aiQuestionsCount < 1}
                                                    loading={loading}
                                                    showSpinner={false}
                                                    icon={Wand2}
                                                >
                                                    Generate Questions
                                                </ActionButton>
                                            </div>
                                        </div>
                                    </CCol>

                                    {/* Right Column: Generated Preview */}
                                    <CCol lg={6} className="h-100 overflow-hidden" style={{ minHeight: 0 }}>
                                        <div className="h-100 d-flex flex-column bg-body rounded-3 border">
                                            <div className="p-3 border-bottom bg-body-tertiary flex-shrink-0">
                                                <h6 className="fw-bold mb-0 d-flex align-items-center">
                                                    <Layout size={18} className="me-2 text-primary" />
                                                    Generated Preview
                                                </h6>
                                            </div>
                                            <div className="flex-grow-1 d-flex flex-column overflow-hidden bg-body-tertiary">
                                                {loading ? (
                                                    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center text-body-secondary p-4">
                                                        <CSpinner color="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                                                        <h6 className="fw-bold mb-1 text-primary">AI is Generating...</h6>
                                                        <p className="small mb-0 opacity-75">Putting together your questions based on the prompt.</p>
                                                    </div>
                                                ) : generatedQuestions.length > 0 ? (
                                                    <>
                                                        <div className="p-3 border-bottom bg-body-secondary flex-shrink-0">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <h6 className="fw-bold text-success d-flex align-items-center mb-0">
                                                                    <CheckCircle2 size={18} className="me-2" />
                                                                    Generated {originalAiCount} Question{originalAiCount !== 1 ? 's' : ''}
                                                                </h6>
                                                                {originalAiCount - generatedQuestions.length > 0 && (
                                                                    <span className="badge bg-danger bg-opacity-10 text-danger fw-bold">
                                                                        Removed: {originalAiCount - generatedQuestions.length}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="small text-body-secondary mb-0">Review and save below</p>
                                                        </div>
                                                        <div className="flex-grow-1 p-3 overflow-auto">
                                                            {generatedQuestions.map((q, idx) => (
                                                                <div key={idx} className="mb-3 p-3 bg-body rounded-2 border position-relative">
                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                        <div className="fw-bold text-primary small">Q{q.originalIndex}</div>
                                                                        <div
                                                                            className="text-danger cursor-pointer opacity-75 hover-opacity-100 transition-all p-1"
                                                                            onClick={() => removeGeneratedQuestion(idx)}
                                                                            role="button"
                                                                            title="Remove Question"
                                                                        >
                                                                            <X size={16} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-2 fw-medium pe-4" dangerouslySetInnerHTML={{ __html: formatText(q.question) }} />
                                                                    <div className="small">
                                                                        {q.options.map((opt, optIdx) => (
                                                                            <div
                                                                                key={optIdx}
                                                                                className={`p-2 mb-1 rounded-1 ${opt.trim() === q.correctAnswer.trim() ? 'bg-success bg-opacity-10 text-success fw-bold' : 'bg-body-secondary'}`}
                                                                            >
                                                                                <span className="badge bg-body-secondary text-body-emphasis me-2">{String.fromCharCode(65 + optIdx)}</span>
                                                                                <span dangerouslySetInnerHTML={{ __html: formatText(opt) }} />
                                                                                {opt.trim() === q.correctAnswer.trim() && <CheckCircle2 size={14} className="ms-2" />}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="p-3 border-top bg-body d-flex gap-2 flex-shrink-0">
                                                            <ActionButton
                                                                onClick={handleSaveGenerated}
                                                                loading={loading}
                                                                icon={Save}
                                                                padding="py-2"
                                                            >
                                                                Save All
                                                            </ActionButton>
                                                            <ActionButton
                                                                onClick={handleAiGenerate}
                                                                loading={loading}
                                                                variant="secondary"
                                                                icon={Wand2}
                                                                fullWidth={false}
                                                                className="px-4"
                                                                padding="py-2"
                                                            >
                                                                Regenerate
                                                            </ActionButton>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center text-body-secondary p-4">
                                                        <div className="bg-body rounded-circle p-3 shadow-sm mb-3">
                                                            <Layout size={32} className="text-body-secondary opacity-25" />
                                                        </div>
                                                        <h6 className="fw-bold mb-1">Result Empty</h6>
                                                        <p className="small mb-0 opacity-75">Generated questions will appear here for review.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </div>

                        </>
                    ) : (
                        <>
                            <div className="text-center pb-3 flex-shrink-0">
                                <h5 className="mb-1">Manual Question Editor</h5>
                                <p className="text-body-secondary small mb-0">Create a new question.</p>
                            </div>
                            <div className="flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
                                <CRow className="h-100 g-4">
                                    {/* Left Column: Question Input */}
                                    <CCol lg={6} className="h-100" style={{ minHeight: 0, overflow: 'visible' }}>
                                        <div className="h-100 d-flex flex-column bg-body rounded-3 border">
                                            <div className="p-3 border-bottom bg-body-tertiary flex-shrink-0">
                                                <h6 className="fw-bold mb-0 d-flex align-items-center">
                                                    <Type size={18} className="me-2 text-primary" />
                                                    Question Input
                                                </h6>
                                            </div>
                                            <div className="flex-grow-1 p-3 d-flex flex-column">
                                                <div className="mb-2">
                                                    <TargetSetDropdown
                                                        selectedSet={selectedSet}
                                                        sets={sets}
                                                        onSetSelect={setSelectedSet}
                                                        onCreateNew={() => setShowCreateSetModal(true)}
                                                    />
                                                </div>

                                                <div className="flex-grow-1 d-flex flex-column overflow-hidden" style={{ minHeight: 0 }}>
                                                    <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-1">
                                                        <Type size={14} />
                                                        Question Text
                                                    </CFormLabel>
                                                    <CFormTextarea
                                                        value={questionText}
                                                        onChange={(e) => setQuestionText(e.target.value)}
                                                        placeholder="Type your question here..."
                                                        className="border bg-body-tertiary focus-ring p-3 flex-grow-1"
                                                        style={{ resize: 'none', overflowY: 'auto' }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CCol>

                                    {/* Right Column: Answer Options */}
                                    <CCol lg={6} className="h-100 overflow-hidden" style={{ minHeight: 0 }}>
                                        <div className="h-100 d-flex flex-column bg-body rounded-3 border">
                                            <div className="p-3 border-bottom bg-body-tertiary flex-shrink-0">
                                                <h6 className="fw-bold mb-0 d-flex align-items-center">
                                                    <List size={18} className="me-2 text-primary" />
                                                    Answer Options
                                                </h6>
                                            </div>
                                            <div className="flex-grow-1 p-3 d-flex flex-column overflow-hidden">
                                                <div className="mb-2">
                                                    <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-1">
                                                        <List size={14} />
                                                        Answer Options
                                                    </CFormLabel>
                                                    <div className="d-flex flex-column gap-2">
                                                        {options.map((option, index) => (
                                                            <CInputGroup key={index} className="shadow-sm rounded-2 overflow-hidden bg-body-secondary">
                                                                <div className="input-group-text bg-transparent border-0 text-body-secondary fw-bold px-3">
                                                                    {String.fromCharCode(65 + index)}
                                                                </div>
                                                                <CFormInput
                                                                    value={option}
                                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                                    placeholder={`Option ${index + 1}`}
                                                                    className="border-0 bg-transparent focus-ring"
                                                                    required
                                                                />
                                                                {option && (
                                                                    <div
                                                                        onClick={() => clearOption(index)}
                                                                        className="px-3 d-flex align-items-center cursor-pointer delete-option-btn text-danger"
                                                                        role="button"
                                                                        title="Clear Option"
                                                                    >
                                                                        <X size={16} />
                                                                    </div>
                                                                )}
                                                            </CInputGroup>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mb-2">
                                                    <CFormLabel className="fw-semibold small text-body-secondary text-uppercase d-flex align-items-center gap-2 mb-1">
                                                        <CheckCircle size={14} />
                                                        Correct Answer
                                                    </CFormLabel>
                                                    <div className="d-flex align-items-center bg-body-tertiary rounded-2 border" style={{ height: '42px' }}>
                                                        <CDropdown className="flex-grow-1 h-100">
                                                            <CDropdownToggle
                                                                variant="ghost"
                                                                className="w-100 h-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer text-start"
                                                                caret={false}
                                                                disabled={options.every(opt => !opt.trim())}
                                                            >
                                                                <span className={`fw-bold ${!correctAnswer ? 'text-body-secondary' : 'text-body-emphasis'}`}>
                                                                    {correctAnswer ? <span dangerouslySetInnerHTML={{ __html: formatText(correctAnswer) }} /> : 'Select the correct option...'}
                                                                </span>
                                                                <ChevronDown size={16} className="text-body-secondary dropdown-chevron" />
                                                            </CDropdownToggle>
                                                            <CDropdownMenu
                                                                className="dropdown-menu-custom dropdown-menu-strict-anim w-100 shadow-lg p-1"
                                                                portal={true}
                                                                placement="bottom-start"
                                                                style={{ zIndex: 9999 }}
                                                            >
                                                                {options.map((option, index) => (
                                                                    option.trim() && (
                                                                        <CDropdownItem
                                                                            key={index}
                                                                            onClick={() => setCorrectAnswer(option)}
                                                                            className="px-3 py-2 rounded-1 cursor-pointer fw-medium d-flex align-items-center mb-1"
                                                                            style={correctAnswer === option ? { backgroundColor: '#5856d6', color: 'white' } : {}}
                                                                        >
                                                                            <span className={`badge me-2 ${correctAnswer === option ? 'bg-white text-primary' : 'bg-body-secondary text-body-emphasis'}`}>
                                                                                {String.fromCharCode(65 + index)}
                                                                            </span>
                                                                            <span dangerouslySetInnerHTML={{ __html: formatText(option) }} />
                                                                        </CDropdownItem>
                                                                    )
                                                                ))}
                                                                {options.every(opt => !opt.trim()) && (
                                                                    <CDropdownItem disabled className="small text-body-secondary px-3">
                                                                        Enter options first
                                                                    </CDropdownItem>
                                                                )}
                                                            </CDropdownMenu>
                                                        </CDropdown>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3 border-top flex-shrink-0">
                                                <ActionButton
                                                    onClick={handleSubmit}
                                                    disabled={!selectedSet || !questionText.trim() || !correctAnswer}
                                                    loading={loading}
                                                    icon={Save}
                                                >
                                                    Save Question
                                                </ActionButton>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </div>
                        </>
                    )}
                </CCardBody >
            </CCard >

            {/* Create Set Modal */}
            <CModal
                visible={showCreateSetModal}
                onClose={() => setShowCreateSetModal(false)}
                alignment="center"
                backdrop="static"
            >
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="fw-bold fs-5">Create New Set</CModalTitle>
                </CModalHeader>
                <CModalBody className="py-3">
                    <div className="mb-2">
                        <CFormLabel className="fw-semibold small text-body-secondary text-uppercase mb-2">Set Name</CFormLabel>
                        <CFormInput
                            value={newSetName}
                            onChange={(e) => setNewSetName(e.target.value)}
                            placeholder="e.g. Mathematics Quiz - Set 1"
                            className="bg-body-secondary border-0 focus-ring shadow-sm py-2 px-3"
                            autoFocus
                        />
                        <div className="form-text mt-2">This set will be created immediately and selected.</div>
                    </div>
                </CModalBody>
                <CModalFooter className="border-0 pt-0 pb-3 d-flex justify-content-end gap-2">
                    <ActionButton
                        variant="secondary"
                        onClick={() => setShowCreateSetModal(false)}
                        fullWidth={false}
                        className="px-4"
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={handleCreateSet}
                        disabled={!newSetName.trim()}
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

export default AddQuestions
