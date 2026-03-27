// js/renderer.js
const GRID_SIZE = 50;

function renderWorld(data) {
    const map = document.getElementById('world-map');
    
    const player = document.getElementById('player-char');
    const gameScreen = document.getElementById('game-screen');
    if (player.parentElement !== gameScreen) {
        gameScreen.appendChild(player);
    }
    
    player.style.zIndex = '20'; 
    
    if(data.location) map.style.backgroundImage = `url('images/${data.location.img}')`;
    
    // === КАМЕРА ===
    let stepPercent = 100 / GRID_SIZE; 
    let playerXPercent = data.x * stepPercent;
    let playerYPercent = data.y * stepPercent;
    
    let centerX = 10; 
    let screenRatio = window.innerHeight / window.innerWidth;
    let centerY = screenRatio * 10; 
    
    let moveX = -(playerXPercent - centerX);
    let moveY = -(playerYPercent - centerY);
    
    map.style.transform = `translate(${moveX}%, ${moveY}%)`;

    // === ИГРОК ===
    let pImg = data.outfit ? `images/shmot/${data.outfit}` : `images/class_${data.class_type}.png`;
    
    player.style.backgroundImage = 'none';
    player.innerHTML = ''; 
    
    updateNameTag(player, data.username, data.clan_name);

    if (data.wings) {
        let myWings = document.createElement('div');
        myWings.style.position = 'absolute';
        myWings.style.width = '180%'; 
        myWings.style.height = '180%';
        myWings.style.top = '50%';
        myWings.style.left = '50%';
        myWings.style.transform = 'translate(-50%, -50%)';
        myWings.style.backgroundSize = 'contain';
        myWings.style.backgroundRepeat = 'no-repeat';
        myWings.style.backgroundPosition = 'center center';
        myWings.style.backgroundImage = `url('images/shmot/${data.wings}')`;
        myWings.style.zIndex = '1'; 
        myWings.style.pointerEvents = 'none';
        myWings.style.animation = 'wings-hover 3s infinite ease-in-out';
        player.appendChild(myWings);
    }

    let myBody = document.createElement('div');
    myBody.style.position = 'absolute';
    myBody.style.width = '100%';
    myBody.style.height = '100%';
    myBody.style.backgroundImage = `url('${pImg}')`;
    myBody.style.backgroundSize = 'contain';
    myBody.style.backgroundRepeat = 'no-repeat';
    myBody.style.backgroundPosition = 'center bottom';
    myBody.style.zIndex = '2'; 
    myBody.style.pointerEvents = 'none';
    player.appendChild(myBody);

    if (data.pet) {
        let myPet = document.createElement('div');
        myPet.style.position = 'absolute';
        myPet.style.width = '50%'; 
        myPet.style.height = '50%';
        myPet.style.bottom = '0';
        myPet.style.right = '-30%'; 
        myPet.style.backgroundSize = 'contain';
        myPet.style.backgroundRepeat = 'no-repeat';
        myPet.style.backgroundPosition = 'center bottom';
        myPet.style.backgroundImage = `url('images/${data.pet.img}')`;
        myPet.style.zIndex = '3';
        myPet.style.pointerEvents = 'none'; 
        player.appendChild(myPet);
    }

    player.onclick = () => { if(typeof openProfile === 'function') openProfile(data.stats.id); };

    const combatImg = document.getElementById('combat-player-img');
    if(combatImg) combatImg.src = pImg;
    
    const wbCombatImg = document.getElementById('wb-combat-player-img');
    if(wbCombatImg) wbCombatImg.src = pImg;

    document.querySelectorAll('.mob-sprite, .world-boss-sprite, .other-player, .resource-sprite, .npc-sprite, .teleport-sprite, .dungeon-sprite').forEach(e => e.remove());

    // === МОБЫ ===
    if(data.mobs) data.mobs.forEach(m => {
        let el = createEntity('mob-sprite', m.img, m.loc_x, m.loc_y);
        let nameDiv = document.createElement('div');
        nameDiv.className = 'name-tag tag-red';
        nameDiv.innerText = m.name + ' (Ур. ' + (m.level || 1) + ')'; 
        
        let offX = m.offset_x ? parseInt(m.offset_x) : 0;
        let offY = m.offset_y ? parseInt(m.offset_y) : 0;
        let fSize = m.font_size ? parseInt(m.font_size) : 0;
        
        if (offX !== 0) nameDiv.style.marginLeft = offX + 'px';
        if (offY !== 0) nameDiv.style.marginTop = offY + 'px';
        if (fSize > 0) nameDiv.style.fontSize = fSize + 'px';
        
        el.appendChild(nameDiv);
    });

    // === МИРОВЫЕ БОССЫ ===
    if(data.world_bosses) data.world_bosses.forEach(b => {
        let el = createEntity('world-boss-sprite', b.img, b.loc_x, b.loc_y, () => {
            if(typeof openWorldBossInfo === 'function') openWorldBossInfo(b.id);
        });
        
        let nameContainer = document.createElement('div');
        nameContainer.className = 'boss-name-tag'; 
        nameContainer.style.cssText = "position:absolute; left:50%; transform:translate(-50%, -100%); width:200px; text-align:center; pointer-events:none; z-index:30;";
        
        let offX = b.offset_x ? parseInt(b.offset_x) : 0;
        let offY = b.offset_y ? parseInt(b.offset_y) : 0;
        let fSize = b.font_size ? parseInt(b.font_size) : 0;
        
        if (offX !== 0) nameContainer.style.marginLeft = offX + 'px';
        if (offY !== 0) nameContainer.style.marginTop = offY + 'px';

        let innerStyle = "color:#ff5252; font-weight:bold; text-shadow:1px 1px 2px #000;";
        if (fSize > 0) innerStyle += `font-size:${fSize}px;`;
        else innerStyle += `font-size:11px;`; // Стандарт

        nameContainer.innerHTML = `<div style="${innerStyle}">(БОСС) ${b.name} <span style="color:gold;">(Ур. ${b.level})</span></div>`;
        el.appendChild(nameContainer);

        let dist = Math.max(Math.abs(data.x - b.loc_x), Math.abs(data.y - b.loc_y));
        if (dist <= 1 && window.lastOpenedBossId !== b.id) {
            window.lastOpenedBossId = b.id;
            if(typeof openWorldBossInfo === 'function') openWorldBossInfo(b.id);
        } else if (dist > 1 && window.lastOpenedBossId === b.id) {
            window.lastOpenedBossId = null;
        }
    });
    
    // РЕСУРСЫ
    if(data.resources) data.resources.forEach(r => {
        createEntity('resource-sprite', 'res/' + r.img, r.loc_x, r.loc_y, () => tryGather(r));
    });
    
    // ДРУГИЕ ИГРОКИ 
    if(data.other_players) data.other_players.forEach(p => {
        let oImg = p.active_outfit ? `images/shmot/${p.active_outfit}` : `images/class_${p.class_type}.png`;
        
        let el = document.createElement('div');
        el.className = 'other-player';
        el.style.width = '10%'; 
        el.style.height = '10%';
        el.style.position = 'absolute';
        el.style.zIndex = '18';
        el.style.transform = 'translate(-25%, -50%)'; 
        el.style.cursor = 'pointer';
        
        const stepPercent = 100 / GRID_SIZE; 
        el.style.left = (p.loc_x * stepPercent) + '%';
        el.style.top = (p.loc_y * stepPercent) + '%';

        updateNameTag(el, p.username, p.clan_name);

        if (p.wings) {
            let pWings = document.createElement('div');
            pWings.style.position = 'absolute';
            pWings.style.width = '180%';
            pWings.style.height = '180%';
            pWings.style.top = '50%';
            pWings.style.left = '50%';
            pWings.style.transform = 'translate(-50%, -50%)';
            pWings.style.backgroundSize = 'contain';
            pWings.style.backgroundRepeat = 'no-repeat';
            pWings.style.backgroundPosition = 'center center';
            pWings.style.backgroundImage = `url('images/shmot/${p.wings}')`;
            pWings.style.zIndex = '1';
            pWings.style.pointerEvents = 'none';
            pWings.style.animation = 'wings-hover 3s infinite ease-in-out';
            el.appendChild(pWings);
        }

        let body = document.createElement('div');
        body.style.position = 'absolute';
        body.style.width = '100%';
        body.style.height = '100%';
        body.style.backgroundImage = `url('${oImg}')`;
        body.style.backgroundSize = 'contain';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundPosition = 'center bottom';
        body.style.zIndex = '2';
        body.style.pointerEvents = 'none';
        el.appendChild(body);

        if (p.pet) {
            let pPet = document.createElement('div');
            pPet.style.position = 'absolute';
            pPet.style.width = '50%'; 
            pPet.style.height = '50%';
            pPet.style.bottom = '0';
            pPet.style.right = '-30%';
            pPet.style.backgroundSize = 'contain';
            pPet.style.backgroundRepeat = 'no-repeat';
            pPet.style.backgroundPosition = 'center bottom';
            pPet.style.backgroundImage = `url('images/${p.pet.img}')`;
            pPet.style.zIndex = '3';
            pPet.style.pointerEvents = 'none';
            el.appendChild(pPet);
        }

        el.onclick = () => openProfile(p.id);
        map.appendChild(el);
    });

    // НПС
    if(data.npcs) data.npcs.forEach(n => {
        let el = createEntity('npc-sprite', 'npc/' + n.img, n.loc_x, n.loc_y, () => tryInteractNPC(n.id));
        let nameContainer = document.createElement('div');
        nameContainer.className = 'npc-name-tag'; 
        nameContainer.style.cssText = "position:absolute; left:50%; transform:translate(-50%, -100%); width:150px; text-align:center; pointer-events:none; z-index:25;";
        
        let offX = n.offset_x ? parseInt(n.offset_x) : 0;
        let offY = n.offset_y ? parseInt(n.offset_y) : 0;
        let fSize = n.font_size ? parseInt(n.font_size) : 0;
        
        if (offX !== 0) nameContainer.style.marginLeft = offX + 'px';
        if (offY !== 0) nameContainer.style.marginTop = offY + 'px';

        let nameDiv = document.createElement('div');
        nameDiv.style.cssText = "color:#4CAF50; font-weight:bold; text-shadow:1px 1px 2px #000;";
        if (fSize > 0) nameDiv.style.fontSize = fSize + 'px';
        else nameDiv.style.fontSize = '13px'; // Стандарт
        
        nameDiv.innerText = n.name; 
        nameContainer.appendChild(nameDiv);
        el.appendChild(nameContainer);

        if(n.marker) {
            let m = document.createElement('div'); m.className = 'quest-marker marker-'+n.marker; m.innerText = n.marker==='yellow'?'!':'?';
            el.appendChild(m);
        }
    });

    // ДАНЖИ
    window.dungeonList = data.dungeons || [];
    if(data.dungeons) {
        data.dungeons.forEach(d => {
            let x = parseInt(d.loc_x);
            let y = parseInt(d.loc_y);
            let imgPath = d.img.includes('/') ? d.img : d.img;

            let el = createEntity('dungeon-sprite', imgPath, x, y, function() {
                if(typeof openDungeon === 'function') openDungeon(d.id);
            });
            
            let tag = document.createElement('div');
            tag.className = 'name-tag dungeon-name-tag'; 
            tag.innerText = d.name;
            
            let offX = d.offset_x ? parseInt(d.offset_x) : 0;
            let offY = d.offset_y ? parseInt(d.offset_y) : 0;
            let fSize = d.font_size ? parseInt(d.font_size) : 0;
            
            if (offX !== 0) tag.style.marginLeft = offX + 'px';
            if (offY !== 0) tag.style.marginTop = offY + 'px';
            if (fSize > 0) tag.style.fontSize = fSize + 'px';
            
            el.appendChild(tag);
        });
    }

    let onPortal = false; window.currentPortalId = null; 
    if(data.teleports) data.teleports.forEach(t => {
        createEntity('teleport-sprite', t.img, t.from_x, t.from_y);
        if(parseInt(t.from_x) === parseInt(data.x) && parseInt(t.from_y) === parseInt(data.y)) {
            onPortal = true; window.currentPortalId = t.id;
        }
    });
    const btnEnter = document.getElementById('btn-enter-portal');
    if(btnEnter) btnEnter.style.display = onPortal ? 'flex' : 'none';

    updateHUD(data.stats, data.class_type, data.storage_count, pImg);
    
    if(typeof updateNotificationIcon === 'function') updateNotificationIcon(data.unread_count);
    if(typeof updateDailyIcon === 'function') updateDailyIcon(data.daily_available);
    if(typeof updateMenuBadges === 'function') updateMenuBadges(data.pm_unread);
}

