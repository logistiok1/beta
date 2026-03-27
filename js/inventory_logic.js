// js/inventory_logic.js v136 (Fixes: Coin image & Layout)
console.log("Inventory Logic Loaded");

window.currentItemData = null; 
let currentInvTab = 'main'; 

function openInventory() {
    currentInvTab = 'main';
    updateInvTabsUI();
    loadInventoryData();
    document.getElementById('inventory-modal').style.display = 'flex';
    if(typeof closeMenu === 'function') closeMenu();
}

function switchInvTab(tab) {
    currentInvTab = tab;
    updateInvTabsUI();
    loadInventoryData();
}

function updateInvTabsUI() {
    document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
    
    let tabId = 'inv-tab-main';
    if (currentInvTab === 'resources') tabId = 'inv-tab-res';
    if (currentInvTab === 'misc') tabId = 'inv-tab-misc';
    
    let activeBtn = document.getElementById(tabId);
    if(activeBtn) activeBtn.classList.add('active');
}

function loadInventoryData() {
    const grid = document.getElementById('inv-grid-container');
    grid.innerHTML = '<div style="color:#777; grid-column:span 4; text-align:center; padding:20px;">Загрузка...</div>';

    let formData = new FormData();
    formData.append('action', 'get_inventory');
    formData.append('tab', currentInvTab);

    fetch('php/inventory_engine.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderInventoryGrid(data.inventory);
        } else {
            grid.innerHTML = '<div style="color:red; grid-column:span 4; text-align:center;">Ошибка загрузки</div>';
        }
    })
    .catch(err => console.error(err));
}

function renderInventoryGrid(items) {
    const grid = document.getElementById('inv-grid-container');
    grid.innerHTML = ''; 

    for(let i=0; i<12; i++) {
        let slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.style.position = 'relative';

        if (items[i]) {
            let item = items[i];
            let img = document.createElement('img');
            
            let folder = (item.type === 'material') ? 'images/res/' : 'images/shmot/';
            let src = item.img.includes('/') ? item.img : (folder + item.img);
            
            img.src = src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.onerror = function() { 
                this.src = 'images/shmot/default.png'; 
                this.style.opacity = '0.3';
            };
            
            slot.classList.add('rarity-' + (item.rarity || 'common'));
            slot.appendChild(img);

            if (item.is_equipped == 1) {
                let eqBadge = document.createElement('div');
                eqBadge.style.cssText = 'position:absolute; top:2px; left:2px; background:#4CAF50; color:white; font-size:10px; font-weight:bold; padding:1px 4px; border-radius:4px; z-index:5; box-shadow:0 0 3px #000;';
                eqBadge.innerText = 'E';
                slot.appendChild(eqBadge);
                slot.style.borderColor = '#4CAF50';
            } 
            else if (item.upgrade_level && parseInt(item.upgrade_level) > 0 && currentInvTab === 'main') {
                let badge = document.createElement('div');
                badge.style.cssText = 'position:absolute; top:2px; right:2px; background:rgba(211,47,47,0.9); color:white; font-size:10px; font-weight:bold; padding:1px 4px; border-radius:4px; border:1px solid #ff5252; box-shadow:0 0 5px #000; z-index:5;';
                badge.innerText = '+' + item.upgrade_level;
                slot.appendChild(badge);
            }

            if (item.quantity > 1) {
                let qtyBadge = document.createElement('div');
                qtyBadge.className = 'item-qty-badge';
                qtyBadge.innerText = item.quantity;
                slot.appendChild(qtyBadge);
            }

            slot.onclick = () => showItemModal(item, false); 
        } else {
            slot.style.opacity = '0.2';
            slot.style.cursor = 'default';
        }
        grid.appendChild(slot);
    }
}

