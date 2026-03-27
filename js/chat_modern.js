// js/chat_modern.js v1 (Advanced Chat System)

let currentChatChannel = 'general';
let chatPollInterval = null;
let attachedChatTradeItem = null;
window.chatItemsCache = {}; // Хранилище объектов предметов из чата для клика

// Смайлики
const emojiList = ['😀','😂','🤣','😎','😍','😊','🙄','🤔','😥','🤐','😴','😷','🤑','😈','💩','👻','💀','👽','👾','🤖','🎃','😺','🫶','👍','👎','✊','✌️','💪','🙏','🔥','✨','🌟','⭐','💥','💢','💦','💧','💤','💨','👂','👁️','👀','🧠','🦷','👅','👄'];

function initEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    picker.innerHTML = '';
    emojiList.forEach(e => {
        let span = document.createElement('span');
        span.className = 'chat-emoji-item';
        span.innerText = e;
        span.onclick = () => insertEmoji(e);
        picker.appendChild(span);
    });
}

function toggleEmojiPicker() {
    const p = document.getElementById('emoji-picker');
    p.style.display = p.style.display === 'none' ? 'grid' : 'none';
}

function insertEmoji(emoji) {
    const input = document.getElementById('chat-input-text-gen');
    input.value += emoji;
    document.getElementById('emoji-picker').style.display = 'none';
    input.focus();
}

function toggleChat() {
    const chat = document.getElementById('chat-window-modern');
    if (chat.style.display === 'none' || chat.style.display === '') {
        chat.style.display = 'flex';
        initEmojiPicker();
        switchChatTab('general'); // По умолчанию открываем Общий
    } else {
        chat.style.display = 'none';
        clearInterval(chatPollInterval);
    }
}

function switchChatTab(channel) {
    currentChatChannel = channel;
    
    // Обновляем визуально табы
    document.getElementById('chat-tab-gen').classList.remove('active');
    document.getElementById('chat-tab-trade').classList.remove('active');
    
    if (channel === 'general') {
        document.getElementById('chat-tab-gen').classList.add('active');
        document.getElementById('chat-input-general').style.display = 'flex';
        document.getElementById('chat-input-trade').style.display = 'none';
    } else {
        document.getElementById('chat-tab-trade').classList.add('active');
        document.getElementById('chat-input-general').style.display = 'none';
        document.getElementById('chat-input-trade').style.display = 'flex';
    }

    document.getElementById('chat-messages-area').innerHTML = '<div style="color:#777;text-align:center;">Загрузка...</div>';
    
    // Перезапускаем цикл загрузки
    if (chatPollInterval) clearInterval(chatPollInterval);
    loadChatMessages();
    chatPollInterval = setInterval(loadChatMessages, 3000);
}

function loadChatMessages() {
    let fd = new FormData();
    fd.append('action', 'get');
    fd.append('channel', currentChatChannel);

    fetch('php/chat_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderChatMessages(data.messages);
        }
    });
}

function renderChatMessages(messages) {
    const box = document.getElementById('chat-messages-area');
    box.innerHTML = '';
    
    messages.forEach(msg => {
        let row = document.createElement('div');
        row.className = 'chat-msg-row';
        
        let itemHtml = '';
        if (msg.item_obj) {
            window.chatItemsCache[msg.id] = msg.item_obj; // Сохраняем в кэш для клика
            let itemName = msg.item_obj.name;
            if (msg.item_obj.upgrade_level > 0 && msg.item_obj.type !== 'material' && msg.item_obj.type !== 'outfit') {
                itemName += ` (+${msg.item_obj.upgrade_level})`;
            }
            itemHtml = `<br><span class="chat-linked-item rarity-${msg.item_obj.rarity || 'common'}" onclick="openChatAttachedItem(${msg.id})">[${itemName}]</span>`;
        }

        row.innerHTML = `
            <div class="chat-avatar" onclick="if(typeof openProfile === 'function') openProfile(${msg.user_id})"><img src="${msg.avatar}" onerror="this.src='images/class_warrior.png'"></div>
            <div class="chat-bubble">
                <div class="chat-sender-info">
                    <span class="chat-sender-name" onclick="if(typeof openProfile === 'function') openProfile(${msg.user_id})">${msg.username}</span>
                    <span class="chat-time">${msg.time}</span>
                </div>
                <div class="chat-text-content">${msg.message}${itemHtml}</div>
            </div>
        `;
        box.appendChild(row);
    });
    
    // Прокрутка вниз
    box.scrollTop = box.scrollHeight;
}

