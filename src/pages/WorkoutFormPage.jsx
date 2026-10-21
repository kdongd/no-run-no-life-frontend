import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchWorkoutById, createWorkout, updateWorkout } from '../api/workoutApi'

let detailSeqCounter = 1

export default function WorkoutFormPage({ mode }) {
    const { id } = useParams()
    const navigate = useNavigate()

    const [type, setType] = useState('RUNNING')
    const [duration, setDuration] = useState('')
    const [memo, setMemo] = useState('')
    const [workoutDateTime, setWorkoutDateTime] = useState('')

    // 러닝 전용
    const [distanceKm, setDistanceKm] = useState('')
    const [place, setPlace] = useState('')
    const [caloriesBurned, setCaloriesBurned] = useState('')

    // 복싱 전용
    const [rounds, setRounds] = useState('')
    const [sparringPartner, setSparringPartner] = useState('')
    const [techniqueType, setTechniqueType] = useState('SHADOW')

    const [details, setDetails] = useState([])
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (mode === 'edit' && id) {
            fetchWorkoutById(id).then(w => {
                setType(w.type)
                setDuration(String(w.durationMinutes ?? ''))
                setMemo(w.memo ?? '')
                setWorkoutDateTime(w.workoutDateTime ? w.workoutDateTime.slice(0, 16) : '')
                setDistanceKm(w.distanceKm != null ? String(w.distanceKm) : '')
                setPlace(w.place ?? '')
                setCaloriesBurned(w.caloriesBurned != null ? String(w.caloriesBurned) : '')
                setRounds(w.rounds != null ? String(w.rounds) : '')
                setSparringPartner(w.sparringPartner ?? '')
                setTechniqueType(w.techniqueType ?? 'SHADOW')

                const loadedDetails = (w.details || []).map(d => ({
                    seq: detailSeqCounter++,
                    label: d.label ?? '',
                    durationSeconds: d.durationSeconds != null ? String(d.durationSeconds) : '',
                    note: d.note ?? ''
                }))
                setDetails(loadedDetails)
            })
        }
    }, [mode, id])

    function addDetail() {
        setDetails(prev => [...prev, { seq: detailSeqCounter++, label: '', durationSeconds: '', note: '' }])
    }

    function removeDetail(seq) {
        setDetails(prev => prev.filter(d => d.seq !== seq))
    }

    function updateDetailField(seq, field, value) {
        setDetails(prev => prev.map(d => d.seq === seq ? { ...d, [field]: value } : d))
    }

    function buildPayload() {
        const payload = {
            type,
            durationMinutes: duration ? parseInt(duration) : null,
            memo,
            workoutDateTime,
            details: details.length > 0
                ? details.map((d, idx) => ({
                    sequence: idx + 1,
                    label: d.label || null,
                    durationSeconds: d.durationSeconds ? parseInt(d.durationSeconds) : null,
                    note: d.note || null
                }))
                : null
        }

        if (type === 'RUNNING') {
            payload.distanceKm = distanceKm ? parseFloat(distanceKm) : null
            payload.place = place || null
            payload.caloriesBurned = caloriesBurned ? parseInt(caloriesBurned) : null
        } else {
            payload.rounds = rounds ? parseInt(rounds) : null
            payload.sparringPartner = sparringPartner || null
            payload.techniqueType = techniqueType || null
        }

        return payload
    }

    function handleSubmit() {
        setErrors({})
        const payload = buildPayload()

        const request = mode === 'edit'
            ? updateWorkout(id, payload)
            : createWorkout(payload)

        request
            .then(res => {
                if (res.status === 400) {
                    return res.json().then(data => {
                        const fieldErrors = {}
                        ;(data.errors || []).forEach(err => {
                            fieldErrors[err.field] = err.message
                        })
                        setErrors(fieldErrors)
                    })
                }
                if (!res.ok) {
                    alert('저장에 실패했습니다. 입력값을 확인해주세요.')
                    return
                }
                return res.json().then(data => {
                    if (data) navigate(mode === 'edit' ? `/workouts/${id}` : '/')
                })
            })
            .catch(err => console.error('에러:', err))
    }

    return (
        <div className="form-page">
            <div className="page">
                <div className="logo">NO RUN NO LIFE</div>
                <div className="form-card">
                    <div className="form-left">
                        <h1>{mode === 'edit' ? '운동 기록 수정' : '운동 기록 등록'}</h1>
                        <p className="description">오늘의 운동을 기록하고<br />나만의 운동 루틴을 쌓아보세요.</p>

                        <div className="mb-4 field-group">
                            <label className="form-label">운동 종류</label>
                            <select className="form-select" value={type} onChange={e => setType(e.target.value)} disabled={mode === 'edit'}>
                                <option value="RUNNING">러닝</option>
                                <option value="BOXING">복싱</option>
                            </select>
                            {mode === 'edit' && <div className="field-error" style={{ color: '#9ca3af' }}>수정 시 운동 종류는 변경할 수 없습니다.</div>}
                        </div>

                        <div className="mb-4 field-group">
                            <label className="form-label">운동 시간</label>
                            <input
                                type="number"
                                className="form-control"
                                min="1"
                                placeholder="분 단위로 입력하세요. 예: 30"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                            />
                            {errors.durationMinutes && <div className="field-error">{errors.durationMinutes}</div>}
                        </div>

                        <div className="mb-4 field-group">
                            <label className="form-label">운동 메모</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="예: 샌드백 10R 진행"
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                            />
                            {errors.memo && <div className="field-error">{errors.memo}</div>}
                        </div>

                        <div className="mb-4 field-group">
                            <label className="form-label">운동 날짜/시간</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={workoutDateTime}
                                onChange={e => setWorkoutDateTime(e.target.value)}
                            />
                            {errors.workoutDateTime && <div className="field-error">{errors.workoutDateTime}</div>}
                        </div>

                        {type === 'RUNNING' && (
                            <>
                                <div className="mb-4 field-group">
                                    <label className="form-label">거리 (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        placeholder="예: 5.0"
                                        value={distanceKm}
                                        onChange={e => setDistanceKm(e.target.value)}
                                    />
                                    {errors.distanceKm && <div className="field-error">{errors.distanceKm}</div>}
                                </div>
                                <div className="mb-4 field-group">
                                    <label className="form-label">장소</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="예: 한강공원"
                                        value={place}
                                        onChange={e => setPlace(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4 field-group">
                                    <label className="form-label">소모 칼로리</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="예: 350"
                                        value={caloriesBurned}
                                        onChange={e => setCaloriesBurned(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {type === 'BOXING' && (
                            <>
                                <div className="mb-4 field-group">
                                    <label className="form-label">라운드</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="예: 8"
                                        value={rounds}
                                        onChange={e => setRounds(e.target.value)}
                                    />
                                    {errors.rounds && <div className="field-error">{errors.rounds}</div>}
                                </div>
                                <div className="mb-4 field-group">
                                    <label className="form-label">스파링 파트너</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="예: 김동욱"
                                        value={sparringPartner}
                                        onChange={e => setSparringPartner(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4 field-group">
                                    <label className="form-label">훈련 타입</label>
                                    <select className="form-select" value={techniqueType} onChange={e => setTechniqueType(e.target.value)}>
                                        <option value="SHADOW">섀도우</option>
                                        <option value="MITT">미트</option>
                                        <option value="SPARRING">스파링</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="mb-4">
                            <label className="form-label">세부 기록</label>
                            <div id="details-container">
                                {details.map(d => (
                                    <div key={d.seq} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                                        <input
                                            type="text"
                                            placeholder="라벨 (예: 1라운드)"
                                            className="form-control"
                                            style={{ flex: 1 }}
                                            value={d.label}
                                            onChange={e => updateDetailField(d.seq, 'label', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="시간(초)"
                                            className="form-control"
                                            style={{ width: 110 }}
                                            min="1"
                                            value={d.durationSeconds}
                                            onChange={e => updateDetailField(d.seq, 'durationSeconds', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="노트"
                                            className="form-control"
                                            style={{ flex: 1 }}
                                            value={d.note}
                                            onChange={e => updateDetailField(d.seq, 'note', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeDetail(d.seq)}
                                            style={{ background: 'none', border: '1px solid #4b5563', color: '#e5e7eb', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="sub-btn mt-2" onClick={addDetail}>+ 라운드 추가</button>
                        </div>

                        <div className="helper-box">
                            입력한 운동 기록은 목록 화면에서 바로 확인할 수 있습니다.
                        </div>

                        <div className="d-flex gap-3" style={{ display: 'flex', gap: 12 }}>
                            <button className="main-btn" onClick={handleSubmit}>
                                {mode === 'edit' ? '수정 저장하기' : '기록 저장하기'}
                            </button>
                            <Link to="/" className="sub-btn">목록으로</Link>
                        </div>
                    </div>
                    <div className="form-right">
                        <div>
                            <div className="right-icon">🥊</div>
                            <div className="right-title">기록이 실력을 만든다</div>
                            <p>러닝, 복싱, 오늘의 루틴을 남기고<br />어제보다 나은 나를 확인하세요.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}