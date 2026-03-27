// js/daily.js

function updateDailyIcon(isAvailable) {
    const btn = document.getElementById('btn-daily');
    if (btn) {
        if (isAvailable) {
            btn.classList.add('ready');
            btn.innerHTML = '<img src="images/ui/btn_daily.png" class="hud-btn-img" onerror="this.src=\'images/ui/no_image.png\'">';
        } else {
            btn.classList.remove('ready');
            btn.innerHTML = '<img src="images/ui/btn_daily.png" class="hud-btn-img" style="filter: grayscale(100%); opacity: 0.6;" onerror="this.src=\'images/ui/no_image.png\'">'; 
        }
    }
}

function openDailyRewards() {
    const modal = document.getElementById('daily-modal');
    modal.style.display = 'flex';
    
    const grid = document.getElementById('daily-grid');
    grid.innerHTML = '<div style="color:white; text-align:center; grid-column:span 3; padding:20px;">Загрузка...</div>';
    
    let formData = new FormData();
    formData.append('action', 'get_daily_info');

    fetch('php/daily_engine.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderDailyGrid(data.rewards, data.current_day, data.can_claim);
            if(typeof closeMenu === 'function') closeMenu();
        } else {
            grid.innerHTML = `<div style="color:red; text-align:center; grid-column:span 3; padding:20px;">${data.message}</div>`;
        }
    })
    .catch(() => {
        grid.innerHTML = '<div style="color:red; text-align:center; grid-column:span 3; padding:20px;">Ошибка связи с сервером</div>';
    });
}

function closeDailyRewards() {
    document.getElementById('daily-modal').style.display = 'none';
}

function renderDailyGrid(rewards, currentDay, canClaim) {
    const grid = document.getElementById('daily-grid');
    grid.innerHTML = '';

    rewards.forEach(rew => {
        let el = document.createElement('div');
        let dayNum = parseInt(rew.day_number);
        
        // Последний настроенный в БД день всегда будет большим (эпичным) блоком
        let isEpic = (dayNum === rewards.length);
        el.className = 'daily-cell-modern' + (isEpic ? ' epic' : '');
        
        // Статусы
        if (dayNum < currentDay) {
            el.classList.add('claimed');
        } else if (dayNum === currentDay) {
            el.classList.add('active');
        }

        let imgSrc = (rew.reward_type === 'gold') ? 'images/ui/coin.png' : ('images/shmot/' + rew.img);

        el.innerHTML = `
            <div class="daily-day-label">День ${dayNum}</div>
            <img src="${imgSrc}" class="daily-reward-img" onerror="this.src='images/ui/no_image.png'">
            <div class="daily-reward-val">${rew.name}</div>
        `;
        
        if (rew.reward_type === 'item' && typeof showItemModal === 'function') {
            el.style.cursor = 'pointer';
            let itemJson = JSON.stringify({
                name: rew.name, type: 'equip', img: rew.img, rarity: 'epic',
                description: 'Награда за ' + dayNum + '-й день!', price: 0
            }).replace(/"/g, '&quot;');
            el.onclick = () => showItemModal(JSON.parse(itemJson), 'readonly');
        }
        
        grid.appendChild(el);
    });

    const btn = document.getElementById('btn-daily-claim');
    if (canClaim) {
        btn.disabled = false;
        btn.innerText = "ЗАБРАТЬ НАГРАДУ";
        btn.onclick = () => claimDailyReward();
    } else {
        btn.disabled = true;
        btn.innerText = "СЕГОДНЯ УЖЕ ПОЛУЧЕНО";
        btn.onclick = null;
    }
}

function claimDailyReward() {
    const btn = document.getElementById('btn-daily-claim');
    btn.disabled = true;
    btn.innerText = "Загрузка...";

    let formData = new FormData();
    formData.append('action', 'claim_reward');

    fetch('php/daily_engine.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            updateDailyIcon(false);
            
            // Красивая анимация если это предмет
            if (data.is_item && typeof endBossFight === 'function') {
                document.getElementById('daily-modal').style.display = 'none';
                document.getElementById('victory-modal').style.display = 'flex';
                document.getElementById('victory-loot-text').innerHTML = `<div style="color:#E1BEE7; font-size:18px; font-weight:bold; margin-top:10px;">${data.message}</div>`;
            } else {
                alert(data.message);
                openDailyRewards(); // Перезагружаем окно
            }
            
            if(typeof updateState === 'function') updateState();
        } else {
            alert(data.message);
            btn.disabled = false;
            btn.innerText = "ЗАБРАТЬ НАГРАДУ";
        }
    });
}