function sendChatMessage() {
    let inputId = currentChatChannel === 'general' ? 'chat-input-text-gen' : 'chat-input-text-trade';
    let input = document.getElementById(inputId);
    let msg = input.value.trim();
    
    let itemDataStr = '';
    if (currentChatChannel === 'trade' && attachedChatTradeItem) {
        itemDataStr = JSON.stringify(attachedChatTradeItem);
    }

    if (msg === '' && itemDataStr === '') return; // Пустое не шлем

    let fd = new FormData();
    fd.append('action', 'send');
    fd.append('channel', currentChatChannel);
    fd.append('message', msg);
    fd.append('item_data', itemDataStr);

    fetch('php/chat_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(d => {
        if(d.status === 'success') {
            input.value = '';
            if (currentChatChannel === 'trade') removeAttachedItem();
            loadChatMessages(); // Сразу грузим
        }
    });
}

// === ЛОГИКА ТОРГОВОГО ПРИКРЕПЛЕНИЯ ===

function openChatItemPicker() {
    document.getElementById('chat-item-picker-modal').style.display = 'flex';
    loadChatPickerTab('main'); // По умолчанию эквип
}

function closeChatItemPicker() {
    document.getElementById('chat-item-picker-modal').style.display = 'none';
}

function loadChatPickerTab(tabName) {
    // Подсветка кнопок
    document.querySelectorAll('.chat-picker-tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById('cptab-' + tabName).classList.add('active');

    const grid = document.getElementById('chat-picker-grid');
    grid.innerHTML = '<div style="color:white; grid-column:span 4; text-align:center;">Загрузка...</div>';

    let fd = new FormData();
    fd.append('action', 'get_inventory');
    fd.append('tab', tabName);

    fetch('php/inventory_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            grid.innerHTML = '';
            let hasItems = false;
            data.inventory.forEach(item => {
                if (item) {
                    hasItems = true;
                    let slot = document.createElement('div');
                    slot.className = `chat-picker-slot rarity-${item.rarity || 'common'}`;
                    
                    let folder = (item.type === 'material') ? 'images/res/' : 'images/shmot/';
                    let src = item.img.includes('/') ? item.img : (folder + item.img);
                    
                    slot.innerHTML = `<img src="${src}">`;
                    
                    // Бэйджи для понятности
                    if (item.upgrade_level > 0 && tabName === 'main') {
                        slot.innerHTML += `<div style="position:absolute; top:2px; right:2px; background:rgba(211,47,47,0.9); color:white; font-size:10px; font-weight:bold; padding:1px 4px; border-radius:4px;">+${item.upgrade_level}</div>`;
                    }
                    if (item.quantity > 1) {
                        slot.innerHTML += `<div style="position:absolute; bottom:2px; right:2px; background:rgba(0,0,0,0.8); color:white; font-size:10px; font-weight:bold; padding:1px 4px; border-radius:4px;">${item.quantity}</div>`;
                    }

                    slot.onclick = () => attachItemToChat(item);
                    grid.appendChild(slot);
                }
            });
            if(!hasItems) grid.innerHTML = '<div style="color:#777; grid-column:span 4; text-align:center;">Пусто</div>';
        }
    });
}

function attachItemToChat(item) {
    attachedChatTradeItem = item;
    closeChatItemPicker();
    
    let itemName = item.name;
    if (item.upgrade_level > 0 && item.type !== 'material' && item.type !== 'outfit') itemName += ` (+${item.upgrade_level})`;
    
    const preview = document.getElementById('chat-attached-item');
    preview.style.display = 'flex';
    preview.innerHTML = `
        <span class="rarity-${item.rarity || 'common'}">[${itemName}]</span>
        <button class="chat-attachment-remove" onclick="removeAttachedItem()">✖</button>
    `;
}

function removeAttachedItem() {
    attachedChatTradeItem = null;
    document.getElementById('chat-attached-item').style.display = 'none';
}

function openChatAttachedItem(msgId) {
    let item = window.chatItemsCache[msgId];
    if (item && typeof showItemModal === 'function') {
        showItemModal(item, 'readonly'); // Открываем только для просмотра!
    }
}

// При нажатии Enter в полях ввода отправляем сообщение
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('chat-input-text-gen')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendChatMessage();
    });
    document.getElementById('chat-input-text-trade')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendChatMessage();
    });
});