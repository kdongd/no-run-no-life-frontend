
import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import {
    getMyInfo,
    checkNicknameAvailability,
    updateNickname
} from '../api/userApi'
import { clearToken } from '../auth/token'

const nav = [
    { to: '/', icon: '◫', label: '대시보드', end: true },
    { to: '/calendar', icon: '▦', label: '운동 캘린더' },
    { to: '/workouts', icon: '☷', label: '운동 기록' },
    { to: '/stats', icon: '▥', label: '운동 통계' },
    { to: '/coaching', icon: '✦', label: 'AI 코칭' },
]

export default function AppLayout() {
    const navigate = useNavigate()

    const [nickname, setNickname] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newNickname, setNewNickname] = useState('')
    const [isAvailable, setIsAvailable] = useState(false)
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)
    const [checking, setChecking] = useState(false)

    useEffect(() => {
        let active = true

        getMyInfo()
            .then(user => {
                if (active) {
                    setNickname(user.nickname || null)
                }
            })
            .catch(error => {
                console.error('회원 정보 조회 실패:', error)

                if (active && error.status === 401) {
                    clearToken()
                    navigate('/login', { replace: true })
                }
            })

        return () => {
            active = false
        }
    }, [navigate])

    function logout() {
        clearToken()
        navigate('/login', { replace: true })
    }

    function openModal() {
        setNewNickname(nickname || '')
        setIsAvailable(false)
        setMessage('')
        setIsModalOpen(true)
    }

    function closeModal() {
        if (saving) return
        setIsModalOpen(false)
    }

    function handleNicknameChange(value) {
        setNewNickname(value)
        setIsAvailable(false)
        setMessage('')
    }

    async function handleCheckNickname() {
        const value = newNickname.trim()

        if (value.length < 2 || value.length > 10) {
            setMessage('닉네임은 2~10자로 입력해주세요.')
            setIsAvailable(false)
            return
        }

        if (value === nickname) {
            setMessage('현재 사용 중인 닉네임입니다.')
            setIsAvailable(false)
            return
        }

        setChecking(true)
        setMessage('')
        setIsAvailable(false)

        try {
            const result = await checkNicknameAvailability(value)

            if (result.available) {
                setIsAvailable(true)
                setMessage('사용 가능한 닉네임입니다.')
            } else {
                setMessage(
                    result.reason === 'DUPLICATE'
                        ? '이미 사용 중인 닉네임입니다.'
                        : result.reason === 'RESERVED'
                          ? '사용할 수 없는 닉네임입니다.'
                          : '닉네임은 2~10자로 입력해주세요.'
                )
            }
        } catch (error) {
            console.error(error)
            setMessage('중복 확인 중 오류가 발생했습니다.')
        } finally {
            setChecking(false)
        }
    }

    async function handleSaveNickname(event) {
        event.preventDefault()

        if (!isAvailable || saving || checking) return

        setSaving(true)
        setMessage('')

        try {
            await updateNickname(newNickname.trim())

            const user = await getMyInfo()
            setNickname(user.nickname || null)

            setIsModalOpen(false)
            setIsAvailable(false)
            setMessage('')
        } catch (error) {
            console.error(error)

            if (error.status === 409) {
                setMessage('이미 사용 중인 닉네임입니다.')
                setIsAvailable(false)
            } else if (error.status === 400) {
                setMessage('닉네임 형식을 확인해주세요.')
                setIsAvailable(false)
            } else if (error.status === 401) {
                clearToken()
                navigate('/login', { replace: true })
            } else {
                setMessage('닉네임 저장 중 오류가 발생했습니다.')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <Link to="/" className="brand">
                    <span className="brand-mark">↗</span>
                    <span>
                        NO RUN
                        <br />
                        <strong>NO LIFE</strong>
                    </span>
                </Link>

                <div className="sidebar-label">WORKSPACE</div>

                <nav className="side-nav" aria-label="주요 메뉴">
                    {nav.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `side-link ${isActive ? 'is-active' : ''}`
                            }
                        >
                            <span className="side-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-tip">
                        <strong>꾸준함이 실력이다.</strong>
                        <span>
                            오늘의 기록이 내일의 변화를 만들어요.
                        </span>
                    </div>

                    <button className="logout-btn" onClick={logout}>
                        ↪ 로그아웃
                    </button>
                </div>
            </aside>

            <div className="app-main">
                <header className="topbar">
                    <div className="mobile-brand">
                        NO RUN NO LIFE
                    </div>

                    <span className="topbar-sub">
                        오늘도 한 걸음 더, 나만의 페이스로
                    </span>

                    <div className="topbar-actions">
                        <button
                            type="button"
                            onClick={openModal}
                            title="닉네임 수정"
                            aria-label="닉네임 수정"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                font: 'inherit',
                                color: 'inherit'
                            }}
                        >
                            <span className="profile-avatar">
                                {(nickname || 'U')
                                    .slice(0, 1)
                                    .toUpperCase()}
                            </span>
                            <strong>{nickname || '회원'}님</strong>
                            <span style={{ fontSize: '13px' }}>✎</span>
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <Outlet context={{ nickname }} />
                </main>
            </div>

            <nav className="mobile-nav" aria-label="모바일 메뉴">
                {nav.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `mobile-link ${isActive ? 'is-active' : ''}`
                        }
                    >
                        <span>{item.icon}</span>
                        <small>
                            {item.label.replace('운동 ', '')}
                        </small>
                    </NavLink>
                ))}
            </nav>

            {isModalOpen && (
                <div
                    role="presentation"
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="nickname-modal-title"
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff',
                            borderRadius: '18px',
                            padding: '28px',
                            width: '100%',
                            maxWidth: '420px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px'
                            }}
                        >
                            <h2
                                id="nickname-modal-title"
                                style={{
                                    margin: 0,
                                    fontSize: '22px',
                                    color: '#111827'
                                }}
                            >
                                닉네임 수정
                            </h2>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="닫기"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <p
                            style={{
                                color: '#64748b',
                                fontSize: '14px',
                                marginBottom: '24px'
                            }}
                        >
                            새로운 닉네임을 입력해주세요.
                        </p>

                        <form onSubmit={handleSaveNickname}>
                            <label
                                htmlFor="new-nickname"
                                style={{
                                    display: 'block',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    color: '#334155'
                                }}
                            >
                                새 닉네임
                            </label>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '8px'
                                }}
                            >
                                <input
                                    id="new-nickname"
                                    type="text"
                                    value={newNickname}
                                    maxLength={10}
                                    onChange={e =>
                                        handleNicknameChange(e.target.value)
                                    }
                                    placeholder="2~10자 입력"
                                    autoFocus
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        padding: '12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        fontSize: '14px'
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={handleCheckNickname}
                                    disabled={checking || saving}
                                    style={{
                                        border: 'none',
                                        background: '#eff6ff',
                                        color: '#2563eb',
                                        padding: '0 14px',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {checking ? '확인 중...' : '중복 확인'}
                                </button>
                            </div>

                            {message && (
                                <p
                                    role="status"
                                    style={{
                                        marginTop: '10px',
                                        fontSize: '13px',
                                        color: isAvailable
                                            ? '#059669'
                                            : '#dc2626'
                                    }}
                                >
                                    {message}
                                </p>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '10px',
                                    marginTop: '28px'
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    style={{
                                        flex: 1,
                                        padding: '13px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        background: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    취소
                                </button>

                                <button
                                    type="submit"
                                    disabled={!isAvailable || saving || checking}
                                    style={{
                                        flex: 1,
                                        padding: '13px',
                                        border: 'none',
                                        borderRadius: '10px',
                                        background: isAvailable
                                            ? '#2563eb'
                                            : '#cbd5e1',
                                        color: '#fff',
                                        fontWeight: 700,
                                        cursor: isAvailable
                                            ? 'pointer'
                                            : 'not-allowed'
                                    }}
                                >
                                    {saving ? '저장 중...' : '변경하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
