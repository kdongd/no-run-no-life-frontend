import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkNicknameAvailability, updateNickname } from '../api/userApi'

export default function NicknamePage() {
    const navigate = useNavigate()

    const [nickname, setNickname] = useState('')
    const [checkResult, setCheckResult] = useState(null)
    const [error, setError] = useState('')

    function handleCheck() {
        setError('')
        if (!nickname) return
        checkNicknameAvailability(nickname)
            .then(setCheckResult)
            .catch(err => {
                console.error('닉네임 중복 확인 실패:', err)
                setCheckResult(null)
            })
    }

    function handleSubmit(e) {
        e.preventDefault()
        setError('')

        updateNickname(nickname)
            .then(res => {
                if (res.status === 400) {
                    return res.json().then(data => setError(data.message || '닉네임 형식을 확인해주세요.'))
                }
                if (res.status === 409) {
                    setError('이미 사용 중인 닉네임입니다.')
                    return
                }
                if (!res.ok) {
                    setError('닉네임 설정에 실패했습니다.')
                    return
                }
                navigate('/')
            })
            .catch(err => {
                console.error('닉네임 설정 실패:', err)
                setError('닉네임 설정에 실패했습니다.')
            })
    }

    return (
        <div className="form-page">
            <div className="page">
                <div className="logo">NO RUN NO LIFE</div>
                <div className="form-card form-card--single">
                    <div className="form-left">
                        <h1>닉네임 설정</h1>
                        <p className="description">운동 기록을 시작하기 전에<br />사용하실 닉네임을 정해주세요.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 field-group">
                                <label className="form-label">닉네임</label>
                                <div className="nickname-check-row">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="2~10자, 한글/영문/숫자"
                                        value={nickname}
                                        onChange={e => { setNickname(e.target.value); setCheckResult(null) }}
                                        minLength={2}
                                        maxLength={10}
                                        required
                                    />
                                    <button type="button" className="sub-btn" onClick={handleCheck}>중복확인</button>
                                </div>
                                {checkResult && (
                                    checkResult.available
                                        ? <div className="field-success">사용 가능한 닉네임입니다.</div>
                                        : <div className="field-error">{checkResult.reason}</div>
                                )}
                                {error && <div className="field-error">{error}</div>}
                            </div>

                            <button type="submit" className="main-btn" style={{ width: '100%' }}>닉네임 저장하고 시작하기</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}