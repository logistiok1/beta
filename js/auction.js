// js/auction.js
let currentAucTab = 'equip';
let currentAucSubFilter = 'all';

// Переменные для модального окна покупки части ресурсов
let currentBuyLotId = null;
let currentBuyMaxQty = 1;
let currentBuyUnitPrice = 0;

function openAuction() {
    document.getElementById('auction-modal').style.display = 'flex';
    switchAucTab('equip');
    if(typeof closeMenu === 'function') closeMenu();
}

function closeAuction() {
    document.getElementById('auction-modal').style.display = 'none';
}

function switchAucTab(tab) {
    currentAucTab = tab;
    document.querySelectorAll('.auc-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('atab-' + tab).classList.add('active');

    const filtersArea = document.getElementById('auction-filters');
    const listArea = document.getElementById('auction-list');
    const sellArea = document.getElementById('auction-sell-area');

    if (tab === 'sell') {
        filtersArea.style.display = 'none';
        listArea.style.display = 'none';
        sellArea.style.display = 'flex';
        loadSellInventory();
    } else {
        sellArea.style.display = 'none';
        listArea.style.display = 'flex';
        
        if (tab === 'my') {
            filtersArea.style.display = 'none';
            loadAuctionList();
        } else {
            filtersArea.style.display = 'flex';
            renderFilters(tab);
            loadAuctionList();
        }
    }
}

function renderFilters(tab) {
    const fArea = document.getElementById('auction-filters');
    fArea.innerHTML = '';
    currentAucSubFilter = 'all';
    
    let filters = [];
    if (tab === 'equip') filters = [{id:'all', name:'Всё'}, {id:'weapon', name:'Оружие'}, {id:'body', name:'Броня'}, {id:'head', name:'Шлемы'}, {id:'legs', name:'Ноги'}];
    
    filters.forEach(f => {
        let b = document.createElement('button');
        b.className = 'auc-filter-btn' + (f.id === 'all' ? ' active' : '');
        b.innerText = f.name;
        b.onclick = () => {
            document.querySelectorAll('.auc-filter-btn').forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
            currentAucSubFilter = f.id;
            loadAuctionList();
        };
        fArea.appendChild(b);
    });
}

function loadAuctionList() {
    const list = document.getElementById('auction-list');
    list.innerHTML = '<div style="color:#777; text-align:center; padding:20px;">Загрузка...</div>';

    let fd = new FormData();
    if (currentAucTab === 'my') {
        fd.append('action', 'get_my_lots');
    } else {
        fd.append('action', 'get_lots');
        fd.append('tab', currentAucTab);
        fd.append('sub', currentAucSubFilter);
    }

    fetch('php/auction_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        list.innerHTML = '';
        if (data.status === 'success') {
            if (data.lots.length === 0) {
                list.innerHTML = '<div style="color:#777; text-align:center; padding:20px;">Лотов не найдено</div>';
                return;
            }
            data.lots.forEach(lot => renderLot(lot, list));
        }
    });
}

