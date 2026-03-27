// js/teleports.js
console.log("Teleports.js: Logic Loaded");

window.currentPortalId = null;
window.currentPortalName = '';

// Вставляем меню Врат в HTML динамически
function injectTeleportModal() {
    if (document.getElementById('teleport-network-modal')) return;
    
    let div = document.createElement('div');
    div.id = 'teleport-network-modal';
    div.className = 'tp-modal-overlay';
    div.innerHTML = `
        <div class="tp-network-window">
            <div class="tp-header">
                <div class="tp-title" id="tp-modal-title">ТЕЛЕПОРТ</div>
                <button class="btn-close-tp" onclick="closeTeleportModal()">✖</button>
            </div>
            <div class="tp-desc">Выберите доступную локацию для перемещения:</div>
            <div class="tp-list" id="tp-network-list"></div>
        </div>
    `;
    document.body.appendChild(div);
}

document.addEventListener('DOMContentLoaded', () => {
    injectTeleportModal();
    const btn = document.getElementById('btn-enter-portal');
    if (btn) {
        btn.innerText = 'ТЕЛЕПОРТ'; 
        btn.onclick = null; 
        btn.addEventListener('click', performTeleport);
    }
    
    // Каждые 2 секунды проверяем дистанцию и рисуем имена на карте
    setInterval(checkTeleportsAndDrawNames, 2000);
});

// Проверка дистанции до портала и отрисовка имен
function checkTeleportsAndDrawNames() {
    if (typeof window.pX === 'undefined') return;

    let fd = new FormData();
    fd.append('action', 'get_map_portals');
    
    fetch('php/teleport_engine.php', { method: 'POST', body: fd })
    .then(r=>r.json()).then(data => {
        if(data.status === 'success') {
            // Удаляем старые метки
            document.querySelectorAll('.portal-name-label').forEach(e => e.remove());
            const map = document.getElementById('world-map');
            
            let nearbyPortalId = null;
            let nearbyPortalName = '';

            data.portals.forEach(p => {
                let pName = p.name ? p.name : 'Телепорт';

                if(map) {
                    let el = document.createElement('div');
                    el.className = 'portal-name-label';
                    el.innerText = pName;
                    
                    // --- НОВОЕ: Чтение сдвигов и размера шрифта для телепортов ---
                    let offX = p.offset_x ? parseInt(p.offset_x) : 0;
                    let offY = p.offset_y ? parseInt(p.offset_y) : 0;
                    let fSize = p.font_size ? parseInt(p.font_size) : 0;
                    
                    if (offX !== 0) el.style.marginLeft = offX + 'px';
                    if (offY !== 0) el.style.marginTop = offY + 'px';
                    if (fSize > 0) el.style.fontSize = fSize + 'px';
                    // -------------------------------------------------------------
                    
                    const stepPercent = 100 / (window.GRID_SIZE || 50);
                    el.style.left = (p.loc_x * stepPercent) + '%';
                    el.style.top = (p.loc_y * stepPercent) + '%'; 
                    map.appendChild(el);
                }

                // Проверка дистанции (показывать кнопку, если <= 2 ячейки)
                let dist = Math.max(Math.abs(window.pX - p.loc_x), Math.abs(window.pY - p.loc_y));
                if (dist <= 2) {
                    nearbyPortalId = p.id;
                    nearbyPortalName = pName;
                }
            });

            // Показываем или скрываем кнопку телепорта
            const btn = document.getElementById('btn-enter-portal');
            if (nearbyPortalId) {
                window.currentPortalId = nearbyPortalId;
                window.currentPortalName = nearbyPortalName;
                if(btn) btn.style.display = 'flex';
            } else {
                window.currentPortalId = null;
                if(btn) btn.style.display = 'none';
                closeTeleportModal(); 
            }
        }
    }).catch(e => console.log('Teleport update skip'));
}

// Открытие окна выбора локаций
function performTeleport() {
    const tpId = window.currentPortalId;
    if (!tpId) return;

    document.getElementById('tp-modal-title').innerText = window.currentPortalName || 'ТЕЛЕПОРТ';
    document.getElementById('teleport-network-modal').style.display = 'flex';
    
    const list = document.getElementById('tp-network-list');
    list.innerHTML = '<div style="text-align:center; color:gold; padding: 20px;">Загрузка списка локаций...</div>';

    let fd = new FormData();
    fd.append('action', 'get_destinations');
    fd.append('tp_id', tpId);

    fetch('php/teleport_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderTeleportLocations(data);
        } else {
            list.innerHTML = `<div style="text-align:center; color:red; padding: 20px;">${data.message}</div>`;
        }
    })
    .catch(e => {
        list.innerHTML = `<div style="text-align:center; color:red; padding: 20px;">Ошибка связи с сервером.</div>`;
        console.error(e);
    });
}

function closeTeleportModal() {
    const modal = document.getElementById('teleport-network-modal');
    if(modal) modal.style.display = 'none';
}

// Рендер списка локаций в окне
function renderTeleportLocations(data) {
    const list = document.getElementById('tp-network-list');
    list.innerHTML = '';
    
    if (data.destinations.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#777;">Этот портал никуда не ведет (добавьте связи в таблицу teleport_destinations)</div>';
        return;
    }

    const myLevel = parseInt(data.user_level);
    const myLoc = parseInt(data.current_loc);

    data.destinations.forEach(loc => {
        let locId = parseInt(loc.id);
        let levelReq = parseInt(loc.min_level);
        
        let canTravel = true;
        let statusHtml = '';
        let classes = 'tp-item';
        
        // По умолчанию цвет уровня золотой
        let levelColor = '#f1c40f'; 

        if (locId === myLoc) {
            canTravel = false;
            statusHtml = '<div class="tp-status" style="color:#03A9F4;">Вы здесь</div>';
            classes += ' active-loc';
        } else {
            if (myLevel < levelReq) {
                // Если уровень мал - уровень красный, пишем ОПАСНО, но КНОПКА ОТКРЫТА
                levelColor = '#f44336';
                statusHtml = '<div class="tp-status" style="color:#f44336;">Опасно</div>';
            } else {
                statusHtml = '<div class="tp-status" style="color:#4CAF50;">Доступно</div>';
            }
        }

        let btnHtml = canTravel 
            ? `<button class="btn-tp-go" onclick="doTeleportTravel(${loc.id})">ПЕРЕЙТИ</button>` 
            : `<button class="btn-tp-go locked-btn" disabled>ЗАКРЫТО</button>`;

        let el = document.createElement('div');
        el.className = classes;
        el.innerHTML = `
            <div class="tp-info">
                <div class="tp-name">${loc.name} <span class="tp-lvl" style="color:${levelColor};">[Ур. ${levelReq}]</span></div>
                ${statusHtml}
            </div>
            <div class="tp-action">${btnHtml}</div>
        `;
        list.appendChild(el);
    });
}

// Отправка запроса на перемещение
function doTeleportTravel(destId) {
    let fd = new FormData();
    fd.append('action', 'teleport_to');
    fd.append('dest_id', destId);
    
    fetch('php/teleport_engine.php', { method: 'POST', body: fd })
    .then(r=>r.json()).then(data => {
        if (data.status === 'success') {
            closeTeleportModal();
            document.getElementById('btn-enter-portal').style.display = 'none';
            if(typeof updateState === 'function') updateState();
        } else {
            alert(data.message);
        }
    });
}
