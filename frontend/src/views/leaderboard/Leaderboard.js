import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CTableRow,
    CTableDataCell,
    CFormInput,
    CButton,
    CCardFooter,
} from '@coreui/react'
import { usersAPI, quizzesAPI } from '../../services/api'
import { Trophy, Medal, Clock, User, Calendar, Search, ChevronDown, Filter, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Folder, Trash2 } from 'lucide-react'
import Table from '../../components/Table'
import { format } from 'date-fns'

const Leaderboard = () => {
    const [users, setUsers] = useState([])
    const [quizzes, setQuizzes] = useState([])
    const [selectedQuizId, setSelectedQuizId] = useState('all')
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [entriesPerPage] = useState(10)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [usersRes, quizzesRes] = await Promise.all([
                usersAPI.getAll(),
                quizzesAPI.getAll()
            ])
            setUsers(usersRes.data || [])
            setQuizzes(quizzesRes.data || [])
        } catch (error) {
            console.error('Error fetching leaderboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectedQuiz = quizzes.find(q => q._id === selectedQuizId)

    const getLeaderboardData = () => {
        let filtered = [...users]

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return filtered.sort((a, b) => {
            if ((b.score || 0) !== (a.score || 0)) {
                return (b.score || 0) - (a.score || 0)
            }
            const timeA = a.timeTaken || Infinity
            const timeB = b.timeTaken || Infinity
            return timeA - timeB
        })
    }

    const leaderboardData = getLeaderboardData()

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '--:--'
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy size={16} className="text-warning" />
            case 1: return <Medal size={16} style={{ color: '#C0C0C0' }} />
            case 2: return <Medal size={16} style={{ color: '#CD7F32' }} />
            default: return <span className="fw-bold text-body-secondary small">#{index + 1}</span>
        }
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="shadow-sm border-0 rounded-2" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                                <Trophy size={20} />
                            </div>
                            <h5 className="mb-0 fw-bold">Leaderboard</h5>
                        </div>

                        {/* Action Group: Search, Filter, Refresh */}
                        <div className="d-flex align-items-center gap-3">
                            {/* Search */}
                            <div className="position-relative search-container-standard" style={{ width: '240px' }}>
                                <Search className="position-absolute top-50 translate-middle-y search-icon text-body-secondary" size={14} />
                                <CFormInput
                                    placeholder="Search user..."
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

                            {/* Quiz Filter Dropdown - Architectural Design */}
                            <div className="d-flex align-items-center bg-body-tertiary rounded-2 border" style={{ height: '38px', minWidth: '220px' }}>
                                <div className="px-3 h-100 bg-body-tertiary d-flex align-items-center border-end rounded-start-2">
                                    <Folder size={12} className="text-body-secondary me-2" />
                                    <small className="text-body-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Quiz</small>
                                </div>
                                <CDropdown className="flex-grow-1 h-100">
                                    <CDropdownToggle
                                        variant="ghost"
                                        className="w-100 h-100 d-flex justify-content-between align-items-center border-0 focus-ring shadow-none px-3 hover-bg-light-opacity cursor-pointer text-start rounded-0 rounded-end-2"
                                        caret={false}
                                    >
                                        <span className={`fw-bold text-truncate ${selectedQuizId === 'all' ? 'text-body-secondary' : 'text-body-emphasis'}`} style={{ fontSize: '13px' }}>
                                            {selectedQuizId === 'all' ? 'All Quizzes' : selectedQuiz?.name}
                                        </span>
                                        <ChevronDown size={14} className="text-body-secondary opacity-50 dropdown-chevron ms-2" />
                                    </CDropdownToggle>
                                    <CDropdownMenu className="dropdown-menu-custom dropdown-menu-strict-anim shadow-lg p-1 border-0">
                                        <CDropdownItem
                                            onClick={() => setSelectedQuizId('all')}
                                            className="rounded-1 mb-1 fw-bold"
                                            style={selectedQuizId === 'all' ? { backgroundColor: '#5856d6', color: 'white' } : {}}
                                        >
                                            All Quizzes
                                        </CDropdownItem>
                                        <div className="dropdown-divider opacity-10"></div>
                                        {quizzes.map(quiz => (
                                            <CDropdownItem
                                                key={quiz._id}
                                                onClick={() => setSelectedQuizId(quiz._id)}
                                                className="rounded-1 mb-1 fw-medium"
                                                style={selectedQuizId === quiz._id ? { backgroundColor: '#5856d6', color: 'white' } : {}}
                                            >
                                                {quiz.name}
                                            </CDropdownItem>
                                        ))}
                                    </CDropdownMenu>
                                </CDropdown>
                            </div>

                            <CButton
                                onClick={fetchData}
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
                        ) : leaderboardData.length === 0 ? (
                            <div className="text-center py-5 shadow-none" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <div className="bg-body-secondary rounded-circle d-inline-flex p-4 mb-3 opacity-50">
                                    <Trophy size={40} className="text-body-secondary" />
                                </div>
                                <h5 className="text-body-secondary fw-bold">No Data Found</h5>
                                <p className="text-body-secondary small">Players will appear here once they complete a quiz.</p>
                            </div>
                        ) : (
                            <>
                                <Table
                                    columns={[
                                        { label: '#', style: { width: '80px' }, className: 'ps-4' },
                                        { label: 'PLAYER' },
                                        { label: 'SCORE / TOTAL', style: { width: '140px' }, className: 'text-center' },
                                        { label: 'TIME', style: { width: '200px' }, className: 'text-center' },
                                        { label: 'COMPLETION DATE', style: { width: '180px' }, className: 'pe-4' },
                                        { label: 'ACTION', style: { width: '80px' }, className: 'text-center' }
                                    ]}
                                >
                                    {leaderboardData.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((user, index) => (
                                        <CTableRow key={user._id}>
                                            <CTableDataCell className="ps-3" style={{ width: '80px' }}>
                                                <div className="d-flex align-items-center gap-2 ps-3">
                                                    {getRankIcon((currentPage - 1) * entriesPerPage + index)}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div className="d-flex align-items-center">
                                                    <div className="player-avatar bg-primary bg-opacity-10 text-primary p-2 rounded-circle me-3 flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="fw-bold text-body-emphasis text-truncate small">{user.name || 'Anonymous Player'}</div>
                                                        <div className="x-small text-body-secondary text-truncate opacity-75">{user.email}</div>
                                                    </div>
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center" style={{ width: '150px' }}>
                                                <div className="bg-primary bg-opacity-10 text-primary fw-black rounded px-2 py-1 d-inline-block" style={{ minWidth: '90px', fontSize: '13px' }}>
                                                    {user.score || 0} <span className="opacity-50 mx-1">/</span> {user.total || '0'}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center" style={{ width: '200px' }}>
                                                <div className="d-flex flex-column align-items-center justify-content-center text-body-secondary fw-semibold x-small">
                                                    <div className="d-flex align-items-center gap-1 small mb-1">
                                                        <Clock size={12} className="opacity-50" />
                                                        <span>Total: {formatTime(user.timeTaken)}</span>
                                                    </div>
                                                    {user.roundTimings && user.roundTimings.length > 0 && (
                                                        <div className="w-100 px-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                                            {user.roundTimings.map((rt, i) => (
                                                                <div key={i} className="d-flex justify-content-between gap-2 mt-1 opacity-75" style={{ fontSize: '10px' }}>
                                                                    <span className="text-truncate" style={{ maxWidth: '100px' }}>{rt.roundName}</span>
                                                                    <span className="text-nowrap">- {formatTime(rt.timeTaken)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className="pe-4" style={{ width: '180px' }}>
                                                <div className="d-flex align-items-center gap-2 text-body-secondary x-small">
                                                    <Calendar size={13} className="opacity-50" />
                                                    {user.lastAttemptDate ? format(new Date(user.lastAttemptDate), 'dd/MM/yyyy HH:mm') : '--'}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                <CButton
                                                    variant="ghost"
                                                    className="p-1 text-danger hover-icon-bold"
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                                            try {
                                                                await usersAPI.delete(user._id)
                                                                setUsers(prev => prev.filter(u => u._id !== user._id))
                                                            } catch (error) {
                                                                console.error('Error deleting user:', error)
                                                                alert('Failed to delete user')
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </CButton>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </Table>
                            </>
                        )}
                    </CCardBody>

                    {!loading && leaderboardData.length > 0 && (
                        <CCardFooter className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                            <small className="text-body-secondary x-small">
                                Showing <span className="fw-bold text-body-emphasis">{(currentPage - 1) * entriesPerPage + (leaderboardData.length > 0 ? 1 : 0)}</span> to <span className="fw-bold text-body-emphasis">{Math.min(currentPage * entriesPerPage, leaderboardData.length)}</span> of <span className="fw-bold text-body-emphasis">{leaderboardData.length}</span> players
                            </small>

                            {leaderboardData.length > entriesPerPage && (
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
                                            const totalPages = Math.ceil(leaderboardData.length / entriesPerPage)
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
                                        disabled={currentPage === Math.ceil(leaderboardData.length / entriesPerPage)}
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(leaderboardData.length / entriesPerPage), p + 1))}
                                        className="p-1 border-0 text-body-secondary opacity-75 hover-opacity-100 transition-all shadow-none ms-1"
                                    >
                                        <ChevronRight size={14} />
                                    </CButton>
                                    <CButton
                                        variant="ghost"
                                        size="sm"
                                        disabled={currentPage === Math.ceil(leaderboardData.length / entriesPerPage)}
                                        onClick={() => setCurrentPage(Math.ceil(leaderboardData.length / entriesPerPage))}
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
                .fw-black { font-weight: 900; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .dropdown-menu-custom {
                    min-width: 200px;
                    border-radius: 12px;
                }
                .hover-icon-bold:hover svg {
                    stroke-width: 2.5px;
                }
            `}</style>
        </CRow >
    )
}

export default Leaderboard