window.showItemModal = function(item, mode) {
    window.currentItemData = item;
    const modal = document.getElementById('item-modal');
    
    document.getElementById('modal-item-name').innerHTML = item.name;
    document.getElementById('modal-item-name').className = 'item-name rarity-' + (item.rarity || 'common');
    
    let tName = item.type;
    const types = {
        'weapon': 'Оружие', 'head': 'Шлем', 'body': 'Броня', 
        'legs': 'Поножи', 'amulet': 'Амулет', 'ring': 'Кольцо', 
        'material': 'Ресурс', 'outfit': 'Костюм', 'background': 'Фон профиля'
    };
    if (types[item.type]) tName = types[item.type];
    document.getElementById('modal-item-type').innerText = tName;
    
    // ИСПРАВЛЕНИЕ: Иконка золота вместо эмодзи
    let stats = `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:8px; margin-bottom:8px;">
                    <span style="color:#aaa;">Стоимость:</span> 
                    <span style="color:gold; font-weight:bold; font-size:16px; display:flex; align-items:center; gap:4px;">${item.price} <img src="images/ui/coin.png" style="width:16px; height:16px; object-fit:contain;"></span>
                 </div>`;
    
    if (item.type !== 'material' && item.type !== 'outfit' && item.type !== 'background') {
        let dmg = parseInt(item.damage||0) + (parseInt(item.bonus_dmg)||0);
        let def = parseInt(item.defense||0) + (parseInt(item.bonus_def)||0);
        let hp  = parseInt(item.hp_bonus||0) + (parseInt(item.bonus_hp)||0);

        if(dmg > 0) stats += `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Урон:</span> <span style="color:white; font-weight:bold;">${dmg} <span style="color:#777; font-size:11px; font-weight:normal;">(${item.damage||0}+${item.bonus_dmg||0})</span> ⚔️</span></div>`;
        if(def > 0) stats += `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Защита:</span> <span style="color:white; font-weight:bold;">${def} <span style="color:#777; font-size:11px; font-weight:normal;">(${item.defense||0}+${item.bonus_def||0})</span> 🛡️</span></div>`;
        if(hp > 0)  stats += `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Здоровье:</span> <span style="color:white; font-weight:bold;">${hp} <span style="color:#777; font-size:11px; font-weight:normal;">(${item.hp_bonus||0}+${item.bonus_hp||0})</span> ❤️</span></div>`;
    } else if (item.type === 'material') {
        stats += `<div style="display:flex; justify-content:space-between;"><span>В наличии:</span> <span style="color:white; font-weight:bold;">${item.quantity} шт.</span></div>`;
        stats += `<div style="color:#888; font-size:12px; margin-top:8px; text-align:center;">Ресурс для крафта или обмена</div>`;
    } else if (item.type === 'outfit') {
        stats += `<div style="color:#00BCD4; font-size:12px; text-align:center; margin-top:8px;">Изменяет внешний вид героя</div>`;
    } else if (item.type === 'background') {
        stats += `<div style="color:#00BCD4; font-size:12px; text-align:center; margin-top:8px;">Изменяет задний фон профиля</div>`;
    }
    
    document.getElementById('modal-item-stats').innerHTML = stats;
    
    let folder = (item.type === 'material') ? 'images/res/' : 'images/shmot/';
    let src = item.img.includes('/') ? item.img : (folder + item.img);
    document.getElementById('modal-item-img').src = src;
    
    let imgContainer = document.querySelector('.item-img-lg');
    let existingBadge = imgContainer.querySelector('.modal-upg-badge');
    if (existingBadge) existingBadge.remove();
    
    if (item.upgrade_level > 0 && item.type !== 'material' && item.type !== 'outfit' && item.type !== 'background') {
        let badge = document.createElement('div');
        badge.className = 'modal-upg-badge';
        badge.innerText = '+' + item.upgrade_level;
        imgContainer.appendChild(badge);
    }
    
    document.getElementById('modal-item-desc').innerText = item.description || 'Описание отсутствует...';

    const btnAction = document.getElementById('btn-item-action');
    const btnDrop = document.getElementById('btn-item-drop');
    const btnClose = document.querySelector('.btn-close-item'); 

    if (btnClose) btnClose.onclick = window.closeItemModal;

    let newBtnAction = btnAction.cloneNode(true);
    let newBtnDrop = btnDrop.cloneNode(true);
    btnAction.parentNode.replaceChild(newBtnAction, btnAction);
    btnDrop.parentNode.replaceChild(newBtnDrop, btnDrop);

    if (mode === 'readonly') {
        newBtnAction.style.display = 'none'; 
        newBtnDrop.style.display = 'none';
    } else {
        if (item.is_equipped == 1 || mode === 'equipped') {
            newBtnAction.innerText = "Снять";
            newBtnAction.style.display = 'block';
            newBtnAction.onclick = unequipCurrentItem;
            newBtnDrop.style.display = 'none'; 
        } else {
            newBtnAction.innerText = "Одеть";
            if(item.type === 'material' || ['consumable', 'misc'].includes(item.type)) {
                 newBtnAction.style.display = 'none';
            } else {
                 newBtnAction.style.display = 'block';
                 newBtnAction.onclick = equipCurrentItem;
            }
            newBtnDrop.style.display = 'block';
            newBtnDrop.onclick = dropCurrentItem;
        }
    }
    
    modal.style.display = 'flex';
};

window.closeItemModal = function() {
    document.getElementById('item-modal').style.display = 'none';
    window.currentItemData = null;
};

function refreshUIAfterItemAction() {
    const inv = document.getElementById('inventory-modal');
    const prof = document.getElementById('profile-modal');

    if (inv && window.getComputedStyle(inv).display !== 'none') loadInventoryData();
    if (prof && window.getComputedStyle(prof).display !== 'none') { if(typeof openProfile === 'function') openProfile(); }
    if(typeof updateState === 'function') updateState(); 
}

function equipCurrentItem() {
    let item = window.currentItemData; if(!item) return;
    closeItemModal(); 
    let fd = new FormData(); fd.append('action', 'equip'); fd.append('inv_id', item.unique_id); 
    fetch('php/inventory_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status==='success'){ refreshUIAfterItemAction(); } else alert(d.message);
    });
}

function unequipCurrentItem() {
    let item = window.currentItemData; if(!item) return;
    closeItemModal(); 
    let fd = new FormData(); fd.append('action', 'unequip'); fd.append('inv_id', item.unique_id); 
    fetch('php/inventory_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status==='success'){ refreshUIAfterItemAction(); } else alert(d.message);
    });
}

function dropCurrentItem() {
    let item = window.currentItemData; if(!item) return;
    if(!confirm('Выбросить этот предмет навсегда?')) return;
    closeItemModal(); 
    let fd = new FormData(); fd.append('action', 'drop'); fd.append('inv_id', item.unique_id);
    fetch('php/inventory_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
        if(d.status==='success'){ refreshUIAfterItemAction(); } else alert(d.message);
    });
}