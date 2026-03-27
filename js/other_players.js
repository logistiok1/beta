// === js/other_players.js ===
function renderOtherPlayers(players) {
    const map = document.getElementById('world-map');
    
    document.querySelectorAll('.other-player').forEach(e => e.remove());

    if (!players || players.length === 0) return;

    players.forEach(p => {
        let el = document.createElement('div');
        el.className = 'other-player';
        
        // Убрали width: 10%, теперь берется родной размер из CSS (42x42px)!
        el.style.position = 'absolute';
        el.style.zIndex = '18';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center bottom';
        el.style.transform = 'translate(-50%, -50%)'; 
        el.style.cursor = 'pointer';
        el.style.pointerEvents = 'auto'; // Включаем кликабельность
        
        let imgSrc = p.active_outfit ? `images/shmot/${p.active_outfit}` : `images/class_${p.class_type}.png`;
        el.style.backgroundImage = `url('${imgSrc}')`;
        
        const stepPercent = 100 / (window.GRID_SIZE || 20); 
        el.style.left = (p.loc_x * stepPercent) + '%';
        el.style.top = (p.loc_y * stepPercent) + '%';
        
        // Блок с именем и кланом
        let infoDiv = document.createElement('div');
        infoDiv.style.position = 'absolute';
        infoDiv.style.top = '-20px';
        infoDiv.style.width = '200px';
        infoDiv.style.left = '-79px'; // Центрируем текст над моделькой 42px
        infoDiv.style.textAlign = 'center';
        infoDiv.style.pointerEvents = 'none'; // Текст не должен перекрывать клик

        if (p.clan_name) {
            let clanDiv = document.createElement('div');
            clanDiv.className = 'clan-tag';
            clanDiv.style.color = '#FF9800';
            clanDiv.style.fontSize = '10px';
            clanDiv.style.fontWeight = 'bold';
            clanDiv.style.textShadow = '1px 1px 1px #000';
            clanDiv.innerText = `<${p.clan_name}>`;
            infoDiv.appendChild(clanDiv);
        }

        let nick = document.createElement('div');
        nick.innerText = p.username;
        nick.style.whiteSpace = 'nowrap';
        nick.style.fontSize = '11px';
        nick.style.fontWeight = 'bold';
        nick.style.color = '#fff';
        nick.style.textShadow = '1px 1px 2px #000';
        infoDiv.appendChild(nick);
        el.appendChild(infoDiv);

        // Питомец
        if (p.pet) {
            let pPet = document.createElement('div');
            pPet.style.position = 'absolute';
            pPet.style.width = '20px'; 
            pPet.style.height = '20px';
            pPet.style.bottom = '0';
            pPet.style.right = '-15px';
            pPet.style.backgroundSize = 'contain';
            pPet.style.backgroundRepeat = 'no-repeat';
            pPet.style.backgroundPosition = 'center bottom';
            pPet.style.backgroundImage = `url('images/${p.pet.img}')`;
            pPet.style.pointerEvents = 'none';
            el.appendChild(pPet);
        }

        // Крылья
        if (p.wings) {
            let wImg = document.createElement('div');
            wImg.style.position = 'absolute';
            wImg.style.width = '60px'; 
            wImg.style.height = '60px';
            wImg.style.bottom = '5px';
            wImg.style.left = '-9px';
            wImg.style.backgroundSize = 'contain';
            wImg.style.backgroundRepeat = 'no-repeat';
            wImg.style.backgroundPosition = 'center bottom';
            wImg.style.backgroundImage = `url('images/shmot/${p.wings}')`;
            wImg.style.zIndex = '-1';
            wImg.style.pointerEvents = 'none';
            el.appendChild(wImg);
        }

        el.id = 'player-' + p.id;
        
        // ВОТ РАБОЧИЙ КЛИК:
        el.onclick = function() {
            if (typeof openProfile === 'function') {
                openProfile(p.id);
            }
        };

        map.appendChild(el);
    });
}