function renderLot(lot, container) {
    let el = document.createElement('div');
    el.className = 'auc-item';
    
    let imgPath = lot.item_type === 'material' ? `images/res/${lot.img}` : `images/shmot/${lot.img}`;
    let upgHtml = lot.upgrade_level > 0 ? `<div class="auc-item-upg">+${lot.upgrade_level}</div>` : '';
    
    let statsHtml = '';
    if (lot.item_type !== 'material') {
        if (lot.bonus_dmg > 0) statsHtml += `⚔️+${lot.bonus_dmg} `;
        if (lot.bonus_hp > 0) statsHtml += `❤️+${lot.bonus_hp} `;
        if (lot.bonus_def > 0) statsHtml += `🛡+${lot.bonus_def}`;
    }

    // ИСПРАВЛЕНИЕ: Формируем JSON предмета для окна Инфо
    let itemJson = JSON.stringify({
        unique_id: lot.id, 
        name: lot.name,
        type: lot.item_type,
        img: lot.img,
        rarity: lot.rarity || 'common',
        description: lot.description || 'Нет описания',
        damage: lot.damage || 0,
        defense: lot.defense || 0,
        hp_bonus: lot.hp_bonus || 0,
        upgrade_level: lot.upgrade_level || 0,
        bonus_dmg: lot.bonus_dmg || 0,
        bonus_hp: lot.bonus_hp || 0,
        bonus_def: lot.bonus_def || 0,
        price: 0
    }).replace(/"/g, '&quot;');

    // Кнопка Купить / Снять
    let btnHtml = '';
    if (currentAucTab === 'my') {
        btnHtml = `<button class="btn-auc-cancel" onclick="cancelLot(${lot.id})">СНЯТЬ</button>`;
    } else {
        if (lot.item_type === 'material' && parseInt(lot.quantity) > 1) {
            let unitPrice = Math.floor(lot.price / lot.quantity);
            btnHtml = `<button class="btn-auc-buy" onclick="openAucBuyModal(${lot.id}, '${lot.name}', ${lot.quantity}, ${unitPrice})">КУПИТЬ</button>`;
        } else {
            btnHtml = `<button class="btn-auc-buy" onclick="buyLotDirect(${lot.id}, ${lot.price})">КУПИТЬ</button>`;
        }
    }

    let qtyText = lot.quantity > 1 ? ` <span style="color:#aaa;">x${lot.quantity}</span>` : '';

    // ИСПРАВЛЕНИЕ: Добавлен onclick="showItemModal(...)" на иконку
    el.innerHTML = `
        <div class="auc-item-icon rarity-${lot.rarity}" onclick="showItemModal(JSON.parse('${itemJson}'), 'readonly')" style="cursor:pointer;" title="Нажмите, чтобы посмотреть инфо">
            <img src="${imgPath}" onerror="this.src='images/ui/no_image.png'">
            ${upgHtml}
        </div>
        <div class="auc-item-info">
            <div class="auc-item-name">${lot.name}${qtyText}</div>
            ${statsHtml ? `<div class="auc-item-stats">${statsHtml}</div>` : ''}
            ${currentAucTab !== 'my' ? `<div class="auc-item-seller">Продавец: ${lot.seller_name}</div>` : ''}
        </div>
        <div class="auc-item-price">
            <div class="auc-price-val">${lot.price} 💰</div>
            ${btnHtml}
        </div>
    `;
    container.appendChild(el);
}

// === НОВОЕ: Окно частичной покупки ресурсов ===
function openAucBuyModal(id, name, maxQty, unitPrice) {
    currentBuyLotId = id;
    currentBuyMaxQty = maxQty;
    currentBuyUnitPrice = unitPrice;

    document.getElementById('auc-buy-info').innerText = `${name} (В лоте: ${maxQty} шт.)\nЦена за 1 шт: ${unitPrice} 💰`;
    
    const qtyInput = document.getElementById('auc-buy-qty-input');
    qtyInput.max = maxQty;
    qtyInput.value = 1;
    calcAucBuyPrice();

    document.getElementById('auc-buy-modal').style.display = 'flex';
}

function closeAucBuyModal() {
    document.getElementById('auc-buy-modal').style.display = 'none';
}

function calcAucBuyPrice() {
    let qty = parseInt(document.getElementById('auc-buy-qty-input').value) || 1;
    if (qty > currentBuyMaxQty) qty = currentBuyMaxQty;
    if (qty < 1) qty = 1;
    let cost = qty * currentBuyUnitPrice;
    document.getElementById('auc-buy-total').innerText = `К оплате: ${cost} 💰`;
}

function confirmAucBuy() {
    let qty = parseInt(document.getElementById('auc-buy-qty-input').value) || 1;
    if (qty > currentBuyMaxQty || qty < 1) return;

    processBuy(currentBuyLotId, qty);
    closeAucBuyModal();
}

function buyLotDirect(id, price) {
    if(!confirm(`Купить этот лот за ${price} золота?`)) return;
    processBuy(id, 1); // 1 = весь лот (экипировка)
}

function processBuy(id, qty) {
    let fd = new FormData();
    fd.append('action', 'buy');
    fd.append('lot_id', id);
    fd.append('qty', qty); // Передаем количество на сервер
    
    fetch('php/auction_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        alert(d.message);
        if(d.status === 'success') { loadAuctionList(); if(typeof updateState === 'function') updateState(); }
    });
}
// ===============================================

function cancelLot(id) {
    if(!confirm(`Вернуть этот лот себе?`)) return;
    let fd = new FormData(); fd.append('action', 'cancel'); fd.append('lot_id', id);
    fetch('php/auction_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        alert(d.message);
        if(d.status === 'success') { loadAuctionList(); if(typeof updateState === 'function') updateState(); }
    });
}

// === ПРОДАЖА ===
let sellInvData = [];
function loadSellInventory() {
    let fd = new FormData(); fd.append('action', 'get_inventory'); fd.append('tab', 'main');
    fetch('php/inventory_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(dMain => {
        let fd2 = new FormData(); fd2.append('action', 'get_inventory'); fd2.append('tab', 'resources');
        fetch('php/inventory_engine.php', { method: 'POST', body: fd2 }).then(r=>r.json()).then(dRes => {
            sellInvData = dMain.inventory.concat(dRes.inventory);
            
            let sel = document.getElementById('auc-sell-item');
            sel.innerHTML = '<option value="0">-- Выберите предмет --</option>';
            sellInvData.forEach(i => {
                let txt = i.name + (i.upgrade_level > 0 ? ` (+${i.upgrade_level})` : '') + (i.type === 'material' ? ` (В наличии: ${i.quantity})` : '');
                sel.innerHTML += `<option value="${i.unique_id}">${txt}</option>`;
            });
            updateSellForm();
        });
    });
}

function updateSellForm() {
    let selId = document.getElementById('auc-sell-item').value;
    let item = sellInvData.find(i => i.unique_id == selId);
    let qtyWrap = document.getElementById('auc-sell-qty-wrap');
    
    if (item && item.type === 'material') {
        qtyWrap.style.display = 'block';
        document.getElementById('auc-sell-qty').max = item.quantity;
        document.getElementById('auc-sell-qty').value = item.quantity;
        document.getElementById('auc-price-label').innerText = 'Цена за 1 шт:';
    } else {
        qtyWrap.style.display = 'none';
        document.getElementById('auc-sell-qty').value = 1;
        document.getElementById('auc-price-label').innerText = 'Общая цена:';
    }
}

function submitSell() {
    let invId = document.getElementById('auc-sell-item').value;
    let qty = document.getElementById('auc-sell-qty').value;
    let price = document.getElementById('auc-sell-price').value;
    
    if (invId == 0 || price <= 0 || qty <= 0) { alert('Заполните все поля!'); return; }
    
    let fd = new FormData();
    fd.append('action', 'sell');
    fd.append('inv_id', invId);
    fd.append('qty', qty);
    fd.append('price', price);

    fetch('php/auction_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(d => {
        alert(d.message);
        if(d.status === 'success') {
            document.getElementById('auc-sell-price').value = '';
            loadSellInventory(); 
            if(typeof updateState === 'function') updateState();
        }
    });
}