import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, login } from '../api/authApi'
import { updateNickname } from '../api/userApi'
import { setToken } from '../auth/token'

export default function SignupPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        setError('')

        signup(email, password)
            .then(res => {
                if (res.status === 409) {
                    setError('이미 가입된 이메일입니다.')
                    return
                }
                if (res.status === 400) {
                    setError('입력값을 확인해주세요. (비밀번호 8자 이상)')
                    return
                }
                if (!res.ok) {
                    setError('회원가입에 실패했습니다.')
                    return
                }

                return login(email, password).then(loginRes => {
                    if (!loginRes.ok) {
                        navigate('/login')
                        return
                    }
                    return loginRes.json().then(data => {
                        setToken(data.accessToken)
                        return updateNickname(nickname).then(nicknameRes => {
                            if (nicknameRes.ok) {
                                navigate('/')
                                return
                            }
                            navigate('/nickname')
                        })
                    })
                })
            })
            .catch(err => {
                console.error('회원가입 실패:', err)
                setError('회원가입에 실패했습니다.')
            })
    }

    return (
        <div className="form-page">
            <div className="page">
                <div className="logo">NO RUN NO LIFE</div>
                <div className="form-card form-card--single">
                    <div className="form-left">
                        <h1>회원가입</h1>
                        <p className="description">이메일과 비밀번호로<br />간단하게 가입하세요.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 field-group">
                                <label className="form-label">이메일</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4 field-group">
                                <label className="form-label">비밀번호</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="8자 이상"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className="mb-4 field-group">
                                <label className="form-label">닉네임</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="2~10자, 한글/영문/숫자"
                                    value={nickname}
                                    onChange={e => setNickname(e.target.value)}
                                    minLength={2}
                                    maxLength={10}
                                    required
                                />
                            </div>

                            {error && <div className="field-error" style={{ marginBottom: 20 }}>{error}</div>}

                            <button type="submit" className="main-btn" style={{ width: '100%' }}>회원가입</button>
                        </form>

                        <div className="auth-switch">
                            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}