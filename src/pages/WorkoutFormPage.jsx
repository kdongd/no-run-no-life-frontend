
import { useEffect, useState } from 'react'
import {
    useParams,
    useNavigate,
    Link,
    useSearchParams
} from 'react-router-dom'
import {
    fetchWorkoutById,
    createWorkout,
    updateWorkout
} from '../api/workoutApi'
import { clearToken } from '../auth/token'
import WorkoutDateTimeInput, {
    isValidWorkoutDateTime
} from '../components/WorkoutDateTimeInput'

let detailSeqCounter = 1

const KNOWN_FIELDS = [
    'durationMinutes', 'memo', 'workoutDateTime',
    'distanceKm', 'place', 'caloriesBurned',
    'rounds', 'sparringPartner', 'techniqueType'
]

function localNow() {
    const now = new Date()

    return {
        date: [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-'),
        time: [
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0')
        ].join(':')
    }
}

function normalizeDate(value) {
    const digits = value.replace(/\D/g, '')
    return digits.length === 8
        ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
        : value
}

function normalizeTime(value) {
    const digits = value.replace(/\D/g, '')

    if (digits.length === 3) {
        return `0${digits[0]}:${digits.slice(1)}`
    }

    if (digits.length === 4) {
        return `${digits.slice(0, 2)}:${digits.slice(2)}`
    }

    return value
}

export default function WorkoutFormPage({ mode }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [type, setType] = useState('RUNNING')
    const [duration, setDuration] = useState('')
    const [memo, setMemo] = useState('')

    const [initialDateTime] = useState(() => {
        const now = localNow()
        const queryDate = searchParams.get('date')

        return {
            date: /^\d{4}-\d{2}-\d{2}$/.test(queryDate || '')
                ? queryDate
                : now.date,
            time: now.time
        }
    })

    const [workoutDate, setWorkoutDate] = useState(
        initialDateTime.date
    )
    const [workoutTime, setWorkoutTime] = useState(
        initialDateTime.time
    )

    const [distanceKm, setDistanceKm] = useState('')
    const [place, setPlace] = useState('')
    const [caloriesBurned, setCaloriesBurned] = useState('')

    const [rounds, setRounds] = useState('')
    const [sparringPartner, setSparringPartner] = useState('')
    const [techniqueType, setTechniqueType] = useState('SHADOW')

    const [details, setDetails] = useState([])
    const [errors, setErrors] = useState({})
    const [generalErrors, setGeneralErrors] = useState([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (mode !== 'edit' || !id) return

        let active = true

        fetchWorkoutById(id)
            .then(w => {
                if (!active) return

                setType(w.type)
                setDuration(String(w.durationMinutes ?? ''))
                setMemo(w.memo ?? '')

                if (w.workoutDateTime) {
                    const [date, time] = w.workoutDateTime.split('T')
                    setWorkoutDate(date)
                    setWorkoutTime(time.slice(0, 5))
                }

                setDistanceKm(
                    w.distanceKm != null ? String(w.distanceKm) : ''
                )
                setPlace(w.place ?? '')
                setCaloriesBurned(
                    w.caloriesBurned != null
                        ? String(w.caloriesBurned)
                        : ''
                )
                setRounds(w.rounds != null ? String(w.rounds) : '')
                setSparringPartner(w.sparringPartner ?? '')
                setTechniqueType(w.techniqueType ?? 'SHADOW')

                setDetails(
                    (w.details || []).map(d => ({
                        seq: detailSeqCounter++,
                        label: d.label ?? '',
                        durationSeconds:
                            d.durationSeconds != null
                                ? String(d.durationSeconds)
                                : '',
                        note: d.note ?? ''
                    }))
                )
            })
            .catch(err => {
                if (!active) return

                if (err.status === 401) {
                    clearToken()
                    navigate('/login', { replace: true })
                    return
                }

                alert('수정할 운동 기록을 불러오지 못했습니다.')
                navigate('/workouts')
            })

        return () => {
            active = false
        }
    }, [mode, id, navigate])

    function addDetail() {
        setDetails(prev => [
            ...prev,
            {
                seq: detailSeqCounter++,
                label: '',
                durationSeconds: '',
                note: ''
            }
        ])
    }

    function removeDetail(seq) {
        setDetails(prev => prev.filter(d => d.seq !== seq))
    }

    function updateDetailField(seq, field, value) {
        setDetails(prev =>
            prev.map(d =>
                d.seq === seq ? { ...d, [field]: value } : d
            )
        )
    }

    function buildPayload(date, time) {
        const payload = {
            type,
            durationMinutes: duration
                ? parseInt(duration, 10)
                : null,
            memo,
            workoutDateTime: `${date}T${time}:00`,
            details: details.length
                ? details.map((d, index) => ({
                    sequence: index + 1,
                    label: d.label || null,
                    durationSeconds: d.durationSeconds
                        ? parseInt(d.durationSeconds, 10)
                        : null,
                    note: d.note || null
                }))
                : null
        }

        if (type === 'RUNNING') {
            payload.distanceKm = distanceKm
                ? parseFloat(distanceKm)
                : null
            payload.place = place || null
            payload.caloriesBurned = caloriesBurned
                ? parseInt(caloriesBurned, 10)
                : null
        } else {
            payload.rounds = rounds
                ? parseInt(rounds, 10)
                : null
            payload.sparringPartner = sparringPartner || null
            payload.techniqueType = techniqueType || null
        }

        return payload
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (saving) return

        setErrors({})
        setGeneralErrors([])

        const date = normalizeDate(workoutDate)
        const time = normalizeTime(workoutTime)

        setWorkoutDate(date)
        setWorkoutTime(time)

        if (!isValidWorkoutDateTime(date, time)) {
            setErrors({
                workoutDateTime:
                    '올바른 날짜와 시간을 입력해주세요. 예: 2026-10-09 / 18:00'
            })
            return
        }

        const payload = buildPayload(date, time)
        setSaving(true)

        try {
            const res = mode === 'edit'
                ? await updateWorkout(id, payload)
                : await createWorkout(payload)

            if (res.status === 401) {
                clearToken()
                navigate('/login', { replace: true })
                return
            }

            if (res.status === 400) {
                const data = await res.json()
                const fieldErrors = {}
                const messages = []

                ;(data.errors || []).forEach(err => {
                    if (KNOWN_FIELDS.includes(err.field)) {
                        fieldErrors[err.field] = err.message
                    } else {
                        messages.push(err.message)
                    }
                })

                setErrors(fieldErrors)
                setGeneralErrors(
                    messages.length
                        ? messages
                        : ['입력값을 확인해주세요.']
                )
                return
            }

            if (!res.ok) {
                setGeneralErrors([
                    '운동 기록 저장에 실패했습니다.'
                ])
                return
            }

            const data = await res.json()

            if (mode === 'edit') {
                navigate(`/workouts/${id}`)
            } else {
                navigate(
                    data.id
                        ? `/workouts/${data.id}/condition`
                        : '/workouts'
                )
            }
        } catch (err) {
            console.error('운동 저장 오류:', err)
            setGeneralErrors([
                '서버 연결에 실패했습니다. 다시 시도해주세요.'
            ])
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="form-page">
            <div className="page">
                <div className="logo">NO RUN NO LIFE</div>

                <div className="form-card form-card--single">
                    <div className="form-left">
                        <h1>
                            {mode === 'edit'
                                ? '운동 기록 수정'
                                : '운동 기록 등록'}
                        </h1>

                        <p className="description">
                            오늘의 운동을 기록하고
                            <br />
                            나만의 운동 루틴을 쌓아보세요.
                        </p>

                        {generalErrors.length > 0 && (
                            <div
                                className="field-error"
                                style={{ marginBottom: 24 }}
                                role="alert"
                            >
                                {generalErrors.map((msg, index) => (
                                    <div key={index}>{msg}</div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 field-group">
                                <label className="form-label">
                                    운동 종류
                                </label>

                                <select
                                    className="form-select"
                                    value={type}
                                    onChange={e =>
                                        setType(e.target.value)
                                    }
                                    disabled={mode === 'edit'}
                                >
                                    <option value="RUNNING">러닝</option>
                                    <option value="BOXING">복싱</option>
                                </select>

                                {mode === 'edit' && (
                                    <div className="field-error">
                                        수정 시 운동 종류는 변경할 수 없습니다.
                                    </div>
                                )}
                            </div>

                            <div className="mb-4 field-group">
                                <label className="form-label">
                                    운동 시간 (분)
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    min="1"
                                    placeholder="예: 30"
                                    value={duration}
                                    onChange={e =>
                                        setDuration(e.target.value)
                                    }
                                />

                                {errors.durationMinutes && (
                                    <div className="field-error">
                                        {errors.durationMinutes}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4 field-group">
                                <label className="form-label">
                                    운동 메모
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="예: 샌드백 10R 진행"
                                    value={memo}
                                    onChange={e =>
                                        setMemo(e.target.value)
                                    }
                                />

                                {errors.memo && (
                                    <div className="field-error">
                                        {errors.memo}
                                    </div>
                                )}
                            </div>

                            <WorkoutDateTimeInput
                                date={workoutDate}
                                time={workoutTime}
                                onDateChange={setWorkoutDate}
                                onTimeChange={setWorkoutTime}
                                error={errors.workoutDateTime}
                            />

                            {type === 'RUNNING' && (
                                <div className="form-grid">
                                    <div className="field-group">
                                        <label className="form-label">
                                            거리 (km)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control"
                                            placeholder="예: 5.0"
                                            value={distanceKm}
                                            onChange={e =>
                                                setDistanceKm(e.target.value)
                                            }
                                        />
                                        {errors.distanceKm && (
                                            <div className="field-error">
                                                {errors.distanceKm}
                                            </div>
                                        )}
                                    </div>

                                    <div className="field-group">
                                        <label className="form-label">
                                            장소
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="예: 한강공원"
                                            value={place}
                                            onChange={e =>
                                                setPlace(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label className="form-label">
                                            소모 칼로리
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="예: 350"
                                            value={caloriesBurned}
                                            onChange={e =>
                                                setCaloriesBurned(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {type === 'BOXING' && (
                                <div className="form-grid">
                                    <div className="field-group">
                                        <label className="form-label">
                                            라운드
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="예: 8"
                                            value={rounds}
                                            onChange={e =>
                                                setRounds(e.target.value)
                                            }
                                        />
                                        {errors.rounds && (
                                            <div className="field-error">
                                                {errors.rounds}
                                            </div>
                                        )}
                                    </div>

                                    <div className="field-group">
                                        <label className="form-label">
                                            스파링 파트너
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="예: 김동욱"
                                            value={sparringPartner}
                                            onChange={e =>
                                                setSparringPartner(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label className="form-label">
                                            훈련 타입
                                        </label>
                                        <select
                                            className="form-select"
                                            value={techniqueType}
                                            onChange={e =>
                                                setTechniqueType(e.target.value)
                                            }
                                        >
                                            <option value="SHADOW">
                                                섀도우
                                            </option>
                                            <option value="MITT">
                                                미트
                                            </option>
                                            <option value="SPARRING">
                                                스파링
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label">
                                    세부 기록
                                </label>

                                <div id="details-container">
                                    {details.map(d => (
                                        <div
                                            key={d.seq}
                                            className="detail-row-grid"
                                        >
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="라벨 (예: 1라운드)"
                                                value={d.label}
                                                onChange={e =>
                                                    updateDetailField(
                                                        d.seq,
                                                        'label',
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                placeholder="시간(초)"
                                                value={d.durationSeconds}
                                                onChange={e =>
                                                    updateDetailField(
                                                        d.seq,
                                                        'durationSeconds',
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="노트"
                                                value={d.note}
                                                onChange={e =>
                                                    updateDetailField(
                                                        d.seq,
                                                        'note',
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeDetail(d.seq)
                                                }
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #94a3b8',
                                                    color: '#64748b',
                                                    borderRadius: 10,
                                                    padding: '8px 14px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="sub-btn mt-2"
                                    onClick={addDetail}
                                >
                                    + 라운드 추가
                                </button>
                            </div>

                            <div className="helper-box">
                                입력한 운동 기록은 목록 화면에서
                                바로 확인할 수 있습니다.
                            </div>

                            <div
                                className="d-flex gap-3"
                                style={{ display: 'flex', gap: 12 }}
                            >
                                <button
                                    type="submit"
                                    className="main-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? '저장 중...'
                                        : mode === 'edit'
                                          ? '수정 저장하기'
                                          : '기록 저장하기'}
                                </button>

                                <Link
                                    to="/workouts"
                                    className="sub-btn"
                                >
                                    목록으로
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
