// js/profile_achievements.js

function renderProfileAchievements(achievements, container) {
    container.innerHTML = '';
    
    let wrap = document.createElement('div');
    wrap.className = 'prof-ach-frame';

    let title = document.createElement('div');
    title.className = 'prof-ach-title';
    title.innerText = 'ДОСТИЖЕНИЯ';
    wrap.appendChild(title);

    let grid = document.createElement('div');
    grid.className = 'prof-ach-grid';

    if (!achievements || achievements.length === 0) {
        grid.innerHTML = '<div class="prof-ach-empty">Пока нет достижений</div>';
    } else {
        achievements.forEach(ach => {
            let el = document.createElement('div');
            el.className = 'prof-ach-item';
            el.innerHTML = `<img src="${ach.icon}" onerror="this.outerHTML='<span style=\\'font-size:20px;\\'>🏆</span>';">`;
            el.onclick = () => showProfileAchievementInfo(ach);
            grid.appendChild(el);
        });
    }

    wrap.appendChild(grid);
    container.appendChild(wrap);
}

function showProfileAchievementInfo(ach) {
    let modal = document.getElementById('prof-ach-info-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'prof-ach-info-modal';
        modal.className = 'prof-ach-overlay';
        modal.innerHTML = `
            <div class="prof-ach-info-box">
                <button class="prof-ach-close" onclick="document.getElementById('prof-ach-info-modal').style.display='none'">✖</button>
                <div class="prof-ach-header">
                    <img id="p-ach-icon" src="" onerror="this.src='images/ui/btn_quests.png'">
                    <div id="p-ach-title" class="p-ach-name"></div>
                </div>
                <div id="p-ach-desc" class="p-ach-desc"></div>
                <div id="p-ach-stats" class="p-ach-stats"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('p-ach-icon').src = ach.icon;
    document.getElementById('p-ach-title').innerText = ach.title;
    document.getElementById('p-ach-desc').innerText = ach.description;

    let statsHtml = '';
    if (ach.bonus_dmg > 0) statsHtml += `<div>🗡️ Урон: <span style="color:#4CAF50;">+${ach.bonus_dmg}</span></div>`;
    if (ach.bonus_hp > 0) statsHtml += `<div>❤️ Здоровье: <span style="color:#4CAF50;">+${ach.bonus_hp}</span></div>`;
    if (ach.bonus_def > 0) statsHtml += `<div>🛡️ Защита: <span style="color:#4CAF50;">+${ach.bonus_def}</span></div>`;
    
    if (statsHtml === '') {
        statsHtml = '<div style="color:#777;">Нет бонусов к характеристикам</div>';
    }
    
    document.getElementById('p-ach-stats').innerHTML = '<div class="p-ach-stats-title">БОНУСЫ:</div>' + statsHtml;

    modal.style.display = 'flex';
}
