// js/tower.js

let currentTowerLevel = null;
let currentTowerMobMaxHp = 0;
let currentTowerMobHp = 0;
let towerAttackCD = false; // Флаг кулдауна для Башни

function openTower() {
    document.getElementById('tower-modal').style.display = 'flex';
    loadTowerLevels();
    if(typeof closeMenu === 'function') closeMenu();
}

function closeTower() {
    document.getElementById('tower-modal').style.display = 'none';
}

function loadTowerLevels() {
    const list = document.getElementById('tower-list');
    list.innerHTML = '<div style="text-align:center; margin-top:50px; color:#aaa;">Загрузка уровней...</div>';

    let fd = new FormData();
    fd.append('action', 'get_levels');

    fetch('php/tower_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        list.innerHTML = '';
        if (data.status === 'success') {
            if (data.levels.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:#777; margin-top:20px;">Нет доступных уровней</div>';
                return;
            }
            data.levels.forEach(lvl => {
                renderTowerLevel(lvl, list);
            });
        } else {
            list.innerHTML = '<div style="text-align:center; color:red; margin-top:20px;">' + data.message + '</div>';
        }
    })
    .catch(e => {
        list.innerHTML = '<div style="text-align:center; color:red; margin-top:20px;">Ошибка сервера.</div>';
        console.error(e);
    });
}

function renderTowerLevel(lvl, container) {
    let el = document.createElement('div');
    el.className = 'tower-level-card';
    if (lvl.is_locked) el.classList.add('locked');
    if (lvl.is_completed) el.classList.add('completed');

    let dropsHtml = '';
    if(lvl.drops && lvl.drops.length > 0) {
        lvl.drops.forEach(d => {
            let imgPath = (d.type === 'material') ? `images/res/${d.img}` : `images/shmot/${d.img}`;
            dropsHtml += `
                <div class="drop-preview" title="${d.name || ''}">
                    <img src="${imgPath}" onerror="this.src='images/ui/no_image.png'">
                    <div class="drop-chance">${d.chance}%</div>
                </div>
            `;
        });
    } else {
        dropsHtml = '<div style="color:#777; font-size:11px; margin-top: 10px;">Нет наград</div>';
    }

    let statusHtml = '';
    let btnDisabled = '';
    let btnText = 'В БОЙ ⚔️';

    if (lvl.is_locked) {
        statusHtml = '<div class="level-status" style="color:#777;">🔒 Недоступно</div>';
        btnDisabled = 'disabled';
    } else if (lvl.cooldown_left > 0) { 
        let h = Math.floor(lvl.cooldown_left / 3600);
        let m = Math.floor((lvl.cooldown_left % 3600) / 60);
        statusHtml = `<div class="level-status status-cd">⏳ Ждать: ${h}ч ${m}м</div>`;
        btnDisabled = 'disabled';
        btnText = 'КД';
    } else if (lvl.is_completed) {
        statusHtml = `<div class="level-status status-ready" style="color:#4CAF50;">✔ Пройдено (Можно повторить)</div>`;
        btnText = 'ПОВТОРИТЬ';
    } else {
        statusHtml = `<div class="level-status status-ready">⚡ Доступно (1 попытка)</div>`;
    }

    el.innerHTML = `
        <div class="level-header">
            <div class="level-num">Уровень ${lvl.level_number}</div>
            <div class="level-mob-name">${lvl.mob_name}</div>
        </div>
        <div class="level-body">
            <img src="images/${lvl.mob_img}" class="level-mob-img" onerror="this.src='images/ui/no_image.png'">
            <div class="level-drops">${dropsHtml}</div>
        </div>
        ${statusHtml}
        <button class="btn-tower-fight" onclick="startTowerBattle(${lvl.level_number})" ${btnDisabled}>${btnText}</button>
    `;

    container.appendChild(el);
}

function startTowerBattle(lvlNum) {
    if(!confirm(`Попытка будет списана. Начать бой (Уровень ${lvlNum})?`)) return;

    let fd = new FormData();
    fd.append('action', 'start_battle');
    fd.append('level_number', lvlNum);

    fetch('php/tower_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            closeTower();
            initTowerCombatUI(data.mob);
        } else {
            alert(data.message);
            loadTowerLevels();
        }
    });
}

function initTowerCombatUI(mobData) {
    currentTowerLevel = mobData.level_number;
    currentTowerMobMaxHp = mobData.mob_hp;
    currentTowerMobHp = mobData.mob_hp;
    towerAttackCD = false;

    const combatModal = document.getElementById('combat-modal');
    combatModal.style.display = 'flex';
    document.getElementById('d-pad').style.display = 'none';

    window.isTowerCombat = true; 
    const skillsPanel = document.getElementById('combat-skills-render');
    if (skillsPanel) skillsPanel.style.display = 'flex';
    if (typeof loadCombatSkills === 'function') loadCombatSkills();

    document.getElementById('combat-mob-img').src = 'images/' + mobData.mob_img;
    document.getElementById('combat-mob-name').innerText = mobData.mob_name; 
    document.getElementById('combat-mob-hp-bar').style.width = '100%';
    document.getElementById('combat-mob-hp-text').innerText = `${mobData.mob_hp}/${mobData.mob_hp}`;
    document.getElementById('combat-log-box').innerHTML = '<div style="color:gold; text-align:center;">БАШНЯ ГЕРОЕВ: БОЙ!</div>';

    // Перехват кнопки и сброс визуала кулдауна
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '1';
        atkBtn.style.pointerEvents = 'auto';
        let newBtn = atkBtn.cloneNode(true);
        atkBtn.parentNode.replaceChild(newBtn, atkBtn);
        newBtn.onclick = performTowerAttack;
    }
}

