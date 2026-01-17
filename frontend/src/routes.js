import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UsersManagement = React.lazy(() => import('./views/users/UsersManagement'))

// Question Management
const QuestionsPreview = React.lazy(() => import('./views/questions/QuestionsPreview'))
const AddQuestions = React.lazy(() => import('./views/questions/AddQuestions'))
const ManageSets = React.lazy(() => import('./views/questions/ManageSets'))

// Rounds Management
const RoundsPreview = React.lazy(() => import('./views/rounds/RoundsPreview'))
const CreateQuiz = React.lazy(() => import('./views/rounds/CreateQuiz'))
const CreateRounds = React.lazy(() => import('./views/rounds/CreateRounds'))


// Leaderboard
const Leaderboard = React.lazy(() => import('./views/leaderboard/Leaderboard'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users Management', element: UsersManagement },

  // Question Management
  { path: '/questions', exact: true, name: 'Question Management', element: QuestionsPreview },
  { path: '/questions/preview', name: 'Preview Questions', element: QuestionsPreview },
  { path: '/questions/add', name: 'Add New Questions', element: AddQuestions },
  { path: '/questions/sets', name: 'Add New Sets', element: ManageSets },

  // Rounds Management
  { path: '/rounds', exact: true, name: 'Quiz Management', element: RoundsPreview },
  { path: '/rounds/preview', name: 'Preview Quizzes', element: RoundsPreview },
  { path: '/rounds/create-quiz', name: 'Create Quiz', element: CreateQuiz },
  { path: '/rounds/create', name: 'Create Rounds', element: CreateRounds },


  // Leaderboard
  { path: '/leaderboard', name: 'Leaderboard', element: Leaderboard },
]

export default routes
