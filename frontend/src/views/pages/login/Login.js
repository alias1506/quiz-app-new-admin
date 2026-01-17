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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { Toast } from '../../../utils/sweetalert'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login, authenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (authenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [authenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login({ email, password })

      if (result.success) {
        Toast.fire({
          icon: 'success',
          title: 'Welcome back!',
        })
        navigate('/dashboard')
      } else {
        Toast.fire({
          icon: 'error',
          title: result.message || 'Invalid credentials',
        })
      }
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Login failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5} xl={4}>
            <CCard className="shadow-lg rounded-2 overflow-hidden border-0 p-4">
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <h1 className="fw-bold mb-1">Login</h1>
                  <p className="text-body-secondary mb-4 small">Sign In to your account</p>

                  <CInputGroup className="mb-3">
                    <CInputGroupText className="bg-body-tertiary border-end-0 rounded-0">
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      name="email"
                      className="bg-body-tertiary border-start-0 ps-0 rounded-0 shadow-none border-secondary-subtle"
                      placeholder="Email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText className="bg-body-tertiary border-end-0 rounded-0">
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      className="bg-body-tertiary border-start-0 border-end-0 ps-0 shadow-none border-secondary-subtle"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <CInputGroupText
                      className="bg-body-tertiary border-start-0 cursor-pointer text-muted rounded-0 border-secondary-subtle"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </CInputGroupText>
                  </CInputGroup>
                  <CRow>
                    <CCol xs={12}>
                      <CButton
                        color="primary"
                        className="px-4 py-2 fw-semibold w-100 shadow-sm border-0 rounded-1"
                        type="submit"
                        disabled={loading}
                      >
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
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
