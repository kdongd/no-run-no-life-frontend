const API_URL = 'http://localhost:8080/workouts';

const RUNNING_ICON = `🏃`;
const BOXING_ICON = `🥊`;

let currentPage = 0;

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function renderWorkouts(page) {
    const container = document.getElementById('workout-list');
    const workouts = page.content;

    if (workouts.length === 0) {
        container.innerHTML = '<div class="empty">아직 등록된 운동 기록이 없습니다.</div>';
        renderPagination(page);
        return;
    }

    const rows = workouts.map(w => `
        <tr>
            <td>
                <div class="type-box">
                    ${w.type === 'RUNNING'
                        ? `<span class="icon running">${RUNNING_ICON}</span>`
                        : `<span class="icon boxing">${BOXING_ICON}</span>`
                    }
                    ${w.type === 'RUNNING' ? '러닝' : '복싱'}
                </div>
            </td>
            <td>${w.durationMinutes}분</td>
            <td>${w.memo || ''}</td>
            <td>${formatDateTime(w.workoutDateTime)}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>운동 종류</th>
                    <th>운동 시간</th>
                    <th>메모</th>
                    <th>날짜/시간</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    renderPagination(page);
}

function renderPagination(page) {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (page.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <button class="sub-btn" id="prev-page" ${page.first ? 'disabled' : ''}>이전</button>
        <span class="page-indicator">${page.number + 1} / ${page.totalPages}</span>
        <button class="sub-btn" id="next-page" ${page.last ? 'disabled' : ''}>다음</button>
    `;

    document.getElementById('prev-page')?.addEventListener('click', () => {
        if (!page.first) {
            currentPage -= 1;
            loadWorkouts();
        }
    });
    document.getElementById('next-page')?.addEventListener('click', () => {
        if (!page.last) {
            currentPage += 1;
            loadWorkouts();
        }
    });
}

function buildQuery() {
    const type = document.getElementById('filter-type')?.value;
    const from = document.getElementById('filter-from')?.value;
    const to = document.getElementById('filter-to')?.value;
    const sort = document.getElementById('filter-sort')?.value;

    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (from) params.set('from', from + ':00');
    if (to) params.set('to', to + ':00');
    if (sort) params.set('sort', sort);
    params.set('page', currentPage);
    params.set('size', 10);

    return params.toString();
}

function loadWorkouts() {
    const query = buildQuery();
    fetch(`${API_URL}?${query}`)
        .then(res => res.json())
        .then(data => renderWorkouts(data))
        .catch(err => console.error('API 호출 실패:', err));
}

function applyFilter() {
    currentPage = 0;
    loadWorkouts();
}

function resetFilter() {
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-from').value = '';
    document.getElementById('filter-to').value = '';
    document.getElementById('filter-sort').value = 'workoutDateTime,desc';
    currentPage = 0;
    loadWorkouts();
}

loadWorkouts();