
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCondition, saveCondition } from '../api/coachingApi'
import { clearToken } from '../auth/token'

const PARTS = [
    ['NECK', '목'],
    ['SHOULDER', '어깨'],
    ['ELBOW', '팔꿈치'],
    ['WRIST_HAND', '손목·손'],
    ['LOWER_BACK', '허리'],
    ['HIP', '고관절'],
    ['THIGH', '허벅지'],
    ['KNEE', '무릎'],
    ['CALF_SHIN', '종아리·정강이'],
    ['ANKLE', '발목'],
    ['FOOT', '발'],
    ['OTHER', '기타']
]

const RPE_LABELS = [
    '매우 쉬움',
    '쉬움',
    '보통',
    '힘듦',
    '매우 힘듦'
]

const CONDITION_LABELS = [
    '매우 나쁨',
    '나쁨',
    '보통',
    '좋음',
    '매우 좋음'
]

function ScoreSelector({ title, description, value, onChange, labels }) {
    return (
        <div style={{ marginBottom: 36 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 6
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: 18,
                        color: '#1d304f'
                    }}
                >
                    {title}
                </h2>

                <strong
                    style={{
                        color: '#397cf4',
                        fontSize: 18
                    }}
                >
                    {value} / 5
                </strong>
            </div>

            <p
                style={{
                    color: '#8294af',
                    fontSize: 13,
                    marginBottom: 18
                }}
            >
                {description}
            </p>

            <div
                role="radiogroup"
                aria-label={title}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: 8
                }}
            >
                {[1, 2, 3, 4, 5].map(score => {
                    const selected = value === score

                    return (
                        <button
                            key={score}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`${score}점, ${labels[score - 1]}`}
                            onClick={() => onChange(score)}
                            style={{
                                padding: '16px 4px',
                                borderRadius: 12,
                                border: selected
                                    ? '1px solid #397cf4'
                                    : '1px solid #dbe5f4',
                                background: selected
                                    ? '#397cf4'
                                    : '#f7faff',
                                color: selected
                                    ? '#fff'
                                    : '#1d304f',
                                fontSize: 20,
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all .15s'
                            }}
                        >
                            {score}
                        </button>
                    )
                })}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: 8,
                    marginTop: 8
                }}
            >
                {labels.map((label, index) => (
                    <span
                        key={label}
                        style={{
                            textAlign: 'center',
                            fontSize: 11,
                            fontWeight: value === index + 1 ? 700 : 400,
                            color: value === index + 1
                                ? '#397cf4'
                                : '#8294af'
                        }}
                    >
                        {label}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function ConditionPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [rpe, setRpe] = useState(3)
    const [bodyCondition, setBodyCondition] = useState(3)
    const [pains, setPains] = useState({})
    const [memo, setMemo] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        fetchCondition(id)
            .then(data => {
                if (!active) return

                setRpe(data.rpe)
                setBodyCondition(data.bodyCondition)
                setPains(
                    Object.fromEntries(
                        (data.pains || []).map(p => [
                            p.bodyPart,
                            p.intensity
                        ])
                    )
                )
                setMemo(data.memo || '')
            })
            .catch(err => {
                if (!active || err.status === 404) return

                if (err.status === 401) {
                    clearToken()
                    navigate('/login', { replace: true })
                } else {
                    setError(err.message)
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [id, navigate])

    function togglePart(key) {
        setPains(prev => {
            const next = { ...prev }

            if (next[key]) {
                delete next[key]
            } else {
                next[key] = 1
            }

            return next
        })
    }

    async function submit(event) {
        event.preventDefault()

        if (saving || loading) return

        setSaving(true)
        setError('')

        try {
            await saveCondition(id, {
                rpe,
                bodyCondition,
                pains: Object.entries(pains).map(
                    ([bodyPart, intensity]) => ({
                        bodyPart,
                        intensity: Number(intensity)
                    })
                ),
                memo
            })

            navigate(`/workouts/${id}`, { replace: true })
        } catch (err) {
            if (err.status === 401) {
                clearToken()
                navigate('/login', { replace: true })
            } else {
                setError(err.message)
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="page-heading">
                <div>
                    <span className="eyebrow">
                        POST-WORKOUT CHECK
                    </span>
                    <h1>운동 후 컨디션</h1>
                    <p>
                        운동 후 몸 상태를 기록하면 AI 코칭에 활용돼요.
                    </p>
                </div>

                <Link
                    className="btn btn-outline"
                    to={`/workouts/${id}`}
                >
                    ← 운동 상세
                </Link>
            </div>

            <form
                onSubmit={submit}
                className="surface condition-form"
            >
                {error && (
                    <div className="alert-error" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="muted">
                        기존 컨디션 기록을 확인하는 중...
                    </p>
                ) : (
                    <>
                        <ScoreSelector
                            title="운동 체감 강도 (RPE)"
                            description="이번 운동이 얼마나 힘들었나요?"
                            value={rpe}
                            onChange={setRpe}
                            labels={RPE_LABELS}
                        />

                        <ScoreSelector
                            title="운동 직후 몸 상태"
                            description="운동을 마친 후 몸 상태는 어땠나요?"
                            value={bodyCondition}
                            onChange={setBodyCondition}
                            labels={CONDITION_LABELS}
                        />

                        <div className="pain-field">
                            <h2>통증이 있었나요?</h2>

                            <p className="muted">
                                해당하는 부위를 선택하고 통증 강도를
                                입력해 주세요. 없으면 선택하지 않아도 돼요.
                            </p>

                            <div className="pain-grid">
                                {PARTS.map(([key, label]) => (
                                    <div
                                        key={key}
                                        className={`pain-option ${
                                            pains[key] ? 'is-selected' : ''
                                        }`}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={!!pains[key]}
                                                onChange={() =>
                                                    togglePart(key)
                                                }
                                            />
                                            {label}
                                        </label>

                                        {pains[key] && (
                                            <select
                                                aria-label={`${label} 통증 강도`}
                                                value={pains[key]}
                                                onChange={e =>
                                                    setPains(prev => ({
                                                        ...prev,
                                                        [key]: Number(
                                                            e.target.value
                                                        )
                                                    }))
                                                }
                                            >
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <option
                                                        key={n}
                                                        value={n}
                                                    >
                                                        {n}단계
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="field-group">
                            <label
                                htmlFor="conditionMemo"
                                className="form-label"
                            >
                                메모 (선택)
                            </label>

                            <textarea
                                id="conditionMemo"
                                className="form-control"
                                maxLength={255}
                                rows={4}
                                value={memo}
                                onChange={e =>
                                    setMemo(e.target.value)
                                }
                                placeholder="운동 후 느낀 점이나 불편했던 부분을 남겨주세요."
                            />
                        </div>

                        <div className="condition-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving
                                    ? '저장 중...'
                                    : '컨디션 저장하기'}
                            </button>

                            <Link
                                to={`/workouts/${id}`}
                                className="btn btn-outline"
                            >
                                운동 상세로
                            </Link>
                        </div>
                    </>
                )}
            </form>
        </div>
    )
}
