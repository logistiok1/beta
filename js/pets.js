// js/pets.js

let currentSelectedPet = null;
let playerLevelForPets = 1;

function openPets() {
    document.getElementById('pets-modal').style.display = 'flex';
    loadPets();
    if(typeof closeMenu === 'function') closeMenu();
}

function closePets() {
    document.getElementById('pets-modal').style.display = 'none';
    document.getElementById('pet-info-panel').style.display = 'none';
}

function loadPets() {
    const list = document.getElementById('pets-list');
    const info = document.getElementById('pet-info-panel');
    list.innerHTML = '<div style="color:#777; text-align:center; width:100%; grid-column: 1 / -1; padding:20px;">Загрузка питомцев...</div>';
    info.style.display = 'none';
    
    let fd = new FormData();
    fd.append('action', 'get_pets');
    
    fetch('php/pets_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            playerLevelForPets = parseInt(data.user_level);
            renderPetsList(data.pets);
        } else {
            list.innerHTML = `<div style="color:red; text-align:center; width:100%; grid-column: 1 / -1; padding:20px;">${data.message || 'Ошибка'}</div>`;
        }
    }).catch(e => {
        list.innerHTML = '<div style="color:red; text-align:center; width:100%; grid-column: 1 / -1; padding:20px;">Ошибка связи с сервером.</div>';
    });
}

function renderPetsList(pets) {
    const list = document.getElementById('pets-list');
    list.innerHTML = '';
    
    if (!pets || pets.length === 0) {
        list.innerHTML = '<div style="color:#aaa; text-align:center; width:100%; grid-column: 1 / -1; padding:20px; background:rgba(0,0,0,0.5); border-radius:10px;">У вас нет питомцев. Яйца питомцев можно найти в подземельях или купить в магазине!</div>';
        return;
    }

    pets.forEach(p => {
        let el = document.createElement('div');
        let isSummoned = parseInt(p.is_summoned) === 1;
        el.className = 'pet-card-modern' + (isSummoned ? ' summoned' : '');
        
        el.innerHTML = `
            ${isSummoned ? '<div class="pet-badge-active">ПРИЗВАН</div>' : ''}
            <img src="images/${p.img}" class="pet-img-modern" onerror="this.src='images/ui/no_image.png'">
            <div class="pet-name-modern">${p.name}</div>
            <div class="pet-lvl-modern">Ур. ${p.level}</div>
        `;
        el.onclick = () => selectPet(p);
        list.appendChild(el);
    });
}

function selectPet(pet) {
    currentSelectedPet = pet;
    const info = document.getElementById('pet-info-panel');
    info.style.display = 'flex';
    
    let isSummoned = parseInt(pet.is_summoned) === 1;
    let btnSummonText = isSummoned ? "ОТОЗВАТЬ" : "ПРИЗВАТЬ";
    let btnSummonColor = isSummoned ? "#e53935" : "#8BC34A";
    
    let curExp = parseInt(pet.exp) || 0;
    let maxExp = parseInt(pet.next_exp) || (parseInt(pet.level) * 100);
    let expPct = Math.min(100, (curExp / maxExp) * 100);
    
    let dmg = parseInt(pet.base_dmg) * parseInt(pet.level);
    let hp = parseInt(pet.base_hp) * parseInt(pet.level);
    let def = parseInt(pet.base_def) * parseInt(pet.level);

    let disableBtn = '';
    if (!isSummoned && parseInt(pet.level) > playerLevelForPets) {
        disableBtn = 'disabled';
        btnSummonText = 'МАЛ УРОВЕНЬ';
        btnSummonColor = '#555';
    }

    info.innerHTML = `
        <div style="display:flex; gap:15px; align-items:center;">
            <img src="images/${pet.img}" style="width:70px; height:70px; object-fit:contain; filter:drop-shadow(0 0 5px rgba(255,255,255,0.3));">
            <div style="flex:1;">
                <div style="font-size:18px; font-weight:bold; color:gold; text-shadow:1px 1px 2px #000;">${pet.name} <span style="color:#aaa; font-size:12px;">(Ур. ${pet.level})</span></div>
                <div style="font-size:12px; color:#ddd; margin-top:5px;">⚔️ Урон: +${dmg} | ❤️ ХП: +${hp} | 🛡 Защита: +${def}</div>
                
                <div style="margin-top:8px;">
                    <div style="font-size:10px; color:#aaa; margin-bottom:2px;">Опыт: ${curExp}/${maxExp}</div>
                    <div style="width:100%; background:#222; height:8px; border-radius:4px; overflow:hidden; border:1px solid #444;">
                        <div style="width:${expPct}%; height:100%; background:#8BC34A;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display:flex; gap:10px; margin-top:15px;">
            <button class="btn-pet-action" style="flex:1; background:linear-gradient(180deg, ${btnSummonColor}, #33691E);" ${disableBtn} onclick="toggleSummonPet(${pet.up_id})">${btnSummonText}</button>
            <button class="btn-pet-action" style="flex:1; background:linear-gradient(180deg, #03A9F4, #01579B);" onclick="feedPet(${pet.up_id})">КОРМИТЬ (100💰)</button>
        </div>
    `;
}

function toggleSummonPet(upId) {
    let fd = new FormData();
    fd.append('action', 'toggle_summon');
    fd.append('up_id', upId);
    
    fetch('php/pets_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(d => {
        if(d.status === 'success') {
            loadPets();
            if(typeof updateState === 'function') updateState();
        } else {
            alert(d.message);
        }
    });
}

function feedPet(upId) {
    if(!confirm("Покормить питомца специальным кормом за 100 золота? (Питомец получит ОПЫТ!)")) return;
    
    let fd = new FormData();
    fd.append('action', 'feed_pet');
    fd.append('up_id', upId);
    
    fetch('php/pets_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(d => {
        if(d.status === 'success') {
            loadPets();
            if(currentSelectedPet) selectPet(d.pet); 
            if(typeof updateState === 'function') updateState();
        } else {
            alert(d.message);
        }
    });
}
