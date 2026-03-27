// js/dungeons.js v37
let currentDungeonId = null;
let dungeonBossData = null;
let bossFightTimer = null;
let bossAttackIntervalVal = 2000;

function openDungeon(id) {
    console.log("Open Dungeon ID:", id);
    
    // Проверка дистанции
    // Берем данные из глобального списка, который заполнил renderer.js
    let dInfo = window.dungeonList ? window.dungeonList.find(d => d.id == id) : null;
    
    if (dInfo) {
        let dist = Math.max(Math.abs(window.pX - dInfo.loc_x), Math.abs(window.pY - dInfo.loc_y));
        if (dist > 1) {
            alert("Подойдите ближе к входу! (Дист: " + dist + ")");
            return;
        }
    } else {
        console.error("Dungeon info not found in window.dungeonList");
    }

    currentDungeonId = id;
    const modal = document.getElementById('dungeon-modal');
    modal.style.display = 'flex';
    
    loadDungeonInfo();
    
    // Закрываем меню и джойстик, чтобы не мешали
    if(typeof closeMenu === 'function') closeMenu();
}

function loadDungeonInfo() {
    let fd = new FormData();
    fd.append('action', 'get_info');
    fd.append('dungeon_id', currentDungeonId);

    fetch('php/dungeon_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            dungeonBossData = data.dungeon;
            renderDungeonModal(data);
        } else {
            alert(data.message);
            closeDungeon();
        }
    })
    .catch(err => console.error(err));
}

function renderDungeonModal(data) {
    document.getElementById('boss-name-title').innerText = data.dungeon.boss_name;
    // Путь к картинке босса (images/boss_name.png)
    document.getElementById('boss-preview-img').src = 'images/' + data.dungeon.boss_img;
    
    // HP Bar
    let hpPct = (data.dungeon.boss_hp / data.dungeon.boss_max_hp) * 100;
    document.getElementById('modal-boss-hp-bar').style.width = hpPct + '%';
    document.getElementById('modal-boss-hp-text').innerText = `${data.dungeon.boss_hp} / ${data.dungeon.boss_max_hp}`;

    // Дроп
    const dropCont = document.getElementById('dungeon-drops');
    dropCont.innerHTML = '';
    if (data.drops) {
        data.drops.forEach(d => {
            // Путь к шмоту
            let src = 'images/shmot/' + d.img;
            dropCont.innerHTML += `
                <div class="drop-item">
                    <div class="drop-img"><img src="${src}"></div>
                    <div class="drop-chance">${d.chance}%</div>
                </div>
            `;
        });
    }

    // Кнопка Бой
    const btn = document.getElementById('btn-dungeon-fight');
    const statusTxt = document.getElementById('dungeon-status-text');
    
    btn.disabled = false;
    btn.onclick = startBossFight;
    statusTxt.innerHTML = '';

    if (data.is_dead) {
        btn.disabled = true;
        btn.innerText = "БОСС МЕРТВ";
        let min = Math.ceil(data.respawn_in / 60);
        statusTxt.innerHTML = `<span style="color:gray">До воскрешения: ${min} мин.</span>`;
    } 
    else if (data.user_cooldown > 0) {
        btn.disabled = true;
        btn.innerText = "ПЕРЕЗАРЯДКА";
        let min = Math.ceil(data.user_cooldown / 60);
        statusTxt.innerHTML = `<span style="color:#ef5350">Вы сможете напасть через ${min} мин.</span>`;
    }
    else {
        btn.innerText = "В БОЙ ⚔️";
    }
    
    bossAttackIntervalVal = data.dungeon.attack_interval * 1000;
}

function closeDungeon() {
    document.getElementById('dungeon-modal').style.display = 'none';
}

// === БОЕВОЙ РЕЖИМ ===
function startBossFight() {
    closeDungeon(); 
    
    const combatModal = document.getElementById('combat-modal');
    combatModal.style.display = 'flex';
    document.getElementById('d-pad').style.display = 'none';
    
    // Настройка окна боя под босса
    document.getElementById('combat-mob-img').src = 'images/' + dungeonBossData.boss_img;
    updateBossCombatBar(dungeonBossData.boss_hp, dungeonBossData.boss_max_hp);
    
    document.getElementById('combat-log-box').innerHTML = '<div style="color:red; text-align:center;">БОЙ С БОССОМ НАЧАЛСЯ!</div>';
    
    // Перехват кнопки атаки
    const atkBtn = document.querySelector('.btn-attack');
    // Удаляем старые листенеры через клон
    let newBtn = atkBtn.cloneNode(true);
    atkBtn.parentNode.replaceChild(newBtn, atkBtn);
    
    newBtn.onclick = performBossAttack; 
    
    // Таймер ударов босса
    if(bossFightTimer) clearInterval(bossFightTimer);
    bossFightTimer = setInterval(bossHitPlayer, bossAttackIntervalVal);
}

function performBossAttack() {
    let fd = new FormData();
    fd.append('action', 'attack_boss');
    fd.append('dungeon_id', currentDungeonId);

    fetch('php/dungeon_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            const icon = document.getElementById('combat-mob-icon');
            icon.classList.remove('hit'); void icon.offsetWidth; icon.classList.add('hit');
            
            updateBossCombatBar(data.boss_hp, data.boss_max_hp);
            logBossCombat(`Вы нанесли ${data.dmg} урона.`);
            
            if (data.dead) {
                endBossFight(true, data.loot);
            }
        } else {
            alert(data.message);
            endBossFight(false);
        }
    });
}

function bossHitPlayer() {
    let fd = new FormData();
    fd.append('action', 'boss_hit');
    fd.append('dungeon_id', currentDungeonId);

    fetch('php/dungeon_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            const sc = document.getElementById('game-screen');
            sc.classList.add('damaged'); setTimeout(()=>sc.classList.remove('damaged'), 300);
            
            logBossCombat(`Босс ударил вас: ${data.dmg}`);
            
            // Обновляем HP бар игрока (визуально, хотя он обновляется и так через updateState)
            // Но в бою лучше не дергать updateState лишний раз
            
            if (data.died) {
                alert("Вы погибли! Восстановление 5 минут.");
                location.reload(); 
            }
        } else {
             clearInterval(bossFightTimer);
        }
    });
}

function updateBossCombatBar(curr, max) {
    document.getElementById('combat-mob-hp-bar').style.width = (curr/max*100)+'%';
}

function logBossCombat(txt) {
    const box = document.getElementById('combat-log-box');
    box.innerHTML += `<div>${txt}</div>`;
    box.scrollTop = box.scrollHeight;
}

function endBossFight(win, loot) {
    clearInterval(bossFightTimer);
    document.getElementById('combat-modal').style.display = 'none';
    
    // Возвращаем кнопку атаки на обычных мобов
    const atkBtn = document.querySelector('.btn-attack');
    let newBtn = atkBtn.cloneNode(true);
    atkBtn.parentNode.replaceChild(newBtn, atkBtn);
    // window.attackMob должна быть определена в combat.js
    if (window.attackMob) {
        newBtn.onclick = window.attackMob; 
    }
    
    if (win && loot) {
        document.getElementById('victory-modal').style.display = 'flex';
        let msg = `Золото: ${loot.gold}<br>Опыт: ${loot.exp}`;
        if(loot.msg) msg += `<br>${loot.msg}`;
        document.getElementById('victory-loot-text').innerHTML = msg;
    } else {
        document.getElementById('d-pad').style.display = 'grid';
    }
    
    if(typeof updateState === 'function') updateState();
}