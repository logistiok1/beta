// js/world_boss.js

window.lastOpenedBossId = null;
window.activeWorldBossId = null;
window.wbPlayerMaxHp = 100;

let isWbStunned = false; 
let wbSkillCooldowns = { 1: false, 2: false, 3: false };
let myWbClassType = null;
let wbAttackCD = false;

// Глобальный кэш для безопасного открытия предметов (решает проблему с кавычками JSON)
window.wbCurrentDropsList = [];

function openWorldBossInfo(bossId) {
    document.getElementById('world-boss-modal').style.display = 'flex';
    document.getElementById('wb-info-content').innerHTML = '<div style="color:gold; text-align:center;">Оценка сил босса...</div>';
    window.activeWorldBossId = bossId;

    let fd = new FormData();
    fd.append('action', 'get_boss_info');
    fd.append('boss_id', bossId);

    fetch('php/world_boss_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            renderWorldBossWindow(data.boss, data.drops);
        } else {
            alert(data.message);
            closeWorldBossInfo();
        }
    });
}

function closeWorldBossInfo() {
    document.getElementById('world-boss-modal').style.display = 'none';
}

function renderWorldBossWindow(b, drops) {
    window.wbCurrentDropsList = drops; // Сохраняем лут в память для клика
    let hpPct = Math.max(0, (b.hp / b.max_hp) * 100);
    
    let html = `
        <div class="wb-title">${b.name} (Ур. ${b.level})</div>
        <div class="wb-img-frame"><img src="images/${b.img}"></div>
        
        <div class="wb-hp-container">
            <div style="color:#aaa; font-size:12px; margin-bottom:5px;">⚔️ Урон: ${b.min_damage}-${b.max_damage} | 🛡 Защита: ${b.defense}</div>
            <div class="wb-hp-bar-bg">
                <div class="wb-hp-bar-fill" style="width:${hpPct}%;"></div>
                <div class="wb-hp-text">${b.hp} / ${b.max_hp}</div>
            </div>
        </div>
        
        <div class="wb-drops-title">Возможная добыча</div>
        <div class="wb-drops-grid">
    `;

    if (drops.length === 0) {
        html += `<div style="grid-column: span 4; text-align:center; color:#777; font-size:12px;">С этого босса ничего не падает</div>`;
    } else {
        drops.forEach((d, index) => {
            let dir = d.type === 'material' ? 'res' : 'shmot';
            // Используем индекс вместо JSON.stringify
            html += `
                <div class="wb-drop-item" onclick="showWbDropItem(${index})">
                    <img src="images/${dir}/${d.img}" onerror="this.src='images/ui/no_image.png'">
                    <div class="wb-drop-chance">${d.chance}%</div>
                </div>
            `;
        });
    }

    html += `
        </div>
        <button class="btn-wb-fight" onclick="startWorldBossCombat()">В БОЙ ⚔️</button>
    `;

    document.getElementById('wb-info-content').innerHTML = html;
}

// Вызов модалки предмета по индексу
function showWbDropItem(index) {
    if(window.wbCurrentDropsList[index] && typeof showItemModal === 'function') {
        showItemModal(window.wbCurrentDropsList[index], 'readonly');
    }
}

function startWorldBossCombat() {
    closeWorldBossInfo();
    
    isWbStunned = false;
    wbAttackCD = false;
    wbSkillCooldowns = { 1: false, 2: false, 3: false };
    
    document.getElementById('wb-combat-modal').style.display = 'flex';
    document.getElementById('wb-combat-log-box').innerHTML = '<div style="color:#ff5252; text-align:center; font-weight:bold;">МИРОВОЙ БОСС: НАЧАЛО БОЯ!</div>';
    
    const mobImg = document.getElementById('wb-combat-mob-wrap');
    if(mobImg) mobImg.classList.remove('effect-frozen', 'effect-bleeding', 'effect-burning');
    
    const atkBtn = document.getElementById('btn-wb-attack-action');
    if (atkBtn) { atkBtn.style.opacity = '1'; atkBtn.style.pointerEvents = 'auto'; }
    
    let fd = new FormData();
    fd.append('action', 'get_boss_info');
    fd.append('boss_id', window.activeWorldBossId);
    
    fetch('php/world_boss_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(data => {
        if(data.status === 'success') {
            document.getElementById('wb-combat-mob-img').src = `images/${data.boss.img}`;
            document.getElementById('wb-combat-mob-name').innerText = data.boss.name;
            updateWbHpUI(data.boss.hp, data.boss.max_hp);
            
            if (data.user) {
                window.wbPlayerMaxHp = data.user.max_hp;
                updateWbPlayerHpUI(data.user.hp, data.user.max_hp);
                
                let playerImgSrc = document.getElementById('hud-avatar').src; 
                document.getElementById('wb-combat-player-img').src = playerImgSrc;
                
                myWbClassType = data.user.class_type;
                
                const wbSkills = document.getElementById('wb-combat-skills-render');
                if (wbSkills) {
                    const db = typeof SKILLS_DB !== 'undefined' ? SKILLS_DB[myWbClassType] : null;
                    if(db) {
                        let skillsHtml = '';
                        for(let i=1; i<=3; i++) {
                            if(!db[i]) continue;
                            let lvl = data.user[`skill_${i}_lvl`];
                            if(lvl > 0) {
                                skillsHtml += `
                                    <div class="c-skill-btn" id="wb-btn-skill-${i}" onclick="useWbCombatSkill(${i}, ${lvl})">
                                        <img src="images/skills/${db[i].img}" onerror="this.src='images/ui/btn_craft.png'">
                                        <div class="skill-cd-overlay" id="wb-cd-overlay-${i}"></div>
                                    </div>
                                `;
                            }
                        }
                        if (skillsHtml !== '') {
                            wbSkills.innerHTML = `<div style="display:flex; justify-content:center; gap:10px; margin-top:10px; margin-bottom:10px; position:relative; z-index:5;">${skillsHtml}</div>`;
                        } else {
                            wbSkills.innerHTML = '';
                        }
                    }
                }
            }
            
            if (data.boss.hp <= 0) {
                alert("Босс уже мертв!");
                closeWbCombat();
                if(typeof updateState === 'function') updateState();
            }
        }
    });
}

