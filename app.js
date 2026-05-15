const API_URL = 'http://localhost:8080/api/workouts';

const RUNNING_ICON = `🏃`;
const BOXING_ICON = `🥊`;

function renderWorkouts(workouts) {
    const container = document.getElementById('workout-list');

    if (workouts.length === 0) {
        container.innerHTML = '<div class="empty">아직 등록된 운동 기록이 없습니다.</div>';
        return;
    }

    const rows = workouts.map(w => `
        <tr>
            <td>${w.id}</td>
            <td>
                <div class="type-box">
                    ${w.type === 'RUNNING'
                        ? `<span class="icon running">${RUNNING_ICON}</span>`
                        : `<span class="icon boxing">${BOXING_ICON}</span>`
                    }
                    ${w.type === 'RUNNING' ? '러닝' : '복싱'}
                </div>
            </td>
            <td>${w.duration}분</td>
            <td>${w.memo}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>운동 종류</th>
                    <th>운동 시간</th>
                    <th>메모</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function loadWorkouts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => renderWorkouts(data))
        .catch(err => console.error('API 호출 실패:', err));
}

loadWorkouts();