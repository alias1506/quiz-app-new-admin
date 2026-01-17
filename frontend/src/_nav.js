import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilPuzzle,
  cilLayers,
  cilStar,
  cilList,
  cilPlus,
  cilFolder,
  cilTask,
  cilChart,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Question Management',
    to: '/questions',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Preview',
        to: '/questions/preview',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Add New Sets',
        to: '/questions/sets',
        icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Add New Questions',
        to: '/questions/add',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Quiz Management',
    to: '/rounds',
    icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Preview',
        to: '/rounds/preview',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
      },

      {
        component: CNavItem,
        name: 'Create Quiz',
        to: '/rounds/create-quiz',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Create Rounds',
        to: '/rounds/create',
        icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Leaderboard',
    to: '/leaderboard',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
]

export default _nav
