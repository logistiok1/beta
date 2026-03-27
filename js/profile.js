// === js/profile.js ===

window.showProfilePet = function(petData) {
    let overlay = document.getElementById('prof-pet-overlay-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'prof-pet-overlay-modal';
        overlay.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center; padding: 15px; box-sizing: border-box;';
        
        overlay.innerHTML = `
            <div style="width: 260px; max-width: 100%; background: #1a1a1a; border: 2px solid #FF5722; border-radius: 12px; padding: 25px 15px 15px; position: relative; color: white; text-align: center; box-shadow: 0 0 30px rgba(0,0,0,0.9), inset 0 0 15px rgba(255, 87, 34, 0.2); box-sizing: border-box;">
                <button onclick="document.getElementById('prof-pet-overlay-modal').style.display='none'" style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; background: rgba(255,255,255,0.1); border-radius: 50%; border: none; color: #aaa; font-size: 14px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: 0.2s;">✖</button>
                <img id="p-pet-modal-img" src="" style="width: 80px; height: 80px; margin-bottom: 10px; filter: drop-shadow(0 0 8px rgba(255, 87, 34, 0.8)); object-fit: contain;">
                <div id="p-pet-modal-name" style="font-size: 18px; font-weight: bold; color: #FF5722; text-transform: uppercase; margin-bottom: 2px; text-shadow: 1px 1px 2px #000;"></div>
                <div id="p-pet-modal-lvl" style="font-size: 13px; color: gold; font-weight: bold; margin-bottom: 15px;"></div>
                
                <div style="background: #111; border: 1px solid #444; border-radius: 8px; padding: 12px; margin-bottom: 5px;">
                    <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Бонусы к статам</div>
                    <div style="display: flex; justify-content: space-around; align-items: center;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 16px; margin-bottom: 3px;">❤️</span>
                            <span id="p-pet-modal-hp" style="font-size: 14px; font-weight: bold; color: #fff; text-shadow: 1px 1px 1px #000;">0</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 16px; margin-bottom: 3px;">⚔️</span>
                            <span id="p-pet-modal-dmg" style="font-size: 14px; font-weight: bold; color: #fff; text-shadow: 1px 1px 1px #000;">0</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 16px; margin-bottom: 3px;">🛡️</span>
                            <span id="p-pet-modal-def" style="font-size: 14px; font-weight: bold; color: #fff; text-shadow: 1px 1px 1px #000;">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        let closeBtn = overlay.querySelector('button');
        closeBtn.onmouseover = function() { this.style.background = '#d32f2f'; this.style.color = '#fff'; };
        closeBtn.onmouseout = function() { this.style.background = 'rgba(255,255,255,0.1)'; this.style.color = '#aaa'; };
    }
    
    document.getElementById('p-pet-modal-img').src = 'images/' + petData.img;
    document.getElementById('p-pet-modal-name').innerText = petData.name;
    document.getElementById('p-pet-modal-lvl').innerText = 'Ур. ' + petData.level;
    
    let bonusHp = (petData.base_hp || 0) * (petData.level || 1);
    let bonusDmg = (petData.base_dmg || 0) * (petData.level || 1);
    let bonusDef = (petData.base_def || 0) * (petData.level || 1);

    document.getElementById('p-pet-modal-hp').innerText = '+' + bonusHp;
    document.getElementById('p-pet-modal-dmg').innerText = '+' + bonusDmg;
    document.getElementById('p-pet-modal-def').innerText = '+' + bonusDef;
    
    overlay.style.display = 'flex';
};

window.openProfile = function(targetId) {
    let finalId = (targetId !== undefined && targetId !== null) ? targetId : ''; 

    let formData = new FormData();
    formData.append('target_id', finalId);

    fetch('php/get_profile.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            const p = data.profile;
            const r = data.relation;
            const eq = data.equipment; 
            
            let roleBadge = p.role === 'admin' ? ' <span style="color:#E91E63; font-size:12px; font-weight:bold;">(Разработчик)</span>' : '';
            
            let nameEl = document.getElementById('prof-username') || document.querySelector('.prof-name-text');
            if(nameEl) nameEl.innerHTML = p.username + roleBadge;
            
            let lvlEl = document.getElementById('prof-lvl') || document.querySelector('.prof-lvl-badge') || document.querySelector('.prof-lvl-text');
            if(lvlEl) lvlEl.innerText = 'Ур. ' + p.level;

            let hpTextEls = document.querySelectorAll('.prof-hp-text');
            hpTextEls.forEach(el => el.innerText = `${p.hp}/${p.max_hp}`);

            let hpFill = document.querySelector('.prof-hp-bar-fill') || document.getElementById('prof-hp-bar-fill');
            if(hpFill) hpFill.style.width = Math.max(0, (p.hp / p.max_hp) * 100) + '%';
            
            let hpStat = document.getElementById('prof-hp-stat');
            if(hpStat) hpStat.innerText = `${p.hp}/${p.max_hp}`;
            
            let dmgStat = document.getElementById('prof-dmg');
            if(dmgStat) dmgStat.innerText = p.damage;
            
            let defStat = document.getElementById('prof-def');
            if(defStat) defStat.innerText = p.defense;
            
            const imgEl = document.getElementById('prof-img');
            if (imgEl) {
                imgEl.src = p.active_outfit ? `images/shmot/${p.active_outfit}` : `images/class_${p.class_type}.png`;
            }
            
            const bgFrame = document.querySelector('.profile-avatar-frame');
            if (bgFrame) {
                if (p.active_background) {
                    bgFrame.style.background = `url('images/shmot/${p.active_background}') center/cover no-repeat, radial-gradient(circle, #333, #111)`;
                } else {
                    bgFrame.style.background = `url('images/ui/prof_bg.png') center/cover no-repeat, radial-gradient(circle, #333, #111)`;
                }
            }
            
            const wingsImgEl = document.getElementById('prof-wings-img');
            if (wingsImgEl) {
                if (eq['wings'] && eq['wings'].img) {
                    wingsImgEl.src = `images/shmot/${eq['wings'].img}`;
                    wingsImgEl.style.display = 'block';
                } else {
                    wingsImgEl.style.display = 'none';
                    wingsImgEl.src = '';
                }
            }

            if (data.pet) {
                document.getElementById('prof-pet-slot').innerHTML = `<img src="images/${data.pet.img}">`;
                document.getElementById('prof-pet-info').innerHTML = `<span style="color:gold; font-weight:bold;">${data.pet.name}</span><br>Ур. ${data.pet.level}`;
                
                let petBox = document.querySelector('.profile-pet-area') || document.querySelector('.prof-pet-box');
                if (petBox) {
                    petBox.style.cursor = 'pointer';
                    petBox.onclick = function() { showProfilePet(data.pet); };
                    petBox.onmouseover = function() { this.style.transform = 'scale(1.03)'; this.style.transition = 'transform 0.2s'; };
                    petBox.onmouseout = function() { this.style.transform = 'scale(1)'; };
                }
            } else {
                document.getElementById('prof-pet-slot').innerHTML = '';
                document.getElementById('prof-pet-info').innerHTML = 'Нет питомца';
                
                let petBox = document.querySelector('.profile-pet-area') || document.querySelector('.prof-pet-box');
                if (petBox) {
                    petBox.style.cursor = 'default';
                    petBox.onclick = null;
                    petBox.onmouseover = null;
                    petBox.onmouseout = null;
                }
            }

            const slots = ['head', 'body', 'legs', 'weapon', 'amulet', 'ring', 'wings'];
            slots.forEach(slotType => {
                const slotDiv = document.getElementById(`slot-${slotType}`);
                if (slotDiv) {
                    slotDiv.innerHTML = ''; 
                    slotDiv.className = slotDiv.className.replace(/\brarity-\S+/g, '');
                    slotDiv.onclick = null; 
                    slotDiv.style.position = 'relative';

                    if (eq[slotType] && eq[slotType].id) {
                        let item = eq[slotType];
                        let imgUrl = item.type === 'material' ? `images/res/${item.img}` : `images/shmot/${item.img}`;
                        
                        let img = document.createElement('img');
                        img.src = imgUrl;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        slotDiv.appendChild(img);
                        
                        if(item.upgrade_level && parseInt(item.upgrade_level) > 0) {
                            let badge = document.createElement('div');
                            badge.style.cssText = 'position:absolute; top:2px; right:2px; background:rgba(211,47,47,0.9); color:white; font-size:10px; font-weight:bold; padding:1px 4px; border-radius:4px; border:1px solid #ff5252; box-shadow:0 0 5px #000; z-index:5;';
                            badge.innerText = '+' + item.upgrade_level;
                            slotDiv.appendChild(badge);
                        }
                        
                        slotDiv.classList.add(`rarity-${item.rarity || 'common'}`);
                        slotDiv.onclick = () => {
                            if(typeof showItemModal === 'function') {
                                showItemModal(item, r.is_self ? 'equipped' : 'readonly');
                            }
                        };
                    }
                }
            });

            let achContainer = document.getElementById('prof-achievements-container');
            if (!achContainer) {
                achContainer = document.createElement('div');
                achContainer.id = 'prof-achievements-container';
                const actionsDiv = document.getElementById('profile-actions');
                if (actionsDiv) {
                    actionsDiv.parentNode.insertBefore(achContainer, actionsDiv);
                }
            }
            
            if (typeof renderProfileAchievements === 'function') {
                renderProfileAchievements(data.achievements, achContainer);
            }

            const actionsDiv = document.getElementById('profile-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = ''; 

                if (!r.is_self) {
                    // === ИСПРАВЛЕНА КНОПКА ЛС ===
                    let pmBtn = document.createElement('button');
                    pmBtn.className = 'btn-prof-modern btn-pm';
                    pmBtn.innerHTML = '✉ ЛС';
                    pmBtn.onclick = function() { 
                        closeProfile(); 
                        if(typeof openPM === 'function') openPM(p.id, p.username); 
                    };
                    actionsDiv.appendChild(pmBtn);

                    let fBtn = document.createElement('button');
                    fBtn.className = 'btn-prof-modern';
                    if (r.is_friend) {
                        fBtn.innerHTML = '✔ В друзьях'; 
                        fBtn.classList.add('btn-friend-ready'); 
                        fBtn.disabled = true;
                    } else if (r.request_sent) {
                        fBtn.innerHTML = '⏳ Ожидание'; 
                        fBtn.classList.add('btn-friend-wait'); 
                        fBtn.disabled = true;
                    } else if (r.request_received) {
                        fBtn.innerHTML = '➕ Принять'; 
                        fBtn.classList.add('btn-friend-ready');
                        fBtn.onclick = function() { handleRequest(p.id, 'accept'); closeProfile(); };
                    } else {
                        fBtn.innerHTML = '➕ Дружить'; 
                        fBtn.classList.add('btn-friend');
                        fBtn.onclick = function() { addFriend(p.id); closeProfile(); };
                    }
                    actionsDiv.appendChild(fBtn);
                }
            }

            document.getElementById('profile-modal').style.display = 'flex';
            if(typeof closeMenu === 'function') closeMenu();

        } else {
            alert(data.message);
        }
    });
};

window.closeProfile = function() {
    document.getElementById('profile-modal').style.display = 'none';
};
