// js/arena.js

function openArena() {
    document.getElementById('arena-modal').style.display = 'flex';
    loadArenaData();
    if(typeof closeMenu === 'function') closeMenu();
}

function closeArena() {
    document.getElementById('arena-modal').style.display = 'none';
}

let energyTimerInterval = null;

function loadArenaData() {
    const list = document.getElementById('arena-opp-list');
    list.innerHTML = '<div style="text-align:center; color:#777; padding:20px;">Поиск противников...</div>';

    let fd = new FormData();
    fd.append('action', 'get_arena');

    fetch('php/arena_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            let l = data.user.arena_league || 1;
            let p = data.user.arena_points || 0;
            let e = data.user.arena_energy || 0;
            let eLeft = data.user.energy_regen_left || 0;
            
            // НОВОЕ: подставляем название лиги и картинку, которые пришли с сервера
            let lName = data.user.league_name || `Лига ${l}`;
            let lImg = data.user.league_img || 'no_image.png';

            document.getElementById('arena-league-img').src = 'images/ui/' + lImg;
            document.getElementById('arena-league-name').innerText = lName;
            document.getElementById('arena-league-text').innerText = `${p} / 5 Очков`;
            document.getElementById('arena-league-fill').style.width = (p / 5 * 100) + '%';
            
            // ЭНЕРГИЯ
            document.getElementById('arena-energy-fill').style.width = (e / 5 * 100) + '%';
            if (e >= 5) {
                document.getElementById('arena-energy-val').innerText = '5/5';
                document.getElementById('arena-energy-timer').innerText = 'Максимум';
            } else {
                document.getElementById('arena-energy-val').innerText = `${e}/5`;
                startEnergyTimer(eLeft);
            }

            list.innerHTML = '';
            if (data.opponents.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:#777; padding:20px;">Нет подходящих игроков (Или все в КД 24ч)</div>';
            } else {
                data.opponents.forEach(opp => {
                    let el = document.createElement('div');
                    el.className = 'arena-opp-card';
                    el.innerHTML = `
                        <div class="opp-avatar" onclick="openProfile(${opp.id})"><img src="images/class_${opp.class_type}.png"></div>
                        <div class="opp-info">
                            <div class="opp-name">${opp.username} <span style="font-size:11px; color:#E91E63;">(Lvl ${opp.level})</span></div>
                            <div class="opp-stats">⚔️${opp.damage} | 🛡${opp.defense} | ❤️${opp.max_hp}</div>
                        </div>
                        <button class="btn-opp-fight" onclick="startArenaBattle(${opp.id})">В БОЙ</button>
                    `;
                    list.appendChild(el);
                });
            }
        } else {
            list.innerHTML = `<div style="text-align:center; color:red; padding:20px;">${data.message || 'Ошибка сервера'}</div>`;
        }
    })
    .catch(e => {
        list.innerHTML = '<div style="text-align:center; color:red; padding:20px;">Ошибка связи с сервером.</div>';
    });
}

function startEnergyTimer(seconds) {
    if (energyTimerInterval) clearInterval(energyTimerInterval);
    let left = seconds;
    const el = document.getElementById('arena-energy-timer');
    
    energyTimerInterval = setInterval(() => {
        if (left <= 0) {
            clearInterval(energyTimerInterval);
            loadArenaData(); 
            return;
        }
        let h = Math.floor(left / 3600);
        let m = Math.floor((left % 3600) / 60);
        let s = left % 60;
        el.innerText = `+1 ед. через ${h}ч ${m}м ${s}с`;
        left--;
    }, 1000);
}

// === БОЙ НА АРЕНЕ ===
let arenaOppMaxHp = 0;
let arenaOppHp = 0;
let arenaAttackCD = false;

function startArenaBattle(oppId) {
    let fd = new FormData();
    fd.append('action', 'start_battle');
    fd.append('opp_id', oppId);

    fetch('php/arena_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            closeArena();
            initArenaCombatUI(data.opp);
        } else {
            alert(data.message);
            loadArenaData(); 
        }
    });
}

