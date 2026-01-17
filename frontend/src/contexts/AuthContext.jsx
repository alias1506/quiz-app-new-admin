import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

// Session Manager
class SessionManager {
  constructor() {
    this.sessionKey = 'userSession'
    this.maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours in ms
  }

  createSession(userId) {
    const sessionData = {
      userId: userId,
      loginTime: Date.now(),
      isAuthenticated: true,
      sessionId: this.generateSessionId(),
      lastActivity: Date.now(),
    }
    try {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error creating session - storage may be disabled:', error)
    }
    return sessionData
  }

  generateSessionId() {
    return `session_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  }

  checkSession() {
    try {
      const session = sessionStorage.getItem(this.sessionKey)
      if (!session) return { valid: false, reason: 'No session found' }

      const sessionData = JSON.parse(session)
      if (!sessionData.isAuthenticated)
        return { valid: false, reason: 'Session not authenticated' }

      const currentTime = Date.now()
      if (currentTime - sessionData.loginTime > this.maxSessionAge) {
        this.clearSession()
        return { valid: false, reason: 'Session expired' }
      }

      this.updateLastActivity()
      return { valid: true, sessionData }
    } catch (error) {
      console.error('Error checking session - storage may be disabled:', error)
      return { valid: false, reason: 'Storage access error' }
    }
  }

  updateLastActivity() {
    try {
      const session = sessionStorage.getItem(this.sessionKey)
      if (session) {
        const sessionData = JSON.parse(session)
        sessionData.lastActivity = Date.now()
        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData))
      }
    } catch (error) {
      console.error('Error updating last activity - storage may be disabled:', error)
    }
  }

  getSession() {
    try {
      const session = sessionStorage.getItem(this.sessionKey)
      if (session) {
        return JSON.parse(session)
      }
      return null
    } catch (error) {
      console.error('Error getting session - storage may be disabled:', error)
      return null
    }
  }

  clearSession() {
    try {
      sessionStorage.removeItem(this.sessionKey)
    } catch (error) {
      console.error('Error clearing session - storage may be disabled:', error)
    }
  }
}

const sessionManager = new SessionManager()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing session on mount
    const sessionCheck = sessionManager.checkSession()
    if (sessionCheck.valid) {
      setUser(sessionCheck.sessionData)
    }
    setLoading(false)
  }, [])

  const login = (userId, password) => {
    // Simple authentication - checking credentials
    // In production, this should call a backend API
    const validCredentials = {
      admin: 'admin123',
      techclub: 'techclub@123',
    }

    if (validCredentials[userId] && validCredentials[userId] === password) {
      const sessionData = sessionManager.createSession(userId)
      setUser(sessionData)
      return { success: true }
    }

    return { success: false, message: 'Invalid credentials' }
  }

  const logout = () => {
    sessionManager.clearSession()
    setUser(null)
    navigate('/login')
  }

  const isAuthenticated = () => {
    return user !== null && user.isAuthenticated
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
