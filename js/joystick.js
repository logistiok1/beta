// js/joystick.js v45
console.log("Joystick Core Loaded");
window.pX = 0; 
window.pY = 0;
window.activePortalId = null; 

function initGame() {
    updateState();
    // Частое обновление, чтобы видеть передвижение других и мобов
    setInterval(updateState, 3000); 
}

function updateState() {
    let fd = new FormData(); 
    fd.append('action', 'get_state');
    fd.append('in_combat', typeof inCombat !== 'undefined' ? inCombat : false);

    fetch('php/game_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            window.pX = data.x;
            window.pY = data.y;
            
            if (typeof renderWorld === 'function') renderWorld(data);
            if (typeof checkAutoCombat === 'function') checkAutoCombat(data.mobs, data.x, data.y);
        }
    });
}

function movePlayer(dx, dy) {
    if (typeof inCombat !== 'undefined' && inCombat) return;

    let fd = new FormData();
    fd.append('action', 'move'); 
    fd.append('dx', dx); 
    fd.append('dy', dy);

    fetch('php/game_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            window.pX = data.x;
            window.pY = data.y;
            updateState(); 
        } else if (data.status === 'limit') {
            console.log("Граница карты");
        }
    });
}

// === СБОР РЕСУРСОВ ===
function tryGather(res) {
    let dist = Math.max(Math.abs(window.pX - res.loc_x), Math.abs(window.pY - res.loc_y));
    // Если расстояние больше 1 клетки, просим подойти
    if (dist > 1) { 
        alert("Подойдите ближе! Встаньте вплотную или на соседнюю клетку.");
        return;
    }
    
    const modal = document.getElementById('gathering-modal');
    document.getElementById('gather-icon').src = 'images/res/' + res.img;
    
    const nameEl = document.getElementById('gather-name');
    if (nameEl) nameEl.innerText = res.name;
    
    document.getElementById('gather-btn').onclick = () => performGather(res.id);
    
    modal.style.display = 'flex';
}

function performGather(resId) {
    let fd = new FormData();
    fd.append('action', 'gather_resource');
    fd.append('resource_id', resId);

    fetch('php/game_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            alert(data.message);
            closeGathering();
            updateState();
        } else {
            alert(data.message);
        }
    });
}

// Функции для закрытия окна (на случай если в HTML используется одно из этих имен)
window.closeGathering = function() {
    const m = document.getElementById('gathering-modal');
    if (m) m.style.display = 'none';
};

window.closeGatherWindow = window.closeGathering;