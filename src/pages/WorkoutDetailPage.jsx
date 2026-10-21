import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchWorkoutById, deleteWorkout } from '../api/workoutApi'

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

export default function WorkoutDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [workout, setWorkout] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchWorkoutById(id)
            .then(data => setWorkout(data))
            .catch(err => {
                console.error('상세 조회 실패:', err)
                setError('상세 정보를 불러오지 못했습니다.')
            })
    }, [id])

    function handleDelete() {
        if (!confirm('이 운동 기록을 삭제하시겠습니까?')) return

        deleteWorkout(id)
            .then(res => {
                if (!res.ok) throw new Error('삭제 실패')
                navigate('/')
            })
            .catch(err => {
                console.error('삭제 실패:', err)
                alert('삭제에 실패했습니다.')
            })
    }

    if (error) {
        return (
            <div className="detail-page">
                <div className="detail-card">
                    <p>{error}</p>
                    <div className="detail-actions">
                        <Link to="/" className="sub-btn">목록으로</Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!workout) {
        return null
    }

    const typeLabel = workout.type === 'RUNNING' ? '러닝' : '복싱'
    const typeIcon = workout.type === 'RUNNING' ? RUNNING_ICON : BOXING_ICON
    const iconClass = workout.type === 'RUNNING' ? 'running' : 'boxing'

    return (
        <>
            <header className="header">
                <div className="logo">NO RUN NO LIFE</div>
                <nav className="nav">
                    <Link to="/">홈</Link>
                    <Link to="/workouts/new">운동 기록하기</Link>
                    <Link to="/stats">통계</Link>
                </nav>
            </header>

            <div className="detail-page">
                <div className="detail-card">
                    <div className="modal-header" style={{ padding: 0, marginBottom: 20, border: 'none' }}>
                        <div className="type-box">
                            <span className={`icon ${iconClass}`}>{typeIcon}</span>
                            {typeLabel}
                        </div>
                    </div>

                    <div className="modal-summary">
                        <span>{workout.durationMinutes}분</span>
                        <span>{formatDateTime(workout.workoutDateTime)}</span>
                    </div>

                    {workout.memo && <div className="modal-memo">{workout.memo}</div>}

                    {workout.type === 'RUNNING' && (
                        <div className="field-group">
                            <div className="detail-section-title">러닝 정보</div>
                            <div className="detail-item">
                                {workout.distanceKm != null && <div>거리: {workout.distanceKm}km</div>}
                                {workout.place && <div>장소: {workout.place}</div>}
                                {workout.caloriesBurned != null && <div>소모 칼로리: {workout.caloriesBurned}kcal</div>}
                            </div>
                        </div>
                    )}

                    {workout.type === 'BOXING' && (
                        <div className="field-group">
                            <div className="detail-section-title">복싱 정보</div>
                            <div className="detail-item">
                                {workout.rounds != null && <div>라운드: {workout.rounds}</div>}
                                {workout.sparringPartner && <div>스파링 파트너: {workout.sparringPartner}</div>}
                                {workout.techniqueType && <div>훈련 타입: {workout.techniqueType}</div>}
                            </div>
                        </div>
                    )}

                    <div className="detail-section-title">세부 기록</div>
                    <div className="detail-list">
                        {workout.details && workout.details.length > 0 ? (
                            workout.details.map(d => (
                                <div className="detail-item" key={d.id ?? d.sequence}>
                                    <div className="detail-item-header">
                                        <span className="detail-label">{d.label || `기록 ${d.sequence}`}</span>
                                        {d.durationSeconds && <span className="detail-seconds">{d.durationSeconds}초</span>}
                                    </div>
                                    {d.note && <div className="detail-note">{d.note}</div>}
                                </div>
                            ))
                        ) : (
                            <div className="detail-empty">등록된 세부 기록이 없습니다.</div>
                        )}
                    </div>

                    <div className="detail-actions">
                        <Link to={`/workouts/${workout.id}/edit`} className="main-btn">수정</Link>
                        <button className="danger-btn" onClick={handleDelete}>삭제</button>
                        <Link to="/" className="sub-btn">목록으로</Link>
                    </div>
                </div>
            </div>
        </>
    )
}