function initArenaCombatUI(oppData) {
    arenaOppMaxHp = oppData.hp;
    arenaOppHp = oppData.hp;
    arenaAttackCD = false;
    window.isArenaCombat = true; 

    const combatModal = document.getElementById('combat-modal');
    combatModal.style.display = 'flex';
    document.getElementById('d-pad').style.display = 'none';

    const skillsPanel = document.getElementById('combat-skills-render');
    if (skillsPanel) skillsPanel.style.display = 'none';

    document.getElementById('combat-mob-img').src = 'images/' + oppData.img;
    document.getElementById('combat-mob-name').innerText = oppData.name; 
    document.getElementById('combat-mob-hp-bar').style.width = '100%';
    document.getElementById('combat-mob-hp-text').innerText = `${arenaOppMaxHp}/${arenaOppMaxHp}`;
    document.getElementById('combat-log-box').innerHTML = '<div style="color:#E91E63; text-align:center; font-weight:bold;">ПВП АРЕНА: НАЧАЛО БОЯ!</div>';

    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '1';
        atkBtn.style.pointerEvents = 'auto';
        let newBtn = atkBtn.cloneNode(true);
        atkBtn.parentNode.replaceChild(newBtn, atkBtn);
        newBtn.onclick = performArenaAttack;
    }
}

function performArenaAttack() {
    if (arenaAttackCD) return;

    arenaAttackCD = true;
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '0.4'; atkBtn.style.pointerEvents = 'none';
        setTimeout(() => {
            arenaAttackCD = false;
            if (atkBtn) { atkBtn.style.opacity = '1'; atkBtn.style.pointerEvents = 'auto'; }
        }, 2000);
    }

    const pWrap = document.getElementById('combat-player-wrap');
    const mWrap = document.getElementById('combat-mob-wrap');
    pWrap.classList.add('anim-attack-right');
    setTimeout(() => pWrap.classList.remove('anim-attack-right'), 300);
    setTimeout(() => {
        mWrap.classList.add('anim-hurt'); setTimeout(() => mWrap.classList.remove('anim-hurt'), 400);
    }, 150);

    let fd = new FormData();
    fd.append('action', 'attack');

    fetch('php/arena_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            arenaOppHp = data.opp_hp;
            let pct = (arenaOppHp / arenaOppMaxHp) * 100;
            document.getElementById('combat-mob-hp-bar').style.width = Math.max(0, pct) + '%';
            document.getElementById('combat-mob-hp-text').innerText = `${arenaOppHp}/${arenaOppMaxHp}`;
            
            logCombat(`Вы ударили: <span style="color:#4CAF50">${data.dmg}</span>`);

            if (data.dmg_taken > 0) {
                const sc = document.getElementById('game-screen');
                sc.classList.add('damaged'); setTimeout(()=>sc.classList.remove('damaged'), 300);
                document.getElementById('combat-player-hp-text').innerText = `${data.user_hp}`;
                
                mWrap.classList.add('anim-attack-left'); setTimeout(() => mWrap.classList.remove('anim-attack-left'), 300);
                logCombat(`Враг ударил в ответ: <span style="color:#f44336">${data.dmg_taken}</span>`);
            }

            if (data.user_dead) {
                document.getElementById('combat-modal').style.display = 'none';
                alert("ВЫ ПРОИГРАЛИ! Очки лиги потеряны.");
                location.reload();
            }

            if (data.dead) {
                endArenaCombat(data.msg);
            }

        } else {
             alert(data.message); 
             endArenaCombat("Ошибка");
        }
    });
}

function endArenaCombat(resultMsg) {
    document.getElementById('combat-modal').style.display = 'none';
    window.isArenaCombat = false;
    arenaAttackCD = false;

    const skillsPanel = document.getElementById('combat-skills-render');
    if (skillsPanel) skillsPanel.style.display = 'flex';
    
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '1'; atkBtn.style.pointerEvents = 'auto';
        let newBtn = atkBtn.cloneNode(true);
        atkBtn.parentNode.replaceChild(newBtn, atkBtn);
        if (window.attackMob) newBtn.onclick = window.attackMob; 
    }

    document.getElementById('victory-modal').style.display = 'flex';
    document.getElementById('victory-loot-text').innerHTML = resultMsg;
    if(typeof updateState === 'function') updateState();
}

