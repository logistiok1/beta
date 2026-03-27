// Открытие журнала
function openQuestLog() {
    let fd = new FormData();
    fd.append('action', 'get_log');

    fetch('php/quest_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderQuestLog(data.active, data.completed);
            document.getElementById('quest-log-modal').style.display = 'flex';
            if(typeof closeMenu === 'function') closeMenu();
        }
    });
}

function closeQuestLog() {
    document.getElementById('quest-log-modal').style.display = 'none';
}

let loadedActive = [];
let loadedCompleted = [];

function renderQuestLog(active, completed) {
    loadedActive = active;
    loadedCompleted = completed;
    switchQuestTab('active'); // По умолчанию активные
}

function switchQuestTab(tabName) {
    // UI переключение
    document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    const container = document.getElementById('quest-list-container');
    container.innerHTML = '';

    let list = (tabName === 'active') ? loadedActive : loadedCompleted;

    if (list.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#555; margin-top:20px;">Пусто</div>';
        return;
    }

    list.forEach(q => {
        let statusClass = q.status == 1 ? 'q-status-done' : 'q-status-active';
        let statusText = q.status == 1 ? '(Готов к сдаче!)' : `(${q.current_count}/${q.target_count})`;
        if (tabName === 'completed') {
            statusClass = 'q-status-done';
            statusText = '(Выполнено)';
        }

        let el = document.createElement('div');
        el.className = 'q-log-item';
        el.innerHTML = `
            <div class="q-log-title">${q.title}</div>
            <div class="q-log-progress ${statusClass}">${statusText}</div>
            <div class="q-log-desc">${q.description} <br> <i>НПС: ${q.npc_name}</i></div>
        `;
        container.appendChild(el);
    });
}