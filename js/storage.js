// js/storage.js

function openStorage() {
    document.getElementById('storage-modal').style.display = 'flex';
    loadStorage();
    if(typeof closeMenu === 'function') closeMenu();
}

function closeStorage() {
    document.getElementById('storage-modal').style.display = 'none';
}

function loadStorage() {
    const grid = document.getElementById('storage-grid');
    grid.innerHTML = '<div style="color:#777; grid-column:span 4; text-align:center; padding:20px;">Загрузка...</div>';

    let fd = new FormData();
    fd.append('action', 'get_storage');

    fetch('php/storage_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderStorage(data.items, data.server_time);
        }
    });
}

function renderStorage(items, serverTime) {
    const grid = document.getElementById('storage-grid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<div style="color:#aaa; grid-column:span 4; text-align:center; padding:20px;">Ваше хранилище пусто.</div>';
        return;
    }

    for (let i = 0; i < 24; i++) {
        let cell = document.createElement('div');
        cell.className = 'storage-slot';
        
        let item = items[i];
        if (item) {
            let imgPath = item.type === 'material' ? `images/res/${item.img}` : `images/shmot/${item.img}`;
            
            let diff = item.expires_at - serverTime;
            let h = Math.max(0, Math.floor(diff / 3600));
            let m = Math.max(0, Math.floor((diff % 3600) / 60));
            
            cell.innerHTML = `
                <div class="st-timer">${h}ч ${m}м</div>
                <img src="${imgPath}" onerror="this.src='images/ui/no_image.png'">
                <div class="st-qty">x${item.quantity}</div>
            `;
            cell.onclick = () => takeFromStorage(item.id);
        }
        grid.appendChild(cell);
    }
}

function takeFromStorage(id) {
    let fd = new FormData();
    fd.append('action', 'take');
    fd.append('id', id);

    fetch('php/storage_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            loadStorage();
            if(typeof updateState === 'function') updateState();
        } else {
            alert(data.message);
        }
    });
}