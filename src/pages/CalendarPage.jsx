import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WorkoutCalendar from '../components/WorkoutCalendar'
import { dateKey, fetchWorkoutsInRange, monthBounds, todayKey, workoutLabel } from '../utils/workouts'
import { clearToken } from '../auth/token'

export default function CalendarPage() {
  const now = new Date()
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState(todayKey())
  const [workouts, setWorkouts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    const { from, to } = monthBounds(view.year, view.month)
    setLoading(true); setError('')
    fetchWorkoutsInRange(from, to).then(items => { if (active) setWorkouts(items) }).catch(err => { if (active) { if (err.status === 401) { clearToken(); navigate('/login', { replace: true }) } else setError(err.message) } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [view, navigate])
  function moveMonth(amount) { setView(v => { const d = new Date(v.year, v.month + amount, 1); const next = { year: d.getFullYear(), month: d.getMonth() }; setSelected(`${next.year}-${String(next.month + 1).padStart(2, '0')}-01`); return next }) }
  const selectedItems = workouts.filter(w => dateKey(w.workoutDateTime) === selected)
  return <div><div className="page-heading"><div><span className="eyebrow">TRAINING CALENDAR</span><h1>운동 캘린더</h1><p>날짜별 운동을 확인하고 새로운 기록을 추가하세요.</p></div><Link className="btn btn-primary" to={`/workouts/new?date=${selected}`}>＋ 운동 기록하기</Link></div>{error && <div className="alert-error">{error}</div>}<div className="calendar-page-grid"><section className="surface"><WorkoutCalendar {...view} workouts={workouts} selected={selected} onSelect={setSelected} onMove={moveMonth}/></section><aside className="surface selected-panel"><span className="eyebrow">SELECTED DATE</span><h2>{selected.replaceAll('-', '.')}</h2><p className="muted">{loading ? '불러오는 중...' : `${selectedItems.length}개의 운동 기록`}</p>{selectedItems.map(w => <Link key={w.id} to={`/workouts/${w.id}`} className="calendar-record"><span className={`workout-symbol ${w.type === 'RUNNING' ? 'run-symbol' : 'box-symbol'}`}>{w.type === 'RUNNING' ? '🏃' : '🥊'}</span><span><strong>{workoutLabel(w.type)}</strong><small>{w.durationMinutes}분{w.type === 'RUNNING' && w.distanceKm ? ` · ${w.distanceKm}km` : ''}</small></span><span className="push-right">→</span></Link>)}{!loading && !selectedItems.length && <div className="empty-mini">아직 이 날짜의 운동 기록이 없어요.</div>}<Link to={`/workouts/new?date=${selected}`} className="btn btn-outline full-width">＋ 이 날짜에 운동 추가</Link></aside></div></div>
}