function updateNameTag(entityEl, username, clanName) {
    let container = entityEl.querySelector('.entity-info');
    if (!container) {
        container = document.createElement('div');
        container.className = 'entity-info player-name-tag'; 
        container.style.cssText = "position:absolute; left:50%; transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center; pointer-events:none; width:150px; text-align:center; z-index:25;";
        entityEl.appendChild(container);
    }
    let html = '';
    if (clanName) html += `<div style="font-size:12px; color:#FF9800; font-weight:bold; text-shadow:1px 1px 1px #000; line-height:1;">&lt;${clanName}&gt;</div>`;
    html += `<div style="font-size:14px; color:#fff; font-weight:bold; text-shadow:1px 1px 2px #000;">${username}</div>`;
    container.innerHTML = html;
}

function createEntity(cls, img, x, y, onClick) {
    let el = document.createElement('div');
    el.className = cls;
    let bgUrl = img.includes('/') ? img : (img); 
    el.style.backgroundImage = `url('images/${bgUrl}')`;
    let posX = isNaN(parseInt(x)) ? 0 : parseInt(x);
    let posY = isNaN(parseInt(y)) ? 0 : parseInt(y);
    let stepPercent = 100 / GRID_SIZE;
    el.style.left = (posX * stepPercent) + '%';
    el.style.top = (posY * stepPercent) + '%';
    
    if(onClick) {
        el.onclick = onClick;
        el.ontouchstart = onClick;
    }
    
    document.getElementById('world-map').appendChild(el);
    return el;
}