// === МАГАЗИН АРЕНЫ ===
function openArenaShop() {
    document.getElementById('arena-shop-modal').style.display = 'flex';
    const list = document.getElementById('arena-shop-grid');
    list.innerHTML = '<div style="color:#777; grid-column:span 3; text-align:center;">Загрузка...</div>';

    let fd = new FormData();
    fd.append('action', 'get_shop');

    fetch('php/arena_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('shop-coins-val').innerText = data.coins || 0;
            list.innerHTML = '';
            
            data.items.forEach(item => {
                let div = document.createElement('div');
                div.className = 'shop-item-card';
                let imgPath = item.type === 'material' ? `images/res/${item.img}` : `images/shmot/${item.img}`;
                let itemJson = JSON.stringify({
                    name: item.name, type: item.type, img: item.img, rarity: item.rarity || 'common',
                    description: item.description || 'Награда Арены', damage: item.damage||0, defense: item.defense||0, hp_bonus: item.hp_bonus||0, price: 0
                }).replace(/"/g, '&quot;');

                div.innerHTML = `
                    <div class="shop-item-icon rarity-${item.rarity}" onclick="showItemModal(JSON.parse('${itemJson}'), 'readonly')">
                        <img src="${imgPath}" onerror="this.src='images/ui/no_image.png'">
                    </div>
                    <div class="shop-item-price">${item.price} 🪙</div>
                    <button class="btn-shop-buy" onclick="buyArenaItem(${item.shop_id}, ${item.price})">КУПИТЬ</button>
                `;
                list.appendChild(div);
            });
        }
    });
}

function closeArenaShop() {
    document.getElementById('arena-shop-modal').style.display = 'none';
    if(document.getElementById('arena-modal').style.display === 'flex') loadArenaData();
}

function buyArenaItem(shopId, price) {
    if(!confirm(`Купить за ${price} монет арены?`)) return;
    let fd = new FormData(); fd.append('action', 'buy_item'); fd.append('shop_id', shopId);
    fetch('php/arena_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(data => {
        alert(data.message);
        if (data.status === 'success') openArenaShop(); 
    });
}

// === РЕЙТИНГ АРЕНЫ ===
function openArenaRating() {
    document.getElementById('arena-rating-modal').style.display = 'flex';
    const list = document.getElementById('arena-rating-list');
    list.innerHTML = '<div style="color:#777; text-align:center; padding:20px;">Загрузка топа...</div>';
    
    let fd = new FormData();
    fd.append('action', 'get_rating');
    fetch('php/arena_engine.php', { method:'POST', body: fd }).then(r=>r.json()).then(data => {
        if(data.status === 'success') {
            renderArenaRating(data.top);
        }
    });
}

function closeArenaRating() {
    document.getElementById('arena-rating-modal').style.display = 'none';
}

function renderArenaRating(top) {
    let p2 = top[1] ? `<div class="podium-slot"><div class="podium-name">${top[1].username}</div><img src="images/class_${top[1].class_type}.png"><div class="podium-base base-2">2</div></div>` : '<div class="podium-slot"></div>';
    let p1 = top[0] ? `<div class="podium-slot"><div class="podium-name" style="color:gold; font-size:13px;">${top[0].username}</div><img src="images/class_${top[0].class_type}.png" style="width:60px; height:60px;"><div class="podium-base base-1">1</div></div>` : '<div class="podium-slot"></div>';
    let p3 = top[2] ? `<div class="podium-slot"><div class="podium-name">${top[2].username}</div><img src="images/class_${top[2].class_type}.png"><div class="podium-base base-3">3</div></div>` : '<div class="podium-slot"></div>';
    
    document.getElementById('rating-podium-render').innerHTML = p2 + p1 + p3;

    const list = document.getElementById('arena-rating-list');
    list.innerHTML = '';
    
    if (top.length <= 3) {
        list.innerHTML = '<div style="color:#777; text-align:center; padding:10px;">Больше нет игроков</div>';
        return;
    }

    for (let i = 3; i < top.length; i++) {
        let p = top[i];
        let el = document.createElement('div');
        el.className = 'rating-item';
        el.innerHTML = `
            <div class="rating-pos">#${i + 1}</div>
            <div class="rating-avatar"><img src="images/class_${p.class_type}.png"></div>
            <div class="rating-info">
                <div class="rating-info-name">${p.username}</div>
                <div class="rating-info-stats">Побед: ${p.arena_wins || 0}</div>
            </div>
            <div class="rating-league-badge">Лига ${p.arena_league || 1}</div>
        `;
        list.appendChild(el);
    }
}
