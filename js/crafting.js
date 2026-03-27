// js/crafting.js v33
let currentCraftTab = 'weapon';

function openCrafting() {
    document.getElementById('crafting-modal').style.display = 'flex';
    switchCraftTab('weapon');
    if(typeof closeMenu === 'function') closeMenu();
}

function closeCrafting() {
    document.getElementById('crafting-modal').style.display = 'none';
}

function switchCraftTab(tab) {
    currentCraftTab = tab;
    document.querySelectorAll('.craft-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('ctab-' + tab).classList.add('active');
    loadRecipes();
}

function loadRecipes() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '<div style="text-align:center; color:#777; padding:20px;">Загрузка...</div>';

    let fd = new FormData();
    fd.append('action', 'get_recipes');
    fd.append('category', currentCraftTab);

    fetch('php/crafting_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        list.innerHTML = '';
        if (data.status === 'success') {
            if (data.recipes.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:#777; padding:20px;">Нет рецептов</div>';
                return;
            }
            renderRecipes(data.recipes, list);
        } else {
            list.innerHTML = 'Ошибка';
        }
    });
}

function renderRecipes(recipes, container) {
    recipes.forEach(rec => {
        let el = document.createElement('div');
        el.className = 'craft-item';
        
        // Ингредиенты
        let matsHtml = '';
        if (rec.mats) {
            rec.mats.forEach(m => {
                let isEnough = parseInt(m.have) >= parseInt(m.needed);
                let statusClass = isEnough ? 'ok' : 'no';
                let matImgSrc = 'images/res/' + m.img; // Путь к ресурсам
                
                // Данные для клика по ресурсу
                let itemJson = JSON.stringify({
                    name: m.name,
                    img: m.img,
                    description: m.description || 'Материал для крафта',
                    type: 'material',
                    rarity: m.rarity || 'common',
                    price: 0
                }).replace(/"/g, '&quot;');

                matsHtml += `
                    <div class="mat-item" onclick="showItemModal(JSON.parse('${itemJson}'), 'readonly')">
                        <img src="${matImgSrc}">
                        <div class="mat-count ${statusClass}">${m.have}/${m.needed}</div>
                    </div>
                `;
            });
        }

        // Кнопка
        let btnClass = rec.can_craft ? 'ready' : 'locked';
        let btnText = rec.can_craft ? 'СОЗДАТЬ' : 'НЕДОСТУПНО';
        let btnAction = rec.can_craft ? `onclick="craftItem(${rec.id})"` : '';

        // === ИСПРАВЛЕНИЕ: ПЕРЕДАЕМ СТАТЫ В JSON ===
        let resItemJson = JSON.stringify({
            name: rec.name,
            img: rec.img,
            description: rec.description,
            type: rec.category,
            rarity: rec.rarity,
            damage: rec.damage,     
            defense: rec.defense,   
            hp_bonus: rec.hp_bonus, 
            price: 0 // Цену продажи не показываем тут
        }).replace(/"/g, '&quot;');

        el.innerHTML = `
            <div class="craft-header">
                <div class="craft-result-icon" onclick="showItemModal(JSON.parse('${resItemJson}'), 'readonly')">
                    <img src="images/shmot/${rec.img}">
                </div>
                <div class="craft-info">
                    <h3 class="rarity-${rec.rarity}">${rec.name}</h3>
                    <div class="craft-req-lvl">Уровень: ${rec.min_level}+</div>
                </div>
            </div>
            
            <div style="font-size:10px; color:#aaa; margin-bottom:5px;">Ресурсы:</div>
            <div class="craft-mats">${matsHtml}</div>
            
            <div class="craft-footer">
                <div class="craft-cost">Цена: ${rec.gold_cost} 💰</div>
                <button class="btn-craft ${btnClass}" ${btnAction}>${btnText}</button>
            </div>
        `;
        
        container.appendChild(el);
    });
}

function craftItem(recipeId) {
    if(!confirm('Создать предмет? Ресурсы и золото будут списаны.')) return;

    let fd = new FormData();
    fd.append('action', 'craft');
    fd.append('recipe_id', recipeId);

    fetch('php/crafting_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Предмет создан! Проверьте инвентарь.');
            loadRecipes(); // Обновить
            if(typeof updateState === 'function') updateState();
        } else {
            alert(data.message);
        }
    });
}