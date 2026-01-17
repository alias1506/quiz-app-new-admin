import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useAuth } from '../../../contexts/AuthContext'

const Login = () => {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate inputs
    if (!userId.trim() || !password.trim()) {
      setError('Please enter both User ID and Password')
      setLoading(false)
      return
    }

    // Attempt login
    const result = login(userId.trim(), password)

    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard')
    } else {
      setError(result.message || 'Invalid credentials')
    }

    setLoading(false)
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to Quizopolis Admin</p>
                    
                    {error && (
                      <CAlert color="danger" className="mb-3">
                        {error}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="User ID"
                        autoComplete="username"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        disabled={loading}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4" disabled={loading}>
                          {loading ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Logging in...
                            </>
                          ) : (
                            'Login'
                          )}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Quizopolis Admin</h2>
                    <p>
                      Manage quiz questions, sets, and participants efficiently with our admin
                      portal.
                    </p>
                    <p className="mt-4">
                      <small>Default credentials:</small>
                      <br />
                      <small>User: admin | Pass: admin123</small>
                    </p>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
