import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Modal, Toast } from '../../utils/sweetalert'


const AppHeaderDropdown = () => {
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    const result = await Modal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to end your session?',
      icon: 'question',
      confirmButtonText: 'Yes, Logout',
    })

    if (result.isConfirmed) {
      logout()
      Toast.fire({
        icon: 'success',
        title: 'Logged out successfully',
      })
    }
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src="/club-logo.png" size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem href="#" className="d-flex align-items-center">
          <User size={16} className="me-2" />
          {user?.userId || 'Admin'}
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }} className="d-flex align-items-center">
          <LogOut size={16} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
