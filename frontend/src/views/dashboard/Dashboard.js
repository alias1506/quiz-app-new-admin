import React, { useState, useEffect } from 'react'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import { usersAPI, questionsAPI, setsAPI, quizzesAPI } from '../../services/api'
import { Toast } from '../../utils/sweetalert'
import { Users, HelpCircle, Layers, CheckCircle, Activity, Trophy } from 'lucide-react'

import { CChartLine } from '@coreui/react-chartjs'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalSets: 0,
    totalQuizzes: 0,
  })
  const [chartData, setChartData] = useState({
    labels: [],
    data: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [usersRes, questionsRes, setsRes, quizzesRes] = await Promise.all([
        usersAPI.getAll(),
        questionsAPI.getAll(),
        setsAPI.getAll(),
        quizzesAPI.getAll(),
      ])

      const users = Array.isArray(usersRes.data) ? usersRes.data : []
      const questionsData = Array.isArray(questionsRes.data) ? questionsRes.data.length : 0
      const setsData = Array.isArray(setsRes.data) ? setsRes.data : []
      const quizzesData = Array.isArray(quizzesRes.data) ? quizzesRes.data : []
      const activeSetsList = setsData.filter((s) => s.isActive)

      // Calculate chart data (Last 7 days registration)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })

      const registrationsByDay = last7Days.map(date => {
        return users.filter(u => u.joinedOn && u.joinedOn.split('T')[0] === date).length
      })

      setChartData({
        labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
        data: registrationsByDay,
      })

      setStats({
        totalUsers: users.length,
        totalQuestions: questionsData,
        totalSets: setsData.length,
        totalQuizzes: quizzesData.length,
      })
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to load dashboard data',
      })
      // Set some default values so the UI doesn't break
      setStats({
        totalUsers: 0,
        totalQuestions: 0,
        totalSets: 0,
        totalQuizzes: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 140px)' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CCard className="mb-4 shadow-sm border-0 rounded-2">
        <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center flex-shrink-0">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
              <Activity size={20} />
            </div>
            <h5 className="mb-0 fw-bold">Dashboard Overview</h5>
          </div>
        </CCardHeader>
      </CCard>

      <CRow className="g-3 mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="h-100 shadow-sm border-0 rounded-2 overflow-hidden">
            <CCardBody className="d-flex align-items-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3 text-primary d-flex justify-content-center align-items-center" style={{ width: '60px', height: '60px' }}>
                <Users size={30} />
              </div>
              <div>
                <div className="text-body-secondary fw-semibold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Total Users</div>
                <div className="fs-3 fw-bold mt-1 text-body-emphasis">{stats.totalUsers}</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="h-100 shadow-sm border-0 rounded-2 overflow-hidden">
            <CCardBody className="d-flex align-items-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-3 me-3 text-info d-flex justify-content-center align-items-center" style={{ width: '60px', height: '60px' }}>
                <HelpCircle size={30} />
              </div>
              <div>
                <div className="text-body-secondary fw-semibold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Total Questions</div>
                <div className="fs-3 fw-bold mt-1 text-body-emphasis">{stats.totalQuestions}</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="h-100 shadow-sm border-0 rounded-2 overflow-hidden">
            <CCardBody className="d-flex align-items-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3 text-warning d-flex justify-content-center align-items-center" style={{ width: '60px', height: '60px' }}>
                <Layers size={30} />
              </div>
              <div>
                <div className="text-body-secondary fw-semibold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Total Sets</div>
                <div className="fs-3 fw-bold mt-1 text-body-emphasis">{stats.totalSets}</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="h-100 shadow-sm border-0 rounded-2 overflow-hidden">
            <CCardBody className="d-flex align-items-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-3 me-3 text-success d-flex justify-content-center align-items-center" style={{ width: '60px', height: '60px' }}>
                <Trophy size={30} />
              </div>
              <div>
                <div className="text-body-secondary fw-semibold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Total Quizzes</div>
                <div className="fs-3 fw-bold mt-1 text-body-emphasis">{stats.totalQuizzes}</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-3 mb-4">
        <CCol md={8}>
          <CCard className="h-100 shadow-sm border-0 rounded-2">
            <CCardHeader className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-1 fw-bold">Participant Growth</h6>
                <div className="small text-body-secondary">New joiners in the last 7 days</div>
              </div>
              <div className="bg-body-tertiary px-3 py-1 rounded-pill small fw-medium border text-body-secondary">
                Weekly Report
              </div>
            </CCardHeader>
            <CCardBody className="p-4">
              <CChartLine
                style={{ height: '300px', marginTop: '20px' }}
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Participants',
                      backgroundColor: 'rgba(88, 86, 214, 0.1)', // #5856d6 with opacity
                      borderColor: '#5856d6',
                      pointBackgroundColor: '#5856d6',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: '#5856d6',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      data: chartData.data,
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: '#2a2c39',
                      titleColor: '#fff',
                      bodyColor: '#adb5bd',
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        label: (context) => ` ${context.parsed.y} New Participants`
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false,
                      },
                      ticks: {
                        color: '#adb5bd',
                        font: {
                          size: 11,
                          weight: '500'
                        },
                        padding: 10
                      }
                    },
                    y: {
                      beginAtZero: true,
                      border: {
                        dash: [5, 5],
                        display: false,
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false,
                      },
                      ticks: {
                        color: '#adb5bd',
                        stepSize: 1,
                        font: {
                          size: 11,
                          weight: '500'
                        },
                        padding: 10
                      },
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="h-100 shadow-sm border-0 rounded-2">
            <CCardHeader className="bg-transparent border-0 p-4">
              <h6 className="mb-1 fw-bold">Quick Actions</h6>
              <div className="small text-body-secondary">Shortcuts for common tasks</div>
            </CCardHeader>
            <CCardBody className="p-4">
              <div className="list-group list-group-flush gap-2">
                <a href="#/users" className="list-group-item list-group-item-action bg-body-tertiary border-0 rounded-2 p-3 d-flex align-items-center transition-all hover-translate-y">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="fw-bold small text-body-emphasis">Manage Users</div>
                    <div className="text-body-secondary small" style={{ fontSize: '11px' }}>View and export reports</div>
                  </div>
                  <CheckCircle size={14} className="ms-auto text-body-tertiary opacity-50" />
                </a>

                <a href="#/questions/manage-questions" className="list-group-item list-group-item-action bg-body-tertiary border-0 rounded-2 p-3 d-flex align-items-center transition-all hover-translate-y">
                  <div className="bg-info bg-opacity-10 p-2 rounded-2 me-3 text-info">
                    <HelpCircle size={18} />
                  </div>
                  <div>
                    <div className="fw-bold small text-body-emphasis">Manage Questions</div>
                    <div className="text-body-secondary small" style={{ fontSize: '11px' }}>Add or edit questions</div>
                  </div>
                  <CheckCircle size={14} className="ms-auto text-body-tertiary opacity-50" />
                </a>

                <a href="#/questions/sets" className="list-group-item list-group-item-action bg-body-tertiary border-0 rounded-2 p-3 d-flex align-items-center transition-all hover-translate-y">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-2 me-3 text-warning">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="fw-bold small text-body-emphasis">Configure Sets</div>
                    <div className="text-body-secondary small" style={{ fontSize: '11px' }}>Organize quiz sets</div>
                  </div>
                  <CheckCircle size={14} className="ms-auto text-body-tertiary opacity-50" />
                </a>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
