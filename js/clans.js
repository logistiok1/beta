// js/clans.js
let currentClanData = null;

function openClansMenu() {
    document.getElementById('clans-modal').style.display = 'flex';
    switchClanTab('my');
    if(typeof closeMenu === 'function') closeMenu();
}

function closeClansMenu() {
    document.getElementById('clans-modal').style.display = 'none';
}

function switchClanTab(tab) {
    document.querySelectorAll('.clans-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('ctab-' + tab).classList.add('active');
    
    const container = document.getElementById('clans-content');
    container.innerHTML = '<div style="text-align:center; margin-top:20px; color:#777;">Загрузка...</div>';

    if (tab === 'list') {
        loadAllClans(container);
    } else if (tab === 'buildings') {
        loadClanBuildings(container);
    } else {
        loadMyClan(container);
    }
}

// === ВКЛАДКА: СПИСОК КЛАНОВ ===
function loadAllClans(container) {
    let fd = new FormData();
    fd.append('action', 'get_all_clans');

    fetch('php/clans_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        container.innerHTML = '';
        if (data.clans.length === 0) {
            container.innerHTML = '<div style="text-align:center; margin-top:20px; color:#777;">Кланов пока нет</div>';
            return;
        }

        data.clans.forEach(c => {
            let div = document.createElement('div');
            div.className = 'clan-item';
            div.style.cssText = 'background:#252525; padding:12px; margin-bottom:8px; border-radius:8px; border:1px solid #444; box-shadow: 0 4px 6px rgba(0,0,0,0.5);';
            div.innerHTML = `
                <div style="font-weight:bold; color:gold; font-size:16px;">[${c.name}]</div>
                <div style="font-size:12px; color:#aaa; margin-top:4px;">Участников: ${c.members_count}/${c.max_members}</div>
                <button class="btn-clan-action" onclick="joinClan(${c.id})" style="margin-top:8px; width:100%; background:${c.is_open == 1 ? '#4CAF50' : '#555'};" ${c.is_open == 0 || c.members_count >= c.max_members ? 'disabled' : ''}>
                    ${c.is_open == 1 ? 'Вступить' : 'Закрыт'}
                </button>
            `;
            container.appendChild(div);
        });
    });
}

