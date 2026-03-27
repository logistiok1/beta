let npcsList = [];

function renderNPCs(npcs) {
    npcsList = npcs; 
    
    document.querySelectorAll('.npc-sprite').forEach(e => e.remove());

    const map = document.getElementById('world-map');
    const GRID_SIZE = window.MAP_SIZE || 50;

    npcs.forEach(npc => {
        let el = document.createElement('div');
        el.className = 'npc-sprite';
        el.style.backgroundImage = `url('images/npc/${npc.img}')`;
        
        const stepPercent = 100 / GRID_SIZE; 
        el.style.left = (npc.loc_x * stepPercent) + '%';
        el.style.top = (npc.loc_y * stepPercent) + '%';
        
        if (npc.marker) {
            let mark = document.createElement('div');
            mark.className = 'quest-marker marker-' + npc.marker;
            mark.innerText = npc.marker === 'yellow' ? '!' : '?'; 
            el.appendChild(mark);
        }

        el.onclick = () => tryInteractNPC(npc.id);

        map.appendChild(el);
    });
}

function tryInteractNPC(npcId) {
    let formData = new FormData();
    formData.append('action', 'get_npc_dialog');
    formData.append('npc_id', npcId);

    fetch('php/npc_engine.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            
            // Если это кузнец
            if (data.npc.type === 'blacksmith') {
                if(typeof openBlacksmith === 'function') {
                    openBlacksmith(npcId);
                }
                return;
            }
            
            // === ИНТЕГРАЦИЯ АУКЦИОНА ===
            if (data.npc.type === 'auction') {
                if(typeof openAuction === 'function') {
                    openAuction();
                }
                return;
            }

            // Если обычный квестовый НПС
            openNPCDialog(data.npc, data.quests, npcId);
        } else {
            alert(data.message);
        }
    });
}

function openNPCDialog(npc, quests, npcId) {
    const modal = document.getElementById('npc-modal');
    document.getElementById('npc-portrait').src = 'images/npc/' + npc.img;
    document.getElementById('npc-name').innerText = npc.name;
    document.getElementById('npc-desc').innerText = npc.desc;

    const list = document.getElementById('npc-quest-list');
    list.innerHTML = '';

    if (quests.length === 0) {
        list.innerHTML = '<div style="color:#777; font-size:14px; text-align:center;">Нет доступных заданий.</div>';
    } else {
        quests.forEach(q => {
            let item = document.createElement('div');
            item.className = 'npc-quest-item';

            let btnHtml = '';
            if (q.status === 'available') {
                btnHtml = `<button class="btn-npc-action" style="background:#4CAF50" onclick="acceptQuest(${q.id}, ${npcId})">Принять</button>`;
            } else if (q.status === 'active') {
                btnHtml = `<button class="btn-npc-action" style="background:#555" disabled>В процессе (${q.current_count}/${q.target_count})</button>`;
            } else if (q.status === 'ready') {
                btnHtml = `<button class="btn-npc-action" style="background:#FF9800" onclick="turnInQuest(${q.id})">Сдать задание</button>`;
            }

            item.innerHTML = `
                <div class="npc-quest-title">${q.title}</div>
                <div class="npc-quest-desc">${q.description}</div>
                <div class="npc-quest-rewards">
                    Награда: ${q.rewards.gold} 💰, ${q.rewards.exp} XP
                </div>
                ${btnHtml}
            `;
            list.appendChild(item);
        });
    }

    modal.style.display = 'flex';
    if(typeof closeMenu === 'function') closeMenu();
}

function closeNPCWindow() {
    document.getElementById('npc-modal').style.display = 'none';
}

function acceptQuest(questId, npcId) {
    let fd = new FormData();
    fd.append('action', 'accept_quest');
    fd.append('quest_id', questId);

    fetch('php/quest_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            tryInteractNPC(npcId);
            updateState();
        } else {
            alert(data.message);
        }
    });
}

function turnInQuest(questId) {
    let fd = new FormData();
    fd.append('action', 'complete_quest');
    fd.append('quest_id', questId);

    fetch('php/quest_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            alert("Задание сдано! Награда получена.");
            closeNPCWindow();
            updateState();
        } else {
            alert(data.message);
        }
    });
}