// js/forum.js

window.currentForumRole = 'player';
window.currentForumCategoryId = null;
window.currentForumCategoryTitle = '';
window.currentForumCategoryCanCreate = 1;
window.currentForumTopicId = null;
window.forumTargetInputId = null;

function openForum() {
    document.getElementById('forum-modal').style.display = 'flex';
    showForumCategories();
    if(typeof closeMenu === 'function') closeMenu();
}

function closeForum() {
    document.getElementById('forum-modal').style.display = 'none';
}

function showForumCategories() {
    document.getElementById('forum-view-categories').style.display = 'flex';
    document.getElementById('forum-view-topics').style.display = 'none';
    document.getElementById('forum-view-messages').style.display = 'none';
    
    const list = document.getElementById('forum-categories-list');
    list.innerHTML = '<div style="color:#777; text-align:center;">Загрузка...</div>';
    
    let fd = new FormData();
    fd.append('action', 'get_categories');
    
    fetch('php/forum_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            window.currentForumRole = data.role;
            document.getElementById('forum-admin-panel').style.display = (data.role === 'admin') ? 'flex' : 'none';
            
            list.innerHTML = '';
            if(data.categories.length === 0) {
                list.innerHTML = '<div style="color:#777; text-align:center;">Нет созданных разделов.</div>';
                return;
            }
            data.categories.forEach(c => {
                let el = document.createElement('div');
                el.className = 'forum-cat-item';
                let lockStatus = c.can_create_topics == 0 ? ' <span style="color:#e53935; font-size:12px;">(Только чтение)</span>' : '';
                el.innerHTML = `<div class="forum-cat-title">${c.title}${lockStatus}</div><div class="forum-cat-desc">${c.description}</div>`;
                el.onclick = () => showForumTopics(c.id, c.title, c.can_create_topics);
                list.appendChild(el);
            });
        }
    });
}

function createForumCategory() {
    let title = document.getElementById('forum-new-cat-title').value.trim();
    let desc = document.getElementById('forum-new-cat-desc').value.trim();
    if(!title) return;
    
    let fd = new FormData();
    fd.append('action', 'create_category');
    fd.append('title', title);
    fd.append('desc', desc);
    
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        if(d.status === 'success') {
            document.getElementById('forum-new-cat-title').value = '';
            document.getElementById('forum-new-cat-desc').value = '';
            showForumCategories();
        } else alert(d.message);
    });
}

function showForumTopics(catId, catTitle, canCreate) {
    window.currentForumCategoryId = catId;
    window.currentForumCategoryTitle = catTitle;
    window.currentForumCategoryCanCreate = canCreate;
    
    document.getElementById('forum-view-categories').style.display = 'none';
    document.getElementById('forum-view-topics').style.display = 'flex';
    document.getElementById('forum-view-messages').style.display = 'none';
    document.getElementById('forum-current-cat-title').innerText = catTitle;
    
    if(window.currentForumRole === 'admin') {
        document.getElementById('forum-topic-admin-panel').style.display = 'flex';
        let btnToggle = document.getElementById('btn-toggle-topic-creation');
        btnToggle.innerText = canCreate == 1 ? "Запретить создание тем" : "Разрешить создание тем";
        btnToggle.style.background = canCreate == 1 ? "#e53935" : "#4CAF50";
    } else {
        document.getElementById('forum-topic-admin-panel').style.display = 'none';
    }
    
    document.getElementById('forum-create-topic-panel').style.display = (canCreate == 1 || window.currentForumRole === 'admin') ? 'flex' : 'none';
    
    const list = document.getElementById('forum-topics-list');
    list.innerHTML = '<div style="color:#777; text-align:center;">Загрузка...</div>';
    
    let fd = new FormData();
    fd.append('action', 'get_topics');
    fd.append('category_id', catId);
    
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(data => {
        list.innerHTML = '';
        if(data.topics.length === 0) {
            list.innerHTML = '<div style="color:#777; text-align:center;">В этом разделе пока нет тем.</div>';
            return;
        }
        data.topics.forEach(t => {
            let el = document.createElement('div');
            el.className = 'forum-topic-item';
            let devBadge = t.role === 'admin' ? '<span style="color:#E91E63;">(Разработчик)</span>' : '';
            el.innerHTML = `
                <div>
                    <div class="forum-topic-title">${t.title}</div>
                    <div class="forum-topic-author">Автор: ${t.username} ${devBadge} | Лайков: ❤️${t.likes}</div>
                </div>
                <div style="color:#777; font-size:20px;">➔</div>
            `;
            el.onclick = () => showForumMessages(t.id, t.title);
            list.appendChild(el);
        });
    });
}

function toggleCategoryTopics() {
    let fd = new FormData();
    fd.append('action', 'toggle_category');
    fd.append('category_id', window.currentForumCategoryId);
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        if(d.status === 'success') showForumTopics(window.currentForumCategoryId, window.currentForumCategoryTitle, d.new_status);
        else alert(d.message);
    });
}

