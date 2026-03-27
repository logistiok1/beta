// js/skills.js
const SKILLS_DB = {
    'warrior': {
        1: { name: 'Силовой удар', img: 'war_1.png', desc: 'Наносит 5 урона сразу.' },
        2: { name: 'Режущий удар', img: 'war_2.png', desc: 'Кровотечение. Наносит 1 урон в сек (5 сек).' },
        3: { name: 'Мрачный удар', img: 'war_3.png', desc: 'Ослепляет врага на 5 сек (враг не бьет).' }
    },
    'mage': {
        1: { name: 'Огненный шар', img: 'mag_1.png', desc: 'Поджигает. Наносит 1 урон в сек (5 сек).' },
        2: { name: 'Морозный шар', img: 'mag_2.png', desc: 'Замораживает врага на 5 сек (враг не бьет).' }
    }
};

function openSkills() {
    document.getElementById('skills-modal').style.display = 'flex';
    loadSkillsTree();
    if(typeof closeMenu === 'function') closeMenu();
}

function loadSkillsTree() {
    const container = document.getElementById('skills-list-render');
    container.innerHTML = '<div style="color:white; text-align:center;">Загрузка...</div>';

    let fd = new FormData();
    fd.append('action', 'get_skills');

    fetch('php/skills_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            document.getElementById('skill-points-val').innerText = data.sp;
            renderSkillsTree(data.class_type, data.sp, data.levels, container);
        }
    });
}

function renderSkillsTree(playerClass, sp, levels, container) {
    container.innerHTML = '';
    const classSkills = SKILLS_DB[playerClass];
    if(!classSkills) return;

    for (let i = 1; i <= 3; i++) {
        if(!classSkills[i]) continue; // У мага только 2 скилла
        
        let sData = classSkills[i];
        let curLvl = levels[i];
        let nextLvl = curLvl + 1;
        let cost = nextLvl; // 1 сп за 1 лвл, 2 сп за 2 лвл...
        
        let canUpgrade = (sp >= cost) && (curLvl < 10);
        let btnText = curLvl < 10 ? `Улучшить (${cost} SP)` : 'МАКС';

        let el = document.createElement('div');
        el.className = 'skill-card';
        el.innerHTML = `
            <img src="images/skills/${sData.img}" onerror="this.src='images/ui/no_build.png'">
            <div class="skill-info">
                <div class="skill-name">${sData.name}</div>
                <div class="skill-lvl">Уровень: ${curLvl}</div>
                <div class="skill-desc">${sData.desc}<br><span style="color:gold">С каждым уровнем сила x0.5</span></div>
            </div>
            <button class="btn-skill-up" ${!canUpgrade ? 'disabled' : ''} onclick="upgradeSkill(${i})">${btnText}</button>
        `;
        container.appendChild(el);
    }
}

function upgradeSkill(skillId) {
    let fd = new FormData();
    fd.append('action', 'upgrade_skill');
    fd.append('skill_id', skillId);

    fetch('php/skills_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'success') {
            loadSkillsTree(); // Перезагружаем интерфейс
        } else {
            alert(data.message);
        }
    });
}