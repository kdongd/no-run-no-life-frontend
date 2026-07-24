import { Routes, Route } from 'react-router-dom'
import WorkoutListPage from './pages/WorkoutListPage.jsx'
import WorkoutFormPage from './pages/WorkoutFormPage.jsx'
import WorkoutDetailPage from './pages/WorkoutDetailPage.jsx'
import StatsPage from './pages/StatsPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkoutListPage />} />
      <Route path="/workouts/new" element={<WorkoutFormPage mode="create" />} />
      <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
      <Route path="/workouts/:id/edit" element={<WorkoutFormPage mode="edit" />} />
      <Route path="/stats" element={<StatsPage />} />
    </Routes>
  )
}

export default App