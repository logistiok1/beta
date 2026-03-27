// js/combat.js v73 (Basic Attack Cooldown Added)
let inCombat = false;
let currentMobId = null;
let attackTimer = null;

// Переменные для умений и атаки
let isMobStunned = false; 
let skillCooldowns = { 1: false, 2: false, 3: false };
let myCombatSkills = null;
let basicAttackCD = false; // Флаг кулдауна обычной атаки

function checkAutoCombat(mobs, px, py) {
    if (inCombat) return;
    if (!mobs) return;

    mobs.forEach(mob => {
        let dx = Math.abs(px - mob.loc_x);
        let dy = Math.abs(py - mob.loc_y);
        if (dx <= 1 && dy <= 1) {
            startCombat(mob);
        }
    });
}

function startCombat(mob) {
    inCombat = true;
    currentMobId = mob.id;
    isMobStunned = false;
    basicAttackCD = false; // Сбрасываем кулдаун при начале
    window.isTowerCombat = false; 
    
    // Сбрасываем визуал кнопки атаки
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '1';
        atkBtn.style.pointerEvents = 'auto';
    }

    document.getElementById('combat-modal').style.display = 'flex';
    document.getElementById('combat-mob-img').src = 'images/' + mob.img;
    document.getElementById('combat-mob-name').innerText = mob.name;
    document.getElementById('combat-mob-wrap').className = 'combat-avatar-wrap'; 
    
    let playerImgSrc = document.getElementById('hud-avatar').src; 
    document.getElementById('combat-player-img').src = playerImgSrc;
    
    document.getElementById('d-pad').style.display = 'none';
    const btnP = document.getElementById('btn-enter-portal'); 
    if(btnP) btnP.style.display = 'none';

    updateMobCombatBar(mob.hp, mob.max_hp);
    
    let hpText = document.getElementById('hud-hp-text').innerText.split('/');
    let curHp = parseInt(hpText[0]) || 100;
    let maxHp = parseInt(hpText[1]) || 100;
    updatePlayerCombatBar(curHp, maxHp);
    
    document.getElementById('combat-log-box').innerHTML = '<div style="color:#ffeb3b; font-size:16px;">Бой начался!</div>';
    
    loadCombatSkills();

    if(attackTimer) clearInterval(attackTimer);
    attackTimer = setInterval(mobHit, (mob.attack_interval || 2) * 1000);
}

function loadCombatSkills() {
    let fd = new FormData(); fd.append('action', 'get_skills');
    fetch('php/skills_engine.php', {method: 'POST', body: fd}).then(r=>r.json()).then(data => {
        if(data.status === 'success') {
            myCombatSkills = data;
            const container = document.getElementById('combat-skills-render');
            container.innerHTML = '';
            
            const db = typeof SKILLS_DB !== 'undefined' ? SKILLS_DB[data.class_type] : null;
            if(!db) return;

            for(let i=1; i<=3; i++) {
                if(!db[i]) continue;
                let lvl = data.levels[i];
                if(lvl > 0) {
                    let btn = document.createElement('div');
                    btn.className = 'c-skill-btn';
                    btn.id = `combat-btn-skill-${i}`;
                    btn.onclick = () => useCombatSkill(i, db[i], lvl);
                    btn.innerHTML = `
                        <img src="images/skills/${db[i].img}" onerror="this.src='images/ui/btn_craft.png'">
                        <div class="skill-cd-overlay" id="cd-overlay-${i}"></div>
                    `;
                    container.appendChild(btn);
                }
            }
        }
    });
}

function useCombatSkill(skillNum, skillData, lvl) {
    if((!inCombat && !window.isTowerCombat) || skillCooldowns[skillNum]) return;
    
    let mult = 1 + ((lvl - 1) * 0.5);
    let classType = myCombatSkills.class_type;

    let logFunc = window.isTowerCombat ? (typeof logTowerCombat === 'function' ? logTowerCombat : logCombat) : logCombat;
    logFunc(`<span style="color:cyan; font-weight:bold;">Применено: ${skillData.name} (Ур.${lvl})</span>`);

    if (classType === 'warrior') {
        if (skillNum === 1) sendSkillDamage(5 * mult);
        else if (skillNum === 2) applyDotEffect(1 * mult, 5 * mult, 'effect-bleeding', 'Кровотечение');
        else if (skillNum === 3) applyStunEffect(5 * mult, 'effect-frozen');
    } else if (classType === 'mage') {
        if (skillNum === 1) applyDotEffect(1 * mult, 5 * mult, 'effect-burning', 'Горение');
        else if (skillNum === 2) applyStunEffect(5 * mult, 'effect-frozen');
    }

    startSkillCooldown(skillNum, 30); 
}