function useWbCombatSkill(skillNum, lvl) {
    if(!window.activeWorldBossId || wbSkillCooldowns[skillNum]) return;
    
    let classType = myWbClassType;
    let db = typeof SKILLS_DB !== 'undefined' ? SKILLS_DB[classType] : null;
    if(!db || !db[skillNum]) return;
    
    let skillData = db[skillNum];
    let mult = 1 + ((lvl - 1) * 0.5);

    logWbCombat(`<span style="color:cyan; font-weight:bold;">Применено: ${skillData.name} (Ур.${lvl})</span>`);

    if (classType === 'warrior') {
        if (skillNum === 1) sendWbSkillDamage(5 * mult);
        else if (skillNum === 2) applyWbDotEffect(1 * mult, 5 * mult, 'effect-bleeding', 'Кровотечение');
        else if (skillNum === 3) applyWbStunEffect(5 * mult, 'effect-frozen');
    } else if (classType === 'mage') {
        if (skillNum === 1) applyWbDotEffect(1 * mult, 5 * mult, 'effect-burning', 'Горение');
        else if (skillNum === 2) applyWbStunEffect(5 * mult, 'effect-frozen');
    }

    startWbSkillCooldown(skillNum, 30); 
}

function sendWbSkillDamage(dmgAmount) {
    if (!window.activeWorldBossId) return;

    let fd = new FormData();
    fd.append('action', 'wb_skill_attack');
    fd.append('boss_id', window.activeWorldBossId);
    fd.append('damage', dmgAmount);

    fetch('php/world_boss_engine.php', { method:'POST', body: fd }).then(r=>r.json()).then(d => {
        if(d.status === 'success') {
            updateWbHpUI(d.boss_hp, d.boss_max_hp);
            logWbCombat(`Вы нанесли умением: <span style="color:#4CAF50; font-weight:bold;">${dmgAmount}</span> урона`);
            if(d.boss_dead) {
                closeWbCombat();
                document.getElementById('victory-modal').style.display = 'flex';
                document.getElementById('victory-loot-text').innerHTML = d.loot.msg;
                if(typeof updateState === 'function') updateState();
            }
        }
    });
}

function applyWbDotEffect(dmgPerSec, durationSec, cssClass, logName) {
    let mobImg = document.getElementById('wb-combat-mob-wrap');
    if(mobImg) mobImg.classList.add(cssClass);
    
    let ticks = 0;
    let dotTimer = setInterval(() => {
        let modal = document.getElementById('wb-combat-modal');
        if (!modal || modal.style.display === 'none') {
            clearInterval(dotTimer); return; 
        }
        
        ticks++;
        sendWbSkillDamage(dmgPerSec);
        
        if (ticks >= durationSec) {
            clearInterval(dotTimer);
            if(mobImg) mobImg.classList.remove(cssClass);
        }
    }, 1000);
}

function applyWbStunEffect(durationSec, cssClass) {
    let mobImg = document.getElementById('wb-combat-mob-wrap');
    if(mobImg) mobImg.classList.add(cssClass);
    
    isWbStunned = true;
    logWbCombat(`<span style="color:#03A9F4">Враг ошеломлен на ${durationSec} сек!</span>`);
    
    setTimeout(() => {
        isWbStunned = false;
        if(mobImg) mobImg.classList.remove(cssClass);
        logWbCombat(`<span style="color:#aaa">Эффект ошеломления спал.</span>`);
    }, durationSec * 1000);
}

