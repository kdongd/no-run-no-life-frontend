import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchWorkouts } from '../api/workoutApi'

const RUNNING_ICON = '🏃'
const BOXING_ICON = '🥊'

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}.${month}.${day} ${hours}:${minutes}`
}

export default function WorkoutListPage() {
    const navigate = useNavigate()

    const [page, setPage] = useState(null)
    const [currentPage, setCurrentPage] = useState(0)

    const [filterType, setFilterType] = useState('')
    const [filterFrom, setFilterFrom] = useState('')
    const [filterTo, setFilterTo] = useState('')
    const [filterSort, setFilterSort] = useState('workoutDateTime,desc')

    const [appliedFilters, setAppliedFilters] = useState({
        type: '',
        from: '',
        to: '',
        sort: 'workoutDateTime,desc'
    })

    useEffect(() => {
        loadWorkouts()
    }, [currentPage, appliedFilters])

    function loadWorkouts() {
        fetchWorkouts({
            type: appliedFilters.type,
            from: appliedFilters.from,
            to: appliedFilters.to,
            sort: appliedFilters.sort,
            page: currentPage,
            size: 10
        })
            .then(data => setPage(data))
            .catch(err => console.error('API 호출 실패:', err))
    }

    function applyFilter() {
        setCurrentPage(0)
        setAppliedFilters({
            type: filterType,
            from: filterFrom,
            to: filterTo,
            sort: filterSort
        })
    }

    function resetFilter() {
        setFilterType('')
        setFilterFrom('')
        setFilterTo('')
        setFilterSort('workoutDateTime,desc')
        setCurrentPage(0)
        setAppliedFilters({
            type: '',
            from: '',
            to: '',
            sort: 'workoutDateTime,desc'
        })
    }

    return (
        <>
            <header className="header">
                <div className="logo">NO RUN NO LIFE</div>
                <nav className="nav">
                    <Link to="/" className="active">홈</Link>
                    <Link to="/workouts/new">운동 기록하기</Link>
                    <Link to="/stats">통계</Link>
                </nav>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <div className="mini-badge">RUNNING & BOXING LOG</div>
                    <h1 className="hero-title">기록이 <br /><span className="blue">나를</span> 만든다</h1>
                    <p className="hero-desc">오늘의 운동을 남기고,<br />어제보다 나은 나를 확인하세요.</p>
                    <Link to="/workouts/new" className="hero-btn">운동 기록 시작하기 →</Link>
                </div>
            </section>

            <section className="record-section">
                <div className="record-top">
                    <div className="record-title">운동 기록 목록</div>
                </div>

                <div className="filter-bar">
                    <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">전체 종류</option>
                        <option value="RUNNING">러닝</option>
                        <option value="BOXING">복싱</option>
                    </select>
                    <input
                        type="datetime-local"
                        className="form-control"
                        title="시작 일시"
                        value={filterFrom}
                        onChange={e => setFilterFrom(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        className="form-control"
                        title="종료 일시"
                        value={filterTo}
                        onChange={e => setFilterTo(e.target.value)}
                    />
                    <select className="form-select" value={filterSort} onChange={e => setFilterSort(e.target.value)}>
                        <option value="workoutDateTime,desc">최신순</option>
                        <option value="workoutDateTime,asc">오래된순</option>
                        <option value="durationMinutes,desc">운동시간 긴순</option>
                        <option value="durationMinutes,asc">운동시간 짧은순</option>
                        <option value="type,asc">종류순</option>
                        <option value="distanceKm,desc">거리 긴순 (러닝)</option>
                    </select>
                    <button className="main-btn" onClick={applyFilter}>검색</button>
                    <button className="sub-btn" onClick={resetFilter}>초기화</button>
                </div>

                {page && page.content.length === 0 && (
                    <div className="empty">아직 등록된 운동 기록이 없습니다.</div>
                )}

                {page && page.content.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>운동 종류</th>
                                <th>운동 시간</th>
                                <th>메모</th>
                                <th>날짜/시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {page.content.map(w => (
                                <tr
                                    key={w.id}
                                    className="workout-row"
                                    onClick={() => navigate(`/workouts/${w.id}`)}
                                >
                                    <td>
                                        <div className="type-box">
                                            <span className={`icon ${w.type === 'RUNNING' ? 'running' : 'boxing'}`}>
                                                {w.type === 'RUNNING' ? RUNNING_ICON : BOXING_ICON}
                                            </span>
                                            {w.type === 'RUNNING' ? '러닝' : '복싱'}
                                        </div>
                                    </td>
                                    <td>{w.durationMinutes}분</td>
                                    <td>{w.memo || ''}</td>
                                    <td>{formatDateTime(w.workoutDateTime)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {page && page.totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="sub-btn"
                            disabled={page.first}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            이전
                        </button>
                        <span className="page-indicator">{page.number + 1} / {page.totalPages}</span>
                        <button
                            className="sub-btn"
                            disabled={page.last}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            다음
                        </button>
                    </div>
                )}
            </section>
        </>
    )
}