function sendSkillDamage(dmgAmount) {
    if (window.isTowerCombat) {
        if (typeof sendTowerSkillDamage === 'function') sendTowerSkillDamage(dmgAmount);
        return;
    }

    if (!currentMobId) return;

    let fd = new FormData();
    fd.append('action', 'skill_attack');
    fd.append('mob_id', currentMobId);
    fd.append('damage', dmgAmount);

    fetch('php/skills_engine.php', { method:'POST', body: fd }).then(r=>r.json()).then(d => {
        if(d.status === 'success') {
            updateMobCombatBar(d.mob_hp, d.mob_max_hp);
            logCombat(`Вы нанесли умением: <span style="color:#4CAF50; font-weight:bold;">${dmgAmount}</span> урона`);
            if(d.dead) endCombat(true, d.loot);
        }
    });
}

function applyDotEffect(dmgPerSec, durationSec, cssClass, logName) {
    let mobImg = document.getElementById('combat-mob-wrap');
    if(mobImg) mobImg.classList.add(cssClass);
    
    let ticks = 0;
    let dotTimer = setInterval(() => {
        if (!inCombat && !window.isTowerCombat) { clearInterval(dotTimer); return; }
        
        ticks++;
        sendSkillDamage(dmgPerSec);
        
        if (ticks >= durationSec) {
            clearInterval(dotTimer);
            if(mobImg) mobImg.classList.remove(cssClass);
        }
    }, 1000);
}

function applyStunEffect(durationSec, cssClass) {
    let mobImg = document.getElementById('combat-mob-wrap');
    if(mobImg) mobImg.classList.add(cssClass);
    
    isMobStunned = true;
    let logFunc = window.isTowerCombat ? (typeof logTowerCombat === 'function' ? logTowerCombat : logCombat) : logCombat;
    logFunc(`<span style="color:#03A9F4">Враг ошеломлен на ${durationSec} сек!</span>`);
    
    setTimeout(() => {
        isMobStunned = false;
        if(mobImg) mobImg.classList.remove(cssClass);
        logFunc(`<span style="color:#aaa">Эффект ошеломления спал.</span>`);
    }, durationSec * 1000);
}

function startSkillCooldown(num, seconds) {
    skillCooldowns[num] = true;
    let overlay = document.getElementById(`cd-overlay-${num}`);
    if(overlay) overlay.style.display = 'flex';
    
    let left = seconds;
    let timer = setInterval(() => {
        left--;
        if(overlay) overlay.innerText = left;
        if(left <= 0) {
            clearInterval(timer);
            skillCooldowns[num] = false;
            if(overlay) overlay.style.display = 'none';
        }
    }, 1000);
}

// === ОБЫЧНАЯ АТАКА (С КУЛДАУНОМ 2 СЕК) ===
function attackMob() {
    if (!inCombat || !currentMobId || basicAttackCD) return;

    // Включаем кулдаун
    basicAttackCD = true;
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '0.4';
        atkBtn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            basicAttackCD = false;
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
    fd.append('action', 'attack_mob');
    fd.append('mob_id', currentMobId);

    fetch('php/game_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            if (data.mob_hp !== undefined && data.mob_max_hp !== undefined) updateMobCombatBar(data.mob_hp, data.mob_max_hp);
            if (data.dmg !== undefined) logCombat(`Вы нанесли: <span style="color:#4CAF50; font-weight:bold;">${data.dmg}</span> урона`);
            if (data.dead || data.message === 'Моб мертв') endCombat(true, data.loot);
        } else {
            if (data.message === 'Моб мертв') endCombat(true, null);
        }
    });
}