// === ВКЛАДКА: МОЙ КЛАН ===
function loadMyClan(container) {
    let fd = new FormData();
    fd.append('action', 'get_my_clan');

    fetch('php/clans_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        container.innerHTML = '';
        const buildTab = document.getElementById('ctab-buildings');

        if (data.status === 'no_clan') {
            if(buildTab) buildTab.style.display = 'none';
            
            container.innerHTML = `
                <div style="text-align:center; color:#ccc; margin-bottom:15px; font-size:14px;">Вы не состоите в клане.</div>
                <div style="background:#222; border:1px solid #444; padding:20px; border-radius:10px; text-align:center; box-shadow:inset 0 0 10px #000;">
                    <div style="color:gold; margin-bottom:10px; font-weight:bold;">Создание клана</div>
                    <input type="text" id="new-clan-name" class="clan-input" placeholder="Введите название..." style="width:100%; margin-bottom:10px; box-sizing:border-box;">
                    <button class="btn-create-clan" onclick="createClan()" style="width:100%;">Создать (1000 💰)</button>
                </div>
            `;
            return;
        }

        if(buildTab) buildTab.style.display = 'block';

        currentClanData = data;
        let c = data.clan;
        let isLeader = data.is_leader;

        let html = `
            <div class="my-clan-header">
                <div class="my-clan-title">[${c.name}]</div>
                <div class="my-clan-lvl">Участников: ${data.members_count} / ${data.max_members}</div>
                ${isLeader ? `<button class="btn-clan-settings" onclick="toggleClanSettings(${c.is_open})" title="Настройки входа">⚙️</button>` : ''}
            </div>
            
            <div class="clan-treasury">
                <div style="font-size:12px; color:#aaa; margin-bottom:5px;">КАЗНА КЛАНА</div>
                <span class="clan-gold-val">${c.gold}</span> <img src="images/ui/coin.png" style="width:16px; vertical-align:middle;">
            </div>
            
            <div class="clan-actions">
                <button class="btn-clan-action btn-donate" onclick="openDonateModal()">Взнос</button>
                <button class="btn-clan-action" style="background:#d32f2f;" onclick="leaveClan()">Выйти</button>
            </div>
            
            <div style="font-size:12px; color:#aaa; margin: 15px 0 5px 0; text-transform:uppercase; border-bottom:1px solid #444; padding-bottom:5px;">Участники гильдии:</div>
            <div class="clan-members-list">
        `;

        data.members.forEach(m => {
            let isLeaderObj = (m.id == c.leader_id);
            let roleText = isLeaderObj ? '<span class="clan-role-leader">Лидер</span>' : '<span class="clan-role-member">Участник</span>';
            
            // ИСПРАВЛЕНИЕ: Проверяем оба варианта имени столбца с уровнем (level и lvl)
            let lvl = m.level || m.lvl || '?'; 
            
            let avatarImg = m.active_outfit ? `images/shmot/${m.active_outfit}` : (m.class_type ? `images/class_${m.class_type}.png` : 'images/class_warrior.png');

            // ИСПРАВЛЕНИЕ: Добавлен класс clan-clickable и onclick="openProfile(m.id)"
            html += `
                <div class="clan-member-card">
                    <div class="clan-member-avatar clan-clickable" onclick="if(typeof openProfile === 'function') openProfile(${m.id})">
                        <img src="${avatarImg}" onerror="this.src='images/class_warrior.png'">
                    </div>
                    <div class="clan-member-details">
                        <div class="clan-member-name clan-clickable" onclick="if(typeof openProfile === 'function') openProfile(${m.id})">${m.username}</div>
                        <div class="clan-member-meta">Ур. ${lvl} &bull; ${roleText}</div>
                    </div>
                    ${isLeader && !isLeaderObj ? `<button class="clan-kick-btn" onclick="kickMember(${m.id})">✖</button>` : ''}
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    });
}

// === ВКЛАДКА: ПОСТРОЙКИ ===
function loadClanBuildings(container) {
    if (!currentClanData || !currentClanData.clan) {
        container.innerHTML = '<div style="text-align:center; color:#777; margin-top:20px;">Нужно состоять в клане!</div>';
        return;
    }

    let c = currentClanData.clan;
    let isLeader = currentClanData.is_leader;

    const buildings = [
        { id: 'hall', name: 'Ратуша', img: 'town_hall.png', lvl: c.building_hall, bonus: `Вместимость: +${c.building_hall * 2}` },
        { id: 'armory', name: 'Оружейная', img: 'armory.png', lvl: c.building_armory, bonus: `Урон всем: +${(c.building_armory * 0.5).toFixed(1)}` },
        { id: 'barracks', name: 'Казарма', img: 'barracks.png', lvl: c.building_barracks, bonus: `Здоровье всем: +${c.building_barracks * 5}` }
    ];

    let html = `<div class="buildings-container">`;
    
    buildings.forEach(b => {
        let cost = 1000 + (parseInt(b.lvl) * 1000);
        let btnDisabled = (!isLeader || c.gold < cost) ? 'disabled' : '';
        
        html += `
            <div class="building-card">
                <img src="images/ui/${b.img}" onerror="this.src='images/ui/no_build.png'; this.style.opacity='0.5';">
                <span class="building-name">${b.name}</span>
                <span class="building-level">Уровень ${b.lvl}</span>
                <div class="building-bonus">${b.bonus}</div>
                <button class="btn-build-upgrade" onclick="upgradeBuilding('${b.id}')" ${btnDisabled}>
                    Улучшить
                    <span class="build-cost">${cost} 💰</span>
                </button>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// === ЛОГИКА ДЕЙСТВИЙ ===
function createClan() {
    let name = document.getElementById('new-clan-name').value.trim();
    if (!name) return;
    
    let fd = new FormData();
    fd.append('action', 'create_clan');
    fd.append('name', name);

    fetch('php/clans_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status === 'success') { switchClanTab('my'); updateState(); } else alert(d.message);
    });
}

function joinClan(clanId) {
    let fd = new FormData();
    fd.append('action', 'join_clan');
    fd.append('clan_id', clanId);

    fetch('php/clans_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status === 'success') { switchClanTab('my'); updateState(); } else alert(d.message);
    });
}

function leaveClan() {
    if(!confirm("Покинуть клан? Все клановые бонусы будут утеряны!")) return;
    let fd = new FormData(); fd.append('action', 'leave_clan');
    fetch('php/clans_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status === 'success') { currentClanData = null; switchClanTab('my'); updateState(); } else alert(d.message);
    });
}

function kickMember(userId) {
    if(!confirm("Выгнать игрока из клана?")) return;
    let fd = new FormData(); fd.append('action', 'kick_member'); fd.append('target_id', userId);
    fetch('php/clans_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status === 'success') switchClanTab('my'); else alert(d.message);
    });
}

