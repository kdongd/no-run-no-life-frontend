import { useMemo } from 'react'
import { dateKey, monthKey, todayKey } from '../utils/workouts'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
export default function WorkoutCalendar({ year, month, workouts, selected, onSelect, onMove, compact = false }) {
  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay()
    const length = new Date(year, month + 1, 0).getDate()
    const map = {}
    workouts.forEach(w => { const key = dateKey(w.workoutDateTime); (map[key] ||= []).push(w) })
    return [...Array(first).fill(null), ...Array.from({ length }, (_, i) => ({ day: i + 1, key: `${monthKey(year, month)}-${String(i + 1).padStart(2, '0')}`, items: map[`${monthKey(year, month)}-${String(i + 1).padStart(2, '0')}`] || [] }))]
  }, [year, month, workouts])
  return <div className={`workout-calendar ${compact ? 'calendar-compact' : ''}`}>
    <div className="calendar-toolbar"><div className="calendar-heading"><strong>{year}년 {month + 1}월</strong><span className="muted">날짜를 눌러 운동 기록을 확인하세요</span></div><div className="calendar-controls"><button aria-label="이전 달" onClick={() => onMove(-1)}>‹</button><button aria-label="다음 달" onClick={() => onMove(1)}>›</button></div></div>
    <div className="calendar-grid">{WEEKDAYS.map(d => <div key={d} className="weekday">{d}</div>)}{days.map((item, i) => item ? <button key={item.key} type="button" className={`calendar-day ${selected === item.key ? 'selected' : ''} ${item.key === todayKey() ? 'today' : ''}`} onClick={() => onSelect(item.key)}><span className="day-number">{item.day}</span><div className="day-events">{item.items.slice(0, compact ? 2 : 3).map(w => <span key={w.id} className={`day-event ${w.type === 'RUNNING' ? 'event-run' : 'event-box'}`}>{compact ? '●' : w.type === 'RUNNING' ? '🏃 러닝' : '🥊 복싱'}</span>)}{item.items.length > (compact ? 2 : 3) && <small>+{item.items.length - (compact ? 2 : 3)}</small>}</div></button> : <div key={`blank-${i}`} className="calendar-blank" />)}</div>
    <div className="calendar-legend"><span><i className="legend-dot blue-dot"/>러닝</span><span><i className="legend-dot coral-dot"/>복싱</span></div>
  </div>
}
