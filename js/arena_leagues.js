function openArenaLeagues() {
    document.getElementById('arena-leagues-modal').style.display = 'flex';
    loadArenaLeagues();
}

function closeArenaLeagues() {
    document.getElementById('arena-leagues-modal').style.display = 'none';
}

function loadArenaLeagues() {
    const list = document.getElementById('arena-leagues-list');
    list.innerHTML = '<div style="text-align:center; color:#777; padding:20px;">Загрузка лиг...</div>';
    
    let fd = new FormData();
    fd.append('action', 'get_leagues_info');
    
    fetch('php/arena_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            list.innerHTML = '';
            let myLeagueId = parseInt(data.my_league);
            
            data.leagues.forEach(l => {
                let isCurrent = (myLeagueId === l.id);
                let isLocked = (myLeagueId < l.id);
                
                let classes = 'arena-league-item';
                if (isCurrent) classes += ' current';
                else if (isLocked) classes += ' locked';
                
                let el = document.createElement('div');
                el.className = classes;
                
                el.innerHTML = `
                    <img src="images/ui/${l.img}" class="arena-league-icon" onerror="this.src='images/ui/no_image.png'">
                    <div class="arena-league-details">
                        <div class="arena-league-name">${l.name}</div>
                        <div class="arena-league-req">Лига ${l.id}</div>
                    </div>
                    ${isCurrent ? '<div class="arena-league-current-badge">ТЕКУЩАЯ</div>' : ''}
                `;
                list.appendChild(el);
            });
        } else {
            list.innerHTML = `<div style="text-align:center; color:#e53935; padding:20px;">${data.message}</div>`;
        }
    })
    .catch(err => {
        list.innerHTML = '<div style="text-align:center; color:#e53935; padding:20px;">Ошибка сервера</div>';
    });
}
