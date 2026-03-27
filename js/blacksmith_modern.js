let currentBlacksmithNpcId = null;
let currentUpgradeItem = null;

function openBlacksmith(npcId) {
    currentBlacksmithNpcId = npcId;
    document.getElementById('blacksmith-modal').style.display = 'flex';
    loadBlacksmithItems();
    if(typeof closeMenu === 'function') closeMenu();
}

function closeBlacksmith() {
    document.getElementById('blacksmith-modal').style.display = 'none';
    currentUpgradeItem = null;
}

function loadBlacksmithItems() {
    const grid = document.getElementById('bs-items-grid');
    grid.innerHTML = '<div style="color:#aaa; width:100%; grid-column:span 5; text-align:center; padding: 20px;">Поиск предметов...</div>';
    
    document.getElementById('bs-selected-area').style.display = 'none';

    let fd = new FormData();
    fd.append('action', 'get_items');
    fd.append('npc_id', currentBlacksmithNpcId);

    fetch('php/blacksmith_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        grid.innerHTML = '';
        if (data.status === 'success') {
            if (data.items.length === 0) {
                grid.innerHTML = '<div style="color:#777; grid-column:span 5; text-align:center; padding:20px;">Нет подходящего снаряжения для заточки</div>';
                return;
            }
            
            data.items.forEach(item => {
                let el = document.createElement('div');
                el.className = 'bs-slot-modern';
                
                let badgeHtml = parseInt(item.upgrade_level) > 0 ? `<div class="bs-slot-upg-badge">+${item.upgrade_level}</div>` : '';
                
                el.innerHTML = `
                    <img src="images/shmot/${item.img}" onerror="this.src='images/ui/no_image.png'">
                    ${badgeHtml}
                `;
                
                el.onclick = () => selectBlacksmithItem(item);
                grid.appendChild(el);
            });
        } else {
            grid.innerHTML = `<div style="color:red; grid-column:span 5; text-align:center;">${data.message}</div>`;
        }
    })
    .catch(err => {
        grid.innerHTML = '<div style="color:red; grid-column:span 5; text-align:center;">Ошибка сервера</div>';
    });
}

function selectBlacksmithItem(item) {
    currentUpgradeItem = item;
    document.getElementById('bs-selected-area').style.display = 'block';
    
    const preview = document.getElementById('bs-preview-slot');
    let badgeHtml = parseInt(item.upgrade_level) > 0 ? `<div id="bs-anim-badge" class="bs-slot-upg-badge" style="font-size:12px; padding:3px 6px; top:-8px; right:-8px;">+${item.upgrade_level}</div>` : `<div id="bs-anim-badge" class="bs-slot-upg-badge" style="display:none; font-size:12px; padding:3px 6px; top:-8px; right:-8px;"></div>`;
    
    preview.innerHTML = `
        <img src="images/shmot/${item.img}" id="bs-anim-item" onerror="this.src='images/ui/no_image.png'">
        ${badgeHtml}
    `;
    
    updateBlacksmithUI(item);
}

function updateBlacksmithUI(item) {
    let nextLvl = parseInt(item.upgrade_level) + 1;
    let cost = 50 + (parseInt(item.upgrade_level) * 100);
    
    document.getElementById('bs-cost-val').innerText = cost;
    
    let statsHtml = `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #4a5459; padding-bottom:5px; margin-bottom:8px;">
            <span style="color:#f39c12; font-weight:bold; font-size:14px;">${item.name}</span>
            <span style="color:#ecf0f1; font-weight:bold;">Ур: <span style="color:#2ecc71">+${item.upgrade_level} ➔ +${nextLvl}</span></span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
            <span style="color:#e74c3c;">⚔️ Доп. Урон:</span> 
            <span>+${item.bonus_dmg} <span style="color:#f1948a">➔ +${parseInt(item.bonus_dmg)+1}</span></span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
            <span style="color:#2ecc71;">❤️ Доп. Здоровье:</span> 
            <span>+${item.bonus_hp} <span style="color:#82e0aa">➔ +${parseInt(item.bonus_hp)+10}</span></span>
        </div>
        <div style="display:flex; justify-content:space-between;">
            <span style="color:#3498db;">🛡️ Доп. Защита:</span> 
            <span>+${item.bonus_def} <span style="color:#85c1e9">➔ +${parseInt(item.bonus_def)+1}</span></span>
        </div>
    `;
    
    document.getElementById('bs-current-stats').innerHTML = statsHtml;
    
    // Обновляем бейджик на наковальне
    let badge = document.getElementById('bs-anim-badge');
    if (badge) {
        if (parseInt(item.upgrade_level) > 0) {
            badge.style.display = 'block';
            badge.innerText = `+${item.upgrade_level}`;
        } else {
            badge.style.display = 'none';
        }
    }
}

function performUpgrade(statType) {
    if (!currentUpgradeItem) return;
    
    let cost = 50 + (parseInt(currentUpgradeItem.upgrade_level) * 100);
    
    if(!confirm(`Улучшить параметр за ${cost} золота?`)) return;

    let fd = new FormData();
    fd.append('action', 'upgrade');
    fd.append('inv_id', currentUpgradeItem.unique_id);
    fd.append('stat_type', statType);

    fetch('php/blacksmith_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            let imgEl = document.getElementById('bs-anim-item');
            if(imgEl) {
                imgEl.classList.remove('hammer-strike');
                void imgEl.offsetWidth; 
                imgEl.classList.add('hammer-strike');
            }

            currentUpgradeItem.upgrade_level = parseInt(currentUpgradeItem.upgrade_level) + 1;
            if(statType === 'damage') currentUpgradeItem.bonus_dmg = parseInt(currentUpgradeItem.bonus_dmg) + 1;
            if(statType === 'hp') currentUpgradeItem.bonus_hp = parseInt(currentUpgradeItem.bonus_hp) + 10;
            if(statType === 'defense') currentUpgradeItem.bonus_def = parseInt(currentUpgradeItem.bonus_def) + 1;
            
            setTimeout(() => {
                updateBlacksmithUI(currentUpgradeItem);
                loadBlacksmithItems();
                if(typeof updateState === 'function') updateState();
            }, 400); 

        } else {
            alert(data.message);
        }
    })
    .catch(err => {
        alert("Ошибка связи с сервером при улучшении.");
    });
}