function openDonateModal() {
    if(document.getElementById('custom-donate-overlay')) {
        document.getElementById('custom-donate-overlay').remove();
    }

    let overlay = document.createElement('div');
    overlay.id = 'custom-donate-overlay';
    overlay.className = 'clan-donate-overlay';
    overlay.innerHTML = `
        <div class="clan-donate-box">
            <div class="clan-donate-title">Взнос в казну</div>
            <div class="clan-donate-desc">Сколько золота вы хотите пожертвовать на развитие клана?</div>
            <input type="number" id="clan-donate-input" class="clan-input" placeholder="Сумма 💰" min="1">
            <div style="display:flex; gap:10px; margin-top:15px;">
                <button class="btn-clan-action btn-donate" onclick="confirmDonate()">Внести</button>
                <button class="btn-clan-action" style="background:#555;" onclick="closeDonateModal()">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeDonateModal() {
    let overlay = document.getElementById('custom-donate-overlay');
    if(overlay) overlay.remove();
}

function confirmDonate() {
    let input = document.getElementById('clan-donate-input');
    let amount = parseInt(input.value);

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Введите корректную сумму!");
        return;
    }

    let fd = new FormData();
    fd.append('action', 'donate');
    fd.append('amount', amount);

    fetch('php/clans_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status === 'success') {
            closeDonateModal();
            switchClanTab('my');
            if(typeof updateState === 'function') updateState(); 
        } else {
            alert(d.message);
        }
    });
}

function toggleClanSettings(currentStatus) {
    let newStatus = currentStatus == 1 ? 0 : 1;
    let text = newStatus == 1 ? "ОТКРЫТЬ" : "ЗАКРЫТЬ";
    
    if(!confirm(`Сделать клан ${text}?`)) return;

    let fd = new FormData();
    fd.append('action', 'toggle_status');
    fd.append('is_open', newStatus);

    fetch('php/clans_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status === 'success') switchClanTab('my');
    });
}

function upgradeBuilding(type) {
    if(!confirm('Улучшить эту постройку за счет казны клана?')) return;

    let fd = new FormData();
    fd.append('action', 'upgrade_building');
    fd.append('build_type', type);

    fetch('php/clans_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            let fdRefresh = new FormData();
            fdRefresh.append('action', 'get_my_clan');
            fetch('php/clans_engine.php', { method: 'POST', body: fdRefresh })
            .then(r => r.json())
            .then(refreshData => {
                currentClanData = refreshData;
                switchClanTab('buildings'); 
                if(typeof updateState === 'function') updateState(); 
            });
        } else {
            alert(data.message);
        }
    });
}
