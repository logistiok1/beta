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
    grid.innerHTML = '<div style="color:#777; width:100%; text-align:center;">Загрузка...</div>';
    
    // Скрываем область выбора
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
                grid.innerHTML = '<div style="color:#777; grid-column:span 4; text-align:center;">Нет предметов для заточки</div>';
                return;
            }
            
            data.items.forEach(item => {
                let el = document.createElement('div');
                el.className = 'inv-slot rarity-' + (item.rarity || 'common');
                let imgPath = 'images/shmot/' + item.img;
                
                let upgText = parseInt(item.upgrade_level) > 0 ? `<div style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.7); font-size:10px; padding:1px 3px; border-radius:3px;">+${item.upgrade_level}</div>` : '';
                
                el.innerHTML = `<img src="${imgPath}" onerror="this.src='images/ui/no_image.png'">${upgText}`;
                el.onclick = () => selectBlacksmithItem(item);
                grid.appendChild(el);
            });
        } else {
            grid.innerHTML = `<div style="color:red; grid-column:span 4; text-align:center;">${data.message}</div>`;
        }
    });
}

function selectBlacksmithItem(item) {
    currentUpgradeItem = item;
    document.getElementById('bs-selected-area').style.display = 'flex';
    
    let imgPath = 'images/shmot/' + item.img;
    document.getElementById('bs-preview-img').src = imgPath;
    
    document.getElementById('bs-item-name').innerText = item.name;
    document.getElementById('bs-item-name').className = 'rarity-' + (item.rarity || 'common');
    
    let nextLvl = parseInt(item.upgrade_level) + 1;
    let cost = 50 + (parseInt(item.upgrade_level) * 100);
    
    document.getElementById('bs-cost-val').innerText = cost;
    
    let statsHtml = `Уровень: +${item.upgrade_level} <span style="color:#00e676">➔ +${nextLvl}</span><br>`;
    statsHtml += `Доп. Урон: ${item.bonus_dmg}<br>`;
    statsHtml += `Доп. Здоровье: ${item.bonus_hp}<br>`;
    statsHtml += `Доп. Защита: ${item.bonus_def}`;
    
    document.getElementById('bs-current-stats').innerHTML = statsHtml;
}

function performUpgrade(statType) {
    if (!currentUpgradeItem) return;
    
    let cost = 50 + (parseInt(currentUpgradeItem.upgrade_level) * 100);
    
    if(!confirm(`Заточить предмет за ${cost} золота?`)) return;

    let fd = new FormData();
    fd.append('action', 'upgrade');
    fd.append('inv_id', currentUpgradeItem.unique_id);
    fd.append('stat_type', statType);

    fetch('php/blacksmith_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            // ИСПРАВЛЕНИЕ: Теперь new_level приходит корректно
            alert("Предмет успешно заточен на +" + data.new_level);
            
            document.getElementById('bs-selected-area').style.display = 'none';
            currentUpgradeItem = null;
            
            loadBlacksmithItems(); // Обновляем список вещей
            if(typeof updateState === 'function') updateState(); // Обновляем золото на экране
        } else {
            alert(data.message);
        }
    });
}
