// === js/promotions.js ===

window.promoQueue = [];
window.isPromoActive = false;

window.checkPromotions = function() {
    fetch('php/get_promotions.php')
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success' && data.offers && data.offers.length > 0) {
            window.promoQueue = data.offers;
            showNextPromo();
        }
    }).catch(e => console.error("Promo error:", e));
};

window.showNextPromo = function() {
    // Если очередь пуста - закрываем окно
    if (window.promoQueue.length === 0) {
        let overlay = document.getElementById('promo-overlay');
        if (overlay) overlay.style.display = 'none';
        window.isPromoActive = false;
        return;
    }

    window.isPromoActive = true;
    
    // Достаем первую акцию из очереди
    let offer = window.promoQueue.shift();

    let overlay = document.getElementById('promo-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'promo-overlay';
        document.body.appendChild(overlay);
    }

    // Собираем HTML (фон наложено на само окно!)
    let bgImg = offer.bg_image ? `images/${offer.bg_image}` : `images/ui/promo_default.jpg`;
    
    let html = `
        <div class="promo-window" style="background-image: url('${bgImg}');">
            <div class="promo-overlay-bg"></div>
            
            <div class="promo-content">
                <button class="promo-close-btn" onclick="showNextPromo()">✖</button>
                <div class="promo-header-bg">
                    <div class="promo-title">${offer.title}</div>
                </div>
                <div class="promo-body">
                    <div class="promo-items-container" id="promo-items-box"></div>
                    
                    <div class="promo-price-section">
                        <div class="promo-old-price">${offer.old_price} <img src="images/ui/coin.png" class="promo-coin-img"></div>
                        <div style="color: #fff; font-weight: bold; font-size: 20px;">➡️</div>
                        <div class="promo-new-price">${offer.new_price} <img src="images/ui/coin.png" class="promo-coin-img"></div>
                    </div>
                    
                    <button class="promo-buy-btn" onclick="buyPromo(${offer.id})">Купить по скидке</button>
                </div>
            </div>
        </div>
    `;
    
    overlay.innerHTML = html;
    
    // Аккуратно вставляем предметы и вешаем клики для показа инфы (showItemModal)
    let itemsBox = document.getElementById('promo-items-box');
    offer.items.forEach(item => {
        let rarityClass = item.rarity ? `rarity-${item.rarity}` : 'rarity-common';
        let folder = item.type === 'material' ? 'res' : 'shmot';
        
        let slot = document.createElement('div');
        slot.className = `promo-item-slot ${rarityClass}`;
        slot.innerHTML = `
            <img src="images/${folder}/${item.img}" onerror="this.src='images/res/${item.img}'">
            ${item.quantity > 1 ? `<div class="promo-item-qty">x${item.quantity}</div>` : ''}
        `;
        
        // Вызываем твое модальное окно предметов!
        slot.onclick = () => {
            if(typeof showItemModal === 'function') {
                showItemModal(item, "readonly");
            }
        };
        itemsBox.appendChild(slot);
    });

    overlay.style.display = 'flex';
};

window.buyPromo = function(offerId) {
    let fd = new FormData();
    fd.append('offer_id', offerId);

    fetch('php/buy_promotion.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            showNextPromo(); // Переходим к следующей акции
        } else {
            alert(data.message);
        }
    }).catch(e => alert("Ошибка сети"));
};
