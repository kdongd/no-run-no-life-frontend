import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchWorkouts } from '../api/workoutApi'
import { clearToken } from '../auth/token'
import { workoutLabel, koreanDate } from '../utils/workouts'

export default function WorkoutListPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ type: '', from: '', to: '', sort: 'workoutDateTime,desc' })
  const [applied, setApplied] = useState(filters)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    fetchWorkouts({ ...applied, page, size: 10 }).then(res => { if (active) setData(res) }).catch(err => { if (!active) return; if (err.status === 401) { clearToken(); navigate('/login', { replace: true }) } else setError(err.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, applied, navigate])
  function update(field, value) { setFilters(prev => ({ ...prev, [field]: value })) }
  function apply() { setPage(0); setApplied({ ...filters }) }
  function reset() { const defaults = { type: '', from: '', to: '', sort: 'workoutDateTime,desc' }; setFilters(defaults); setApplied(defaults); setPage(0) }
  return <div><div className="page-heading"><div><span className="eyebrow">WORKOUT HISTORY</span><h1>운동 기록</h1><p>그동안 쌓아온 러닝과 복싱 기록을 확인하세요.</p></div><Link to="/workouts/new" className="btn btn-primary">＋ 운동 기록하기</Link></div><section className="surface"><div className="section-heading"><div><h2>전체 기록</h2><p className="muted">{data ? `총 ${data.totalElements ?? 0}개 기록` : '운동 기록 조회'}</p></div></div><div className="filter-toolbar"><select aria-label="운동 종류" value={filters.type} onChange={e => update('type', e.target.value)}><option value="">전체 운동</option><option value="RUNNING">러닝</option><option value="BOXING">복싱</option></select><label>시작 <input type="datetime-local" value={filters.from} onChange={e => update('from', e.target.value)}/></label><label>종료 <input type="datetime-local" value={filters.to} onChange={e => update('to', e.target.value)}/></label><select aria-label="정렬" value={filters.sort} onChange={e => update('sort', e.target.value)}><option value="workoutDateTime,desc">최신순</option><option value="workoutDateTime,asc">오래된순</option><option value="durationMinutes,desc">운동시간 긴순</option><option value="durationMinutes,asc">운동시간 짧은순</option><option value="distanceKm,desc">거리 긴순</option></select><button className="btn btn-primary" onClick={apply}>검색</button><button className="btn btn-outline" onClick={reset}>초기화</button></div>{error && <div className="alert-error">{error}</div>}{loading ? <p className="muted table-loading">운동 기록을 불러오는 중...</p> : data?.content?.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>운동</th><th>운동 시간</th><th>기록</th><th>날짜</th><th></th></tr></thead><tbody>{data.content.map(w => <tr key={w.id} onClick={() => navigate(`/workouts/${w.id}`)} className="clickable-row"><td><div className="type-box"><span className={`workout-symbol ${w.type === 'RUNNING' ? 'run-symbol' : 'box-symbol'}`}>{w.type === 'RUNNING' ? '🏃' : '🥊'}</span><strong>{workoutLabel(w.type)}</strong></div></td><td>{w.durationMinutes}분</td><td className="truncate-cell">{w.memo || (w.type === 'RUNNING' && w.distanceKm ? `${w.distanceKm}km` : '—')}</td><td>{koreanDate(w.workoutDateTime)}</td><td>→</td></tr>)}</tbody></table></div> : <div className="empty-mini">운동 기록이 없어요. 첫 운동을 등록해 보세요!</div>}{data && data.totalPages > 1 && <div className="pager"><button className="btn btn-outline" disabled={page <= 0} onClick={() => setPage(p => p - 1)}>이전</button><span>{page + 1} / {data.totalPages}</span><button className="btn btn-outline" disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}>다음</button></div>}</section></div>
}