function mobHit() {
    if(!inCombat || !currentMobId || isMobStunned) return;
    
    let fd = new FormData();
    fd.append('action', 'mob_attack'); 
    fd.append('mob_id', currentMobId);

    fetch('php/game_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            if (data.dmg_taken > 0) {
                logCombat(`Моб нанес вам: <span style="color:#f44336; font-weight:bold;">${data.dmg_taken}</span> урона`);
                
                const mWrap = document.getElementById('combat-mob-wrap');
                const pWrap = document.getElementById('combat-player-wrap');
                
                mWrap.classList.add('anim-attack-left');
                setTimeout(() => mWrap.classList.remove('anim-attack-left'), 300);
                
                setTimeout(() => {
                    pWrap.classList.add('anim-hurt');
                    setTimeout(() => pWrap.classList.remove('anim-hurt'), 400);
                }, 150);

                if (data.user_hp !== undefined) {
                    let maxHp = parseInt(document.getElementById('hud-hp-text').innerText.split('/')[1]);
                    updatePlayerCombatBar(data.user_hp, maxHp);
                    
                    document.getElementById('hud-hp-text').innerText = `${data.user_hp}/${maxHp}`;
                    document.getElementById('hud-hp-bar').style.width = Math.max(0, (data.user_hp / maxHp) * 100) + '%';
                }
            }
            if (data.user_dead) endCombat(false, null);
        } else {
            if (data.message === 'Моб мертв') endCombat(true, null);
        }
    });
}

function updateMobCombatBar(curr, max) {
    document.getElementById('combat-mob-hp-bar').style.width = Math.max(0, (curr/max*100))+'%';
    document.getElementById('combat-mob-hp-text').innerText = `${curr}/${max}`;
}

function updatePlayerCombatBar(curr, max) {
    document.getElementById('combat-player-hp-bar').style.width = Math.max(0, (curr/max*100))+'%';
    document.getElementById('combat-player-hp-text').innerText = `${curr}/${max}`;
}

function logCombat(txt) {
    const box = document.getElementById('combat-log-box');
    if(box) {
        box.innerHTML += `<div style="margin-bottom:5px;">${txt}</div>`;
        box.scrollTop = box.scrollHeight;
    }
}

function endCombat(win, loot) {
    inCombat = false;
    currentMobId = null;
    isMobStunned = false; 
    basicAttackCD = false;
    
    const mobImg = document.getElementById('combat-mob-wrap');
    if(mobImg) mobImg.classList.remove('effect-frozen', 'effect-bleeding', 'effect-burning');

    // Восстанавливаем кнопку атаки после боя
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '1';
        atkBtn.style.pointerEvents = 'auto';
    }

    if(attackTimer) clearInterval(attackTimer);
    document.getElementById('combat-modal').style.display = 'none';
    
    if(win && loot) {
        document.getElementById('victory-modal').style.display = 'flex';
        let msg = `<div style="font-size:16px;">Золото: <span style="color:gold; font-weight:bold;">+${loot.gold}</span></div>`;
        msg += `<div style="font-size:16px;">Опыт: <span style="color:#4CAF50; font-weight:bold;">+${loot.exp}</span></div>`;
        if(loot.msg) msg += `<div style="margin-top:10px; color:#03A9F4; font-weight:bold;">${loot.msg}</div>`;
        document.getElementById('victory-loot-text').innerHTML = msg;
    } else if (!win && loot === null) {
        document.getElementById('d-pad').style.display = 'grid';
        if (typeof updateState === 'function') updateState();
    } else {
        document.getElementById('defeat-modal').style.display = 'flex';
    }
}

function fleeCombat() {
    if(!confirm("Убежать с поля боя?")) return;
    inCombat = false;
    currentMobId = null;
    basicAttackCD = false;
    if(attackTimer) clearInterval(attackTimer);
    document.getElementById('combat-modal').style.display = 'none';
    
    const atkBtn = document.querySelector('.btn-sword-attack');
    if (atkBtn) {
        atkBtn.style.opacity = '1';
        atkBtn.style.pointerEvents = 'auto';
    }

    document.getElementById('d-pad').style.display = 'grid';
    if (typeof updateState === 'function') updateState();
}

function closeVictory() {
    document.getElementById('victory-modal').style.display = 'none';
    document.getElementById('d-pad').style.display = 'grid';
    if (typeof updateState === 'function') updateState();
}

function closeDefeat() {
    document.getElementById('defeat-modal').style.display = 'none';
    location.reload(); 
}