function updateHUD(s, classType, storageCount, pImg) {
    if(!s) return;
    const elLvl = document.getElementById('hud-level'); if(elLvl) elLvl.innerText = s.lvl || s.level || 1;
    const elGold = document.getElementById('hud-gold-amount'); if(elGold) elGold.innerText = s.gold;
    
    let curHp = parseInt(s.hp) || 0;
    let maxHp = parseInt(s.max_hp) || 100;
    if (curHp > maxHp) maxHp = curHp; 
    let curExp = parseInt(s.exp) || 0;
    let maxExp = parseInt(s.max_exp) || parseInt(s.next_level_exp) || 100; 
    
    const elHpText = document.getElementById('hud-hp-text'); if(elHpText) elHpText.innerText = `${curHp}/${maxHp}`;
    const elXpText = document.getElementById('hud-xp-text'); if(elXpText) elXpText.innerText = `${curExp}/${maxExp}`;

    const barHp = document.getElementById('hud-hp-bar'); if(barHp) barHp.style.width = Math.max(0, Math.min(100, (curHp / maxHp) * 100)) + '%';
    const barXp = document.getElementById('hud-xp-bar'); if(barXp) barXp.style.width = Math.max(0, Math.min(100, (curExp / maxExp) * 100)) + '%';
    
    const avatar = document.getElementById('hud-avatar'); 
    if(avatar && pImg) {
        avatar.src = pImg;
    } else if (avatar && classType) {
        avatar.src = `images/class_${classType}.png`;
    }

    let row = document.querySelector('.hud-buttons-row');
    if (row && !document.getElementById('btn-storage')) {
        let btn = document.createElement('button');
        btn.id = 'btn-storage';
        btn.className = 'daily-btn';
        btn.onclick = () => { if(typeof openStorage === 'function') openStorage(); };
        btn.innerHTML = `<img src="images/ui/btn_storage.png" class="hud-btn-img" onerror="this.src='images/ui/no_image.png'"><div id="storage-badge" class="notif-badge"></div>`;
        row.insertBefore(btn, row.firstChild);
    }
    
    // ДОБАВЛЕНО: Кнопка "Настройки" в выпадающее меню
    if (row && !document.getElementById('btn-settings')) {
        let btnSet = document.createElement('button');
        btnSet.id = 'btn-settings';
        btnSet.className = 'daily-btn';
        btnSet.onclick = () => { if(typeof openSettings === 'function') openSettings(); };
        btnSet.innerHTML = `<img src="images/ui/btn_settings.png" class="hud-btn-img" onerror="this.src='images/ui/no_image.png'">`;
        row.appendChild(btnSet);
    }
    
    const stBadge = document.getElementById('storage-badge');
    const stBtn = document.getElementById('btn-storage');
    if (stBadge && storageCount !== undefined) {
        if (storageCount > 0) {
            stBadge.style.display = 'block';
            stBtn.style.filter = 'drop-shadow(0 0 8px rgba(3,169,244,1))';
        } else {
            stBadge.style.display = 'none';
            stBtn.style.filter = 'none';
        }
    }
}
