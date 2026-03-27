// js/achievements.js
function openAchievements() {
    document.getElementById('achievements-modal').style.display = 'flex';
    loadAchievements();
    if(typeof closeMenu === 'function') closeMenu();
}

function closeAchievements() {
    document.getElementById('achievements-modal').style.display = 'none';
}

function loadAchievements() {
    const grid = document.getElementById('achiev-grid-render');
    grid.innerHTML = '<div style="color:white; grid-column:span 4; text-align:center;">Загрузка...</div>';

    let fd = new FormData();
    fd.append('action', 'get_achievements');

    fetch('php/achievements_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        grid.innerHTML = '';
        if (data.status === 'success') {
            if(data.achievements.length === 0) {
                grid.innerHTML = '<div style="color:#aaa; grid-column:span 4; text-align:center;">Достижения еще не добавлены в игру.</div>';
                return;
            }
            
            data.achievements.forEach(ach => {
                let isCompleted = parseInt(ach.is_completed) === 1;
                let el = document.createElement('div');
                el.className = 'achiev-item ' + (isCompleted ? 'achiev-unlocked' : 'achiev-locked');
                
                // Если картинки нет, показываем красивый эмодзи трофея
                el.innerHTML = `<img src="${ach.icon}" onerror="this.outerHTML='<span style=\\'font-size:35px;\\'>🏆</span>';">`;
                
                el.onclick = () => showAchievementInfo(ach);
                grid.appendChild(el);
            });
        }
    });
}

function showAchievementInfo(ach) {
    document.getElementById('achiev-info-modal').style.display = 'flex';
    
    document.getElementById('achiev-info-title').innerText = ach.title;
    document.getElementById('achiev-info-desc').innerText = ach.description;
    
    let iconEl = document.getElementById('achiev-info-icon');
    iconEl.src = ach.icon;
    iconEl.onerror = function() { this.src = 'images/ui/btn_quests.png'; }; 
    
    let isCompleted = parseInt(ach.is_completed) === 1;
    iconEl.style.filter = isCompleted ? 'none' : 'grayscale(100%) brightness(0.5)';
    
    document.getElementById('achiev-info-progress').innerText = `Прогресс: ${ach.progress} / ${ach.cond_value}`;
    document.getElementById('achiev-info-progress').style.color = isCompleted ? '#4CAF50' : '#FF9800';
}

function closeAchievInfo() {
    document.getElementById('achiev-info-modal').style.display = 'none';
}