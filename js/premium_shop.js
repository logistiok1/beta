// js/premium_shop.js
let currentPShopTab = 'promo';
let promoTimers = [];

function openPremiumShop() {
    document.getElementById('premium-shop-modal').style.display = 'flex';
    switchPShopTab('promo');
    if(typeof closeMenu === 'function') closeMenu();
}

function closePremiumShop() {
    document.getElementById('premium-shop-modal').style.display = 'none';
    promoTimers.forEach(t => clearInterval(t));
}

function switchPShopTab(tab) {
    currentPShopTab = tab;
    document.querySelectorAll('.ps-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('pstab-' + tab).classList.add('active');
    loadPremiumShop();
}

function loadPremiumShop() {
    promoTimers.forEach(t => clearInterval(t));
    promoTimers = [];
    
    const grid = document.getElementById('pshop-grid');
    grid.innerHTML = '<div style="color:#777; grid-column:span 2; text-align:center;">Загрузка...</div>';

    let fd = new FormData();
    fd.append('action', 'get_shop');
    fd.append('tab', currentPShopTab);

    fetch('php/premium_shop_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('pshop-valor-val').innerText = data.valor;
            grid.innerHTML = '';
            
            if(data.items.length === 0) {
                grid.innerHTML = '<div style="color:#777; grid-column:span 2; text-align:center;">Товаров нет</div>';
                return;
            }

            data.items.forEach(item => {
                let el = document.createElement('div');
                el.className = 'pshop-card';
                
                let imgPath = `images/shmot/${item.img}`; 
                if(item.type === 'outfit' || item.type === 'background') imgPath = `images/shmot/${item.img}`;
                else if(item.type === 'pet') imgPath = `images/pets/${item.img}`;
                else if(item.type === 'material') imgPath = `images/res/${item.img}`;

                let timerHtml = '';
                if (currentPShopTab === 'promo' && item.promo_end > 0) {
                    let left = item.promo_end - data.server_time;
                    if (left > 0) {
                        timerHtml = `<div class="pshop-timer" id="ptimer-${item.id}">⏳ Вычисляем...</div>`;
                        startPromoTimer(item.id, left);
                    } else {
                        timerHtml = `<div class="pshop-timer" style="color:#777;">Акция окончена</div>`;
                    }
                }

                let priceHtml = '';
                if (item.old_price > 0) {
                    priceHtml += `<div class="pshop-old-price">${item.old_price}</div>`;
                }
                priceHtml += `<div class="pshop-new-price">${item.price} <img src="images/ui/valor.png" onerror="this.outerHTML='💎'"></div>`;

                let itemJson = JSON.stringify({
                    name: item.name, type: item.type, img: item.img, rarity: item.rarity || 'epic',
                    description: item.description || '', price: 0
                }).replace(/"/g, '&quot;');

                // ИСПРАВЛЕНИЕ: Если куплено - серая кнопка
                let btnHtml = '';
                if (item.is_bought) {
                    btnHtml = `<button class="btn-pshop-buy" style="background:#555; color:#aaa; cursor:not-allowed;" disabled>КУПЛЕНО</button>`;
                } else {
                    btnHtml = `<button class="btn-pshop-buy" onclick="buyPremiumItem(${item.id}, ${item.price})">КУПИТЬ</button>`;
                }

                el.innerHTML = `
                    <div class="pshop-card-icon rarity-${item.rarity}" onclick="showItemModal(JSON.parse('${itemJson}'), 'readonly')">
                        <img src="${imgPath}" onerror="this.src='images/ui/no_image.png'">
                    </div>
                    <div class="pshop-card-name">${item.name}</div>
                    ${timerHtml}
                    <div class="pshop-price-box">${priceHtml}</div>
                    ${btnHtml}
                `;
                grid.appendChild(el);
            });
        }
    });
}

function startPromoTimer(id, secondsLeft) {
    let left = secondsLeft;
    let t = setInterval(() => {
        left--;
        let el = document.getElementById(`ptimer-${id}`);
        if (!el) { clearInterval(t); return; }
        
        if (left <= 0) {
            el.innerText = "Акция окончена";
            el.style.color = '#777';
            clearInterval(t);
        } else {
            let h = Math.floor(left / 3600);
            let m = Math.floor((left % 3600) / 60);
            let s = left % 60;
            el.innerText = `⏳ ${h}ч ${m}м ${s}с`;
        }
    }, 1000);
    promoTimers.push(t);
}

function buyPremiumItem(shopId, price) {
    if(!confirm(`Купить товар за ${price} Валора?`)) return;
    
    let fd = new FormData();
    fd.append('action', 'buy_item');
    fd.append('shop_id', shopId);

    fetch('php/premium_shop_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') loadPremiumShop();
    });
}
