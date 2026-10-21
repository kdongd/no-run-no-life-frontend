
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, loginWithGoogle } from '../api/authApi'
import { setToken } from '../auth/token'

export default function LoginPage() {
    const navigate = useNavigate()
    const googleButtonRef = useRef(null)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true

        script.onload = () => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredential
                })

                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        theme: 'filled_black',
                        size: 'large',
                        width: 320
                    }
                )
            }
        }

        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 로그인 성공 후 메인 화면으로 이동
    // 백엔드 JWT에는 nickname 정보가 없으므로
    // JWT로 닉네임 존재 여부를 판단하지 않는다.
    function handleLoginSuccess(data) {
        if (!data?.accessToken) {
            setError('로그인 응답에 토큰이 없습니다.')
            return
        }

        setToken(data.accessToken)
        navigate('/', { replace: true })
    }

    // 구글 로그인
    function handleGoogleCredential(response) {
        setError('')

        loginWithGoogle(response.credential)
            .then(res => {
                if (!res.ok) {
                    throw new Error('구글 로그인 실패')
                }
                return res.json()
            })
            .then(handleLoginSuccess)
            .catch(err => {
                console.error('구글 로그인 실패:', err)
                setError('구글 로그인에 실패했습니다.')
            })
    }

    // 이메일 / 비밀번호 로그인
    function handleSubmit(e) {
        e.preventDefault()
        setError('')

        login(email, password)
            .then(res => {
                if (res.status === 401) {
                    setError('이메일 또는 비밀번호가 올바르지 않습니다.')
                    return null
                }

                if (!res.ok) {
                    setError('로그인에 실패했습니다.')
                    return null
                }

                return res.json()
            })
            .then(data => {
                if (!data) return
                handleLoginSuccess(data)
            })
            .catch(err => {
                console.error('로그인 실패:', err)
                setError('로그인에 실패했습니다.')
            })
    }

    return (
        <div className="form-page">
            <div className="page">
                <div className="logo">NO RUN NO LIFE</div>

                <div className="form-card form-card--single">
                    <div className="form-left">
                        <h1>로그인</h1>

                        <p className="description">
                            다시 만나서 반가워요.
                            <br />
                            오늘의 운동을 기록하러 가볼까요?
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 field-group">
                                <label className="form-label">
                                    이메일
                                </label>

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
                                <label className="form-label">
                                    비밀번호
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div
                                    className="field-error"
                                    style={{ marginBottom: 20 }}
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="main-btn"
                                style={{ width: '100%' }}
                            >
                                로그인
                            </button>
                        </form>

                        <div className="auth-divider">
                            또는
                        </div>

                        <div
                            className="google-btn-container"
                            ref={googleButtonRef}
                        />

                        <div className="auth-switch">
                            아직 계정이 없으신가요?{' '}
                            <Link to="/signup">
                                회원가입
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