function createForumTopic() {
    let title = document.getElementById('forum-new-topic-title').value.trim();
    let msg = document.getElementById('forum-new-topic-msg').value.trim();
    if(!title || !msg) return alert("Заполните все поля");
    
    let fd = new FormData();
    fd.append('action', 'create_topic');
    fd.append('category_id', window.currentForumCategoryId);
    fd.append('title', title);
    fd.append('message', msg);
    
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        if(d.status === 'success') {
            document.getElementById('forum-new-topic-title').value = '';
            document.getElementById('forum-new-topic-msg').value = '';
            showForumTopics(window.currentForumCategoryId, window.currentForumCategoryTitle, window.currentForumCategoryCanCreate);
        } else alert(d.message);
    });
}

function showForumMessages(topicId, topicTitle) {
    window.currentForumTopicId = topicId;
    document.getElementById('forum-view-categories').style.display = 'none';
    document.getElementById('forum-view-topics').style.display = 'none';
    document.getElementById('forum-view-messages').style.display = 'flex';
    document.getElementById('forum-current-topic-title').innerText = topicTitle;
    loadForumMessages();
}

function loadForumMessages() {
    const list = document.getElementById('forum-messages-list');
    list.innerHTML = '<div style="color:#777; text-align:center;">Загрузка...</div>';
    
    let fd = new FormData();
    fd.append('action', 'get_messages');
    fd.append('topic_id', window.currentForumTopicId);
    
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(data => {
        list.innerHTML = '';
        
        // 1. Отрисовка ГЛАВНОГО ТЕКСТА ТЕМЫ
        let t = data.topic;
        let tDevBadge = t.role === 'admin' ? '<span>(Разработчик)</span>' : '';
        let tDate = new Date(t.created_at * 1000).toLocaleString('ru-RU');
        let tLikeClass = t.is_liked ? 'liked' : '';
        
        list.innerHTML += `
            <div class="forum-main-topic-box">
                <div class="forum-msg-author" onclick="openProfile(${t.author_id})">${t.username} ${tDevBadge}</div>
                <div class="forum-msg-text">${t.message_parsed}</div>
                <div class="forum-msg-footer">
                    <div class="forum-msg-date">${tDate}</div>
                    <div class="forum-like-btn ${tLikeClass}" onclick="likeForumPost('topic', ${t.id})">❤️ ${t.likes}</div>
                </div>
            </div>
            <div class="forum-replies-divider">Ответы:</div>
        `;
        
        // 2. Отрисовка ОТВЕТОВ
        if (data.messages.length === 0) {
            list.innerHTML += `<div style="text-align:center; color:#777; font-size:12px; margin-top:10px;">Пока нет ответов</div>`;
        } else {
            data.messages.forEach(m => {
                let el = document.createElement('div');
                el.className = 'forum-msg';
                let devBadge = m.role === 'admin' ? '<span>(Разработчик)</span>' : '';
                let dStr = new Date(m.created_at * 1000).toLocaleString('ru-RU');
                let likeClass = m.is_liked ? 'liked' : '';
                
                el.innerHTML = `
                    <div class="forum-msg-author" onclick="openProfile(${m.author_id})">${m.username} ${devBadge}</div>
                    <div class="forum-msg-text">${m.message_parsed}</div>
                    <div class="forum-msg-footer">
                        <div class="forum-msg-date">${dStr}</div>
                        <div class="forum-like-btn ${likeClass}" onclick="likeForumPost('message', ${m.id})">❤️ ${m.likes}</div>
                    </div>
                `;
                list.appendChild(el);
            });
        }
        // Скроллим вниз к последнему сообщению
        setTimeout(() => { list.scrollTop = list.scrollHeight; }, 100);
    });
}

function likeForumPost(type, id) {
    let fd = new FormData();
    fd.append('action', 'like_post');
    fd.append('target_type', type);
    fd.append('target_id', id);
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        if(d.status === 'success') loadForumMessages();
    });
}

function postForumMessage() {
    let input = document.getElementById('forum-reply-input');
    let msg = input.value.trim();
    if(!msg) return;
    
    let fd = new FormData();
    fd.append('action', 'post_message');
    fd.append('topic_id', window.currentForumTopicId);
    fd.append('message', msg);
    
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        if(d.status === 'success') {
            input.value = '';
            loadForumMessages();
        } else alert(d.message);
    });
}

// === ВСТАВКА ПРЕДМЕТОВ В ТЕКСТ ===
function openForumItemPicker(targetInputId) {
    window.forumTargetInputId = targetInputId;
    document.getElementById('forum-item-picker-modal').style.display = 'flex';
    
    const grid = document.getElementById('forum-item-picker-grid');
    grid.innerHTML = '<div style="color:gold;">Загрузка базы предметов...</div>';
    
    let fd = new FormData();
    fd.append('action', 'get_all_items');
    fetch('php/forum_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        grid.innerHTML = '';
        d.items.forEach(item => {
            let el = document.createElement('div');
            el.className = `f-picker-slot rarity-${item.rarity || 'common'}`;
            let dir = item.type === 'material' ? 'res' : 'shmot';
            el.innerHTML = `<img src="images/${dir}/${item.img}"> <div class="f-picker-name">${item.name}</div>`;
            el.onclick = () => {
                let inp = document.getElementById(window.forumTargetInputId);
                inp.value += ` [item:${item.id}] `;
                closeForumItemPicker();
            };
            grid.appendChild(el);
        });
    });
}

function closeForumItemPicker() {
    document.getElementById('forum-item-picker-modal').style.display = 'none';
}