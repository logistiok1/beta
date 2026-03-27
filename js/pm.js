// === js/pm.js ===

let currentPmTargetId = null;
let currentPmTargetName = '';
let pmInterval = null;

function initPmModal() {
    if (document.getElementById('pm-overlay-modal')) return;
    
    let html = `
    <div id="pm-overlay-modal">
        <div class="pm-window">
            <div class="pm-header">
                <button class="pm-back-btn" id="pm-btn-back" onclick="openPM(null)">⬅</button>
                <div class="pm-title" id="pm-head-title">Диалоги</div>
                <button class="pm-close-btn" onclick="closePM()">✖</button>
            </div>
            
            <div class="pm-body" id="pm-dialogs-list"></div>
            <div class="pm-body" id="pm-chat-area" style="display:none;"></div>
            
            <div class="pm-input-area" id="pm-input-box" style="display:none;">
                <div id="pm-emoji-box" class="pm-emoji-box">
                    ${['😀','😂','😊','😍','😎','😢','😡','👍','👎','🔥','💔','💯','🎉','🎁','🍻'].map(e => `<div class="pm-emoji" onclick="addPmEmoji('${e}')">${e}</div>`).join('')}
                </div>
                <button class="pm-btn-emoji" onclick="togglePmEmoji()">😀</button>
                <input type="text" id="pm-text-input" class="pm-text-input" placeholder="Напишите сообщение...">
                
                <button class="pm-btn-send" onclick="sendPM()">
                    <svg viewBox="0 0 24 24" fill="white">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

window.openPM = function(targetId = null, targetName = null) {
    if (typeof targetId === 'object' || targetId === undefined) {
        targetId = null;
        targetName = null;
    }

    initPmModal();
    let modal = document.getElementById('pm-overlay-modal');
    modal.style.display = 'flex';
    document.getElementById('pm-emoji-box').style.display = 'none';

    if (targetId) {
        currentPmTargetId = targetId;
        currentPmTargetName = targetName || 'Чат';
        
        document.getElementById('pm-dialogs-list').style.display = 'none';
        document.getElementById('pm-chat-area').style.display = 'flex';
        document.getElementById('pm-input-box').style.display = 'flex';
        document.getElementById('pm-btn-back').style.display = 'block';
        document.getElementById('pm-head-title').innerText = currentPmTargetName;
        
        loadPmChat();
        if(pmInterval) clearInterval(pmInterval);
        pmInterval = setInterval(loadPmChat, 3000);
    } else {
        currentPmTargetId = null;
        document.getElementById('pm-dialogs-list').style.display = 'flex';
        document.getElementById('pm-chat-area').style.display = 'none';
        document.getElementById('pm-input-box').style.display = 'none';
        document.getElementById('pm-btn-back').style.display = 'none';
        document.getElementById('pm-head-title').innerText = 'Диалоги';
        
        if(pmInterval) clearInterval(pmInterval);
        loadPmDialogs();
    }
};

window.closePM = function() {
    let modal = document.getElementById('pm-overlay-modal');
    if(modal) modal.style.display = 'none';
    if(pmInterval) clearInterval(pmInterval);
};

window.togglePmEmoji = function() {
    let box = document.getElementById('pm-emoji-box');
    box.style.display = box.style.display === 'none' ? 'grid' : 'none';
};

window.addPmEmoji = function(emoji) {
    let input = document.getElementById('pm-text-input');
    input.value += emoji;
    input.focus();
    togglePmEmoji();
};

window.sendPM = function() {
    if(!currentPmTargetId) return;
    let input = document.getElementById('pm-text-input');
    let text = input.value.trim();
    if(text === '') return;

    let fd = new FormData();
    fd.append('action', 'send');
    fd.append('receiver_id', currentPmTargetId);
    fd.append('message', text);

    fetch('php/pm_api.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            input.value = '';
            loadPmChat();
        } else {
            alert(data.message);
        }
    });
};

function loadPmChat() {
    if(!currentPmTargetId) return;
    let fd = new FormData();
    fd.append('action', 'get_chat');
    fd.append('target_id', currentPmTargetId);

    fetch('php/pm_api.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            let area = document.getElementById('pm-chat-area');
            let isScrolled = area.scrollHeight - area.clientHeight <= area.scrollTop + 20;

            // Вставляем аватарки к сообщениям
            area.innerHTML = data.messages.map(m => {
                let side = m.is_self ? 'self' : 'other';
                return `
                <div class="pm-msg-row ${side}">
                    <div class="pm-msg-avatar"><img src="${m.avatar}" onerror="this.src='images/ui/no_image.png'"></div>
                    <div class="pm-bubble">
                        ${m.message}
                        <div class="pm-time">${m.time}</div>
                    </div>
                </div>`;
            }).join('');

            if(isScrolled || data.messages.length > 0) {
                area.scrollTop = area.scrollHeight;
            }
        }
    });
}

function loadPmDialogs() {
    let fd = new FormData();
    fd.append('action', 'get_dialogs');

    fetch('php/pm_api.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            let list = document.getElementById('pm-dialogs-list');
            if(data.dialogs.length === 0) {
                list.innerHTML = '<div style="color:#888; text-align:center; padding: 20px;">У вас пока нет диалогов. Откройте профиль игрока и напишите ему!</div>';
                return;
            }
            
            // Вставляем аватарки в список диалогов
            list.innerHTML = data.dialogs.map(d => {
                let avatar = d.active_outfit ? `images/shmot/${d.active_outfit}` : `images/class_${d.class_type}.png`;
                return `
                <div class="pm-dialog-item" onclick="openPM(${d.user_id}, '${d.username}')">
                    <div class="pm-dialog-avatar"><img src="${avatar}" onerror="this.src='images/ui/no_image.png'"></div>
                    <div class="pm-dialog-info">
                        <div class="pm-dialog-name">${d.username}</div>
                        <div class="pm-dialog-last">${d.last_msg || 'Нет сообщений'}</div>
                    </div>
                    ${d.unread > 0 ? `<div class="pm-dialog-unread">${d.unread}</div>` : ''}
                </div>
                `;
            }).join('');
        }
    });
}
