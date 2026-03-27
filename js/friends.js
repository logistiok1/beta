function openFriends() {
    document.getElementById('friends-modal').style.display = 'flex';
    loadFriendsList();
    if(typeof closeMenu === 'function') closeMenu();
}

function closeFriends() {
    document.getElementById('friends-modal').style.display = 'none';
}

function switchFriendTab(tab) {
    document.querySelectorAll('.friends-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('ftab-' + tab).classList.add('active');
    
    // Перезагружаем список
    loadFriendsList();
}

function loadFriendsList() {
    let fd = new FormData();
    fd.append('action', 'get_friends_list');

    fetch('php/friends_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            const container = document.getElementById('friends-list');
            container.innerHTML = '';
            
            const activeTab = document.querySelector('.friends-tab.active').id;
            
            if (activeTab === 'ftab-list') {
                renderFriends(data.friends, container);
            } else {
                renderRequests(data.requests, container);
            }
        }
    });
}

function renderFriends(list, container) {
    if(list.length === 0) {
        container.innerHTML = '<div style="color:#777; text-align:center; margin-top:20px;">У вас пока нет друзей</div>';
        return;
    }
    list.forEach(f => {
        let div = document.createElement('div');
        div.className = 'friend-item';
        div.innerHTML = `
            <img src="images/class_${f.class_type}.png" class="friend-avatar" onclick="openProfile(${f.id})">
            <div class="friend-info">
                <div class="friend-name">${f.username}</div>
                <div class="friend-status ${f.is_online ? 'status-online' : 'status-offline'}">${f.status_text}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderRequests(list, container) {
    if(list.length === 0) {
        container.innerHTML = '<div style="color:#777; text-align:center; margin-top:20px;">Нет новых запросов</div>';
        return;
    }
    list.forEach(r => {
        let div = document.createElement('div');
        div.className = 'friend-item';
        div.innerHTML = `
            <img src="images/class_${r.class_type}.png" class="friend-avatar" onclick="openProfile(${r.id})">
            <div class="friend-info">
                <div class="friend-name">${r.username}</div>
            </div>
            <div class="friend-actions">
                <button class="btn-accept" onclick="handleRequest(${r.id}, 'accept')">Принять</button>
                <button class="btn-decline" onclick="handleRequest(${r.id}, 'decline')">X</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function handleRequest(targetId, decision) {
    let fd = new FormData();
    fd.append('action', 'handle_request');
    fd.append('target_id', targetId);
    fd.append('decision', decision);

    fetch('php/friends_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(() => loadFriendsList());
}

// Отправка запроса из профиля
function addFriend(targetId) {
    let fd = new FormData();
    fd.append('action', 'send_request');
    fd.append('target_id', targetId);

    fetch('php/friends_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            alert('Запрос отправлен!');
            openProfile(targetId); // Обновить кнопки
        } else {
            alert(data.message);
        }
    });
}