function startWbSkillCooldown(num, seconds) {
    wbSkillCooldowns[num] = true;
    let overlay = document.getElementById(`wb-cd-overlay-${num}`);
    if(overlay) overlay.style.display = 'flex';
    
    let left = seconds;
    let timer = setInterval(() => {
        left--;
        if(overlay) overlay.innerText = left;
        if(left <= 0) {
            clearInterval(timer);
            wbSkillCooldowns[num] = false;
            if(overlay) overlay.style.display = 'none';
        }
    }, 1000);
}

function updateWbHpUI(hp, maxHp) {
    let pct = Math.max(0, (hp / maxHp) * 100);
    document.getElementById('wb-combat-mob-hp-bar').style.width = pct + '%';
    document.getElementById('wb-combat-mob-hp-text').innerText = `${hp}/${maxHp}`;
}

function updateWbPlayerHpUI(hp, maxHp) {
    let pct = Math.max(0, (hp / maxHp) * 100);
    document.getElementById('wb-combat-player-hp-bar').style.width = pct + '%';
    document.getElementById('wb-combat-player-hp-text').innerText = `${hp}/${maxHp}`;
}

function attackWorldBossAction() {
    if (wbAttackCD) return;
    wbAttackCD = true;
    
    const atkBtn = document.getElementById('btn-wb-attack-action');
    if (atkBtn) { atkBtn.style.opacity = '0.4'; atkBtn.style.pointerEvents = 'none'; }
    
    const wbSkills = document.getElementById('wb-combat-skills-render');
    if (wbSkills) { wbSkills.style.opacity = '0.5'; wbSkills.style.pointerEvents = 'none'; }

    setTimeout(() => {
        wbAttackCD = false;
        if (atkBtn) { atkBtn.style.opacity = '1'; atkBtn.style.pointerEvents = 'auto'; }
        if (wbSkills) { wbSkills.style.opacity = '1'; wbSkills.style.pointerEvents = 'auto'; }
    }, 1500);

    const pWrap = document.getElementById('wb-combat-player-wrap');
    const mWrap = document.getElementById('wb-combat-mob-wrap');
    pWrap.classList.add('anim-attack-right');
    setTimeout(() => pWrap.classList.remove('anim-attack-right'), 300);
    setTimeout(() => { mWrap.classList.add('anim-hurt'); setTimeout(() => mWrap.classList.remove('anim-hurt'), 400); }, 150);

    let fd = new FormData();
    fd.append('action', 'attack_boss');
    fd.append('boss_id', window.activeWorldBossId);
    fd.append('is_stunned', isWbStunned ? 1 : 0);

    fetch('php/world_boss_engine.php', { method: 'POST', body: fd }).then(r=>r.json()).then(data => {
        if (data.status === 'success') {
            updateWbHpUI(data.boss_hp, data.boss_max_hp);
            
            let logHtml = `<div style="color:#fff;">Вы ударили: <span style="color:#4CAF50; font-weight:bold;">${data.dmg}</span></div>`;
            
            if (data.dmg_taken > 0) {
                updateWbPlayerHpUI(data.user_hp, data.user_max_hp);
                document.getElementById('hud-hp-text').innerText = `${data.user_hp}/${data.user_max_hp}`;
                
                mWrap.classList.add('anim-attack-left'); setTimeout(() => mWrap.classList.remove('anim-attack-left'), 300);
                logHtml += `<div style="color:#fff;">Босс ударил: <span style="color:#f44336; font-weight:bold;">${data.dmg_taken}</span></div>`;
            } else if (isWbStunned && !data.boss_dead) {
                 logHtml += `<div style="color:#aaa;">Босс оглушен и пропускает ход!</div>`;
            }
            
            const logBox = document.getElementById('wb-combat-log-box');
            logBox.innerHTML = logHtml + logBox.innerHTML;

            if (data.user_dead) {
                updateWbPlayerHpUI(0, data.user_max_hp);
                document.getElementById('hud-hp-text').innerText = `0/${data.user_max_hp}`;
                
                setTimeout(() => {
                    alert("ВЫ ПОГИБЛИ! Босс сохранил своё здоровье. Возвращайтесь позже!");
                    closeWbCombat();
                    if(typeof updateState === 'function') updateState();
                }, 500);
                
            } else if (data.boss_dead) {
                closeWbCombat();
                document.getElementById('victory-modal').style.display = 'flex';
                document.getElementById('victory-loot-text').innerHTML = data.loot.msg;
                if(typeof updateState === 'function') updateState();
            }

        } else {
            alert(data.message);
            closeWbCombat();
        }
    });
}

function logWbCombat(txt) {
    const box = document.getElementById('wb-combat-log-box');
    if(box) {
        box.innerHTML = `<div style="margin-bottom:5px;">${txt}</div>` + box.innerHTML;
    }
}

function closeWbCombat() {
    document.getElementById('wb-combat-modal').style.display = 'none';
    const mobImg = document.getElementById('wb-combat-mob-wrap');
    if(mobImg) mobImg.classList.remove('effect-frozen', 'effect-bleeding', 'effect-burning');
}
