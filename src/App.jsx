import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import CalendarPage from './pages/CalendarPage'
import CoachingPage from './pages/CoachingPage'
import ConditionPage from './pages/ConditionPage'
import WorkoutListPage from './pages/WorkoutListPage'
import WorkoutFormPage from './pages/WorkoutFormPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage'
import StatsPage from './pages/StatsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NicknamePage from './pages/NicknamePage'
import ErrorBoundary from './components/ErrorBoundary'
import { isLoggedIn } from './auth/token'

function RequireAuth({ children }) { return isLoggedIn() ? children : <Navigate to="/login" replace /> }
export default function App() {
  return <ErrorBoundary><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/nickname" element={<RequireAuth><NicknamePage /></RequireAuth>} />
    <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/workouts" element={<WorkoutListPage />} />
      <Route path="/workouts/new" element={<WorkoutFormPage mode="create" />} />
      <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
      <Route path="/workouts/:id/edit" element={<WorkoutFormPage mode="edit" />} />
      <Route path="/workouts/:id/condition" element={<ConditionPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/coaching" element={<CoachingPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></ErrorBoundary>
}
