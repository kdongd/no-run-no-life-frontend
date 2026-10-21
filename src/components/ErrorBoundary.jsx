import { Component } from 'react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.error('화면 렌더링 중 오류 발생:', error, info)
    }

    handleReload = () => {
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <p>문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                    <button className="main-btn" onClick={this.handleReload}>홈으로</button>
                </div>
            )
        }
        return this.props.children
    }
}