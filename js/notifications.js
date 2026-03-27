// js/notifications.js

// Обновление иконки (вызывается из joystick.js)
function updateNotificationIcon(count) {
    const btn = document.getElementById('btn-notifications');
    if (!btn) return;

    if (count > 0) {
        btn.classList.add('has-new');
    } else {
        btn.classList.remove('has-new');
    }
}

// Открытие окна и загрузка сообщений
function openNotifications() {
    const modal = document.getElementById('notification-modal');
    const list = document.getElementById('notif-list');
    
    // Сразу показываем окно загрузки
    list.innerHTML = '<div class="notif-empty">Загрузка...</div>';
    modal.style.display = 'flex';

    let formData = new FormData();
    formData.append('action', 'get_notifications');

    fetch('php/game_engine.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderNotifications(data.notifications);
            // Убираем мигание, так как мы открыли (прочитали)
            updateNotificationIcon(0);
        } else {
            list.innerHTML = '<div class="notif-empty">Ошибка загрузки</div>';
        }
    });
}

function closeNotifications() {
    document.getElementById('notification-modal').style.display = 'none';
}

function renderNotifications(items) {
    const list = document.getElementById('notif-list');
    list.innerHTML = '';

    if (items.length === 0) {
        list.innerHTML = '<div class="notif-empty">У вас нет новых уведомлений.</div>';
        return;
    }

    items.forEach(item => {
        let el = document.createElement('div');
        el.className = 'notif-item';
        // Красивое разделение времени и текста
        el.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #444; padding-bottom:5px;">
                <span style="color:#FF9800; font-weight:bold; font-size:14px;">Системное сообщение</span>
                <span style="font-size:11px; color:#aaa;">${item.date}</span>
            </div>
            <div style="font-size:14px; color:#fff; line-height:1.4;">${item.message}</div>
        `;
        list.appendChild(el);
    });
}