function sendTowerSkillDamage(dmgAmount) {
    let fd = new FormData();
    fd.append('action', 'skill_attack');
    fd.append('level_number', currentTowerLevel);
    fd.append('damage', dmgAmount);

    fetch('php/tower_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            currentTowerMobHp = data.mob_hp;
            let pct = (currentTowerMobHp / currentTowerMobMaxHp) * 100;
            document.getElementById('combat-mob-hp-bar').style.width = Math.max(0, pct) + '%';
            document.getElementById('combat-mob-hp-text').innerText = `${currentTowerMobHp}/${currentTowerMobMaxHp}`;
            
            logTowerCombat(`Вы нанесли умением: <span style="color:#4CAF50; font-weight:bold;">${dmgAmount}</span> урона`);
            
            if (data.dead) endTowerCombat(true, data.loot);
        }
    });
}

// === АТАКА В БАШНЕ (С КУЛДАУНОМ 2 СЕК) ===
function performTowerAttack() {
    if (towerAttackCD) return;

    // Включаем кулдаун
    towerAttackCD = true;
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '0.4';
        atkBtn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            towerAttackCD = false;
            if (atkBtn) {
                atkBtn.style.opacity = '1';
                atkBtn.style.pointerEvents = 'auto';
            }
        }, 2000);
    }

    const pWrap = document.getElementById('combat-player-wrap');
    const mWrap = document.getElementById('combat-mob-wrap');
    pWrap.classList.add('anim-attack-right');
    setTimeout(() => pWrap.classList.remove('anim-attack-right'), 300);
    setTimeout(() => {
        mWrap.classList.add('anim-hurt');
        setTimeout(() => mWrap.classList.remove('anim-hurt'), 400);
    }, 150);

    let fd = new FormData();
    fd.append('action', 'attack');
    fd.append('level_number', currentTowerLevel);
    fd.append('is_stunned', typeof isMobStunned !== 'undefined' && isMobStunned ? 1 : 0);

    fetch('php/tower_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            currentTowerMobHp = data.mob_hp;
            let pct = (currentTowerMobHp / currentTowerMobMaxHp) * 100;
            document.getElementById('combat-mob-hp-bar').style.width = Math.max(0, pct) + '%';
            document.getElementById('combat-mob-hp-text').innerText = `${currentTowerMobHp}/${currentTowerMobMaxHp}`;
            
            logTowerCombat(`Вы нанесли: <span style="color:#ff5252">${data.dmg}</span>`);

            if (data.dmg_taken > 0) {
                const sc = document.getElementById('game-screen');
                sc.classList.add('damaged'); setTimeout(()=>sc.classList.remove('damaged'), 300);
                document.getElementById('combat-player-hp-text').innerText = `${data.user_hp}`;
                logTowerCombat(`Вам нанесли: <span style="color:#ff5252">${data.dmg_taken}</span>`);
            }

            if (data.user_dead) {
                alert("Вы проиграли! Попытка исчерпана.");
                endTowerCombat(false, null);
                location.reload();
            }

            if (data.dead) endTowerCombat(true, data.loot);

        } else if (data.status === 'error') {
             alert(data.message); 
             endTowerCombat(false, null);
        }
    });
}

function logTowerCombat(txt) {
    const box = document.getElementById('combat-log-box');
    box.innerHTML += `<div>${txt}</div>`;
    box.scrollTop = box.scrollHeight;
}

function endTowerCombat(win, loot) {
    document.getElementById('combat-modal').style.display = 'none';
    
    window.isTowerCombat = false;
    towerAttackCD = false;
    if(typeof isMobStunned !== 'undefined') isMobStunned = false;

    const mobImg = document.getElementById('combat-mob-wrap');
    if(mobImg) mobImg.classList.remove('effect-frozen', 'effect-bleeding', 'effect-burning');
    
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '1';
        atkBtn.style.pointerEvents = 'auto';
        let newBtn = atkBtn.cloneNode(true);
        atkBtn.parentNode.replaceChild(newBtn, atkBtn);
        if (window.attackMob) {
            newBtn.onclick = window.attackMob; 
        }
    }

    if (win && loot) {
        document.getElementById('victory-modal').style.display = 'flex';
        let msg = `<div style="font-size:16px;">Золото: <span style="color:gold; font-weight:bold;">+${loot.gold}</span></div>`;
        msg += `<div style="font-size:16px;">Опыт: <span style="color:#4CAF50; font-weight:bold;">+${loot.exp}</span></div>`;
        if(loot.msg) msg += `<div style="margin-top:10px; color:#03A9F4; font-weight:bold;">${loot.msg}</div>`;
        document.getElementById('victory-loot-text').innerHTML = msg;
    } else {
        document.getElementById('d-pad').style.display = 'grid';
    }
    
    if(typeof updateState === 'function') updateState